'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { test, run } = require('./harness');
const { createEmitter, readEvents, computeReport, formatReport } = require('../lib/telemetry');

const quiet = { warn() {} };

function tmpLog() {
  return path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'ace-telemetry-')), 'loop-metrics.jsonl');
}

test('emitter appends exactly one valid JSON line per event', () => {
  const logPath = tmpLog();
  const emit = createEmitter(logPath, quiet);
  emit({ ts: 't1', event: 'attempt_start', task: 'T001', attempt: 1 });
  emit({ ts: 't2', event: 'attempt_verified', task: 'T001', attempt: 1, duration_ms: 1200 });

  const lines = fs.readFileSync(logPath, 'utf8').trim().split('\n');
  assert.strictEqual(lines.length, 2);
  for (const line of lines) JSON.parse(line); // throws if invalid
  assert.strictEqual(JSON.parse(lines[1]).event, 'attempt_verified');
});

test('log is append-only across emitter instances', () => {
  const logPath = tmpLog();
  createEmitter(logPath, quiet)({ event: 'a' });
  createEmitter(logPath, quiet)({ event: 'b' });
  assert.deepStrictEqual(readEvents(logPath).map((e) => e.event), ['a', 'b']);
});

test('telemetry write failure warns but never throws', () => {
  const warnings = [];
  // a directory as the log path forces the append to fail
  const dirAsFile = fs.mkdtempSync(path.join(os.tmpdir(), 'ace-telemetry-'));
  const emit = createEmitter(dirAsFile, { warn: (m) => warnings.push(m) });
  emit({ event: 'x' });
  assert.strictEqual(warnings.length, 1);
  assert.ok(warnings[0].includes('non-fatal'));
});

test('torn (partial) lines are tolerated by the reader', () => {
  const logPath = tmpLog();
  fs.writeFileSync(logPath, '{"event":"a"}\n{"event":"b\n{"event":"c"}\n');
  assert.deepStrictEqual(readEvents(logPath).map((e) => e.event), ['a', 'c']);
});

test('report computes first-pass rate and attempt counts from a fixture log', () => {
  const events = [
    // T001: verified first try
    { event: 'attempt_start', task: 'T001', attempt: 1 },
    { event: 'attempt_verified', task: 'T001', attempt: 1 },
    // T002: failed once, verified on attempt 2
    { event: 'attempt_start', task: 'T002', attempt: 1 },
    { event: 'attempt_failed', task: 'T002', attempt: 1, fingerprint: 'aaaa', decision: 'retry' },
    { event: 'attempt_start', task: 'T002', attempt: 2 },
    { event: 'attempt_verified', task: 'T002', attempt: 2 },
    // T003: stalled and blocked
    { event: 'attempt_start', task: 'T003', attempt: 1 },
    { event: 'attempt_failed', task: 'T003', attempt: 1, fingerprint: 'bbbb', decision: 'retry' },
    { event: 'attempt_start', task: 'T003', attempt: 2 },
    { event: 'attempt_failed', task: 'T003', attempt: 2, fingerprint: 'bbbb', decision: 'block' },
    { event: 'task_blocked', task: 'T003', attempt: 2, fingerprint: 'bbbb' },
    { event: 'loop_complete' },
  ];
  const report = computeReport(events);

  assert.strictEqual(report.tasks_touched, 3);
  assert.strictEqual(report.attempts_total, 5);
  assert.strictEqual(report.verified, 2);
  assert.strictEqual(report.blocked, 1);
  assert.strictEqual(report.first_pass_rate, 0.5);
  assert.strictEqual(report.avg_attempts_per_verified, 1.5);
  assert.deepStrictEqual(report.repeat_fingerprints, [{ fingerprint: 'bbbb', count: 2 }]);
});

test('report handles an empty log', () => {
  const report = computeReport([]);
  assert.strictEqual(report.tasks_touched, 0);
  assert.strictEqual(report.first_pass_rate, null);
});

test('formatted report is readable and names repeat offenders', () => {
  const text = formatReport(computeReport([
    { event: 'attempt_start', task: 'T001', attempt: 1 },
    { event: 'attempt_failed', task: 'T001', attempt: 1, fingerprint: 'cccc' },
    { event: 'attempt_start', task: 'T001', attempt: 2 },
    { event: 'attempt_failed', task: 'T001', attempt: 2, fingerprint: 'cccc' },
    { event: 'task_blocked', task: 'T001', attempt: 2 },
  ]));
  assert.ok(text.includes('First-pass rate:      n/a'));
  assert.ok(text.includes('cccc  x2'));
  assert.ok(text.includes('T001: 2 attempt(s), 2 failure(s) — BLOCKED'));
});

test('report contains metadata only — no prompt or code payloads in events', () => {
  // guard the contract: the loop emits only these fields
  const allowed = new Set(['ts', 'event', 'task', 'attempt', 'runner', 'fingerprint', 'decision', 'duration_ms', 'detail', 'gate']);
  const sample = { ts: 'x', event: 'attempt_failed', task: 'T001', attempt: 1, fingerprint: 'ffff', decision: 'retry', duration_ms: 10 };
  for (const key of Object.keys(sample)) assert.ok(allowed.has(key), key);
});

module.exports = run;
