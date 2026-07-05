'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { PassThrough } = require('stream');
const { test, run } = require('./harness');
const { getRunner, listRunners, loadRunners } = require('../lib/runners');
const manual = require('../lib/runners/manual');
const claudeCode = require('../lib/runners/claude-code');

function tmpTrace() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ace-runner-'));
  return path.join(dir, 'trace.md');
}

// --- registry ---

test('registry discovers the shipped adapters', () => {
  const names = listRunners();
  assert.ok(names.includes('manual'), names.join(', '));
  assert.ok(names.includes('claude-code'), names.join(', '));
});

test('every shipped adapter satisfies the ADR-002 interface', () => {
  for (const [name, adapter] of loadRunners()) {
    assert.strictEqual(typeof adapter.name, 'string', `${name}: name`);
    assert.strictEqual(adapter.name, name, `${name}: registry key matches`);
    assert.strictEqual(typeof adapter.isAvailable, 'function', `${name}: isAvailable`);
    assert.strictEqual(typeof adapter.run, 'function', `${name}: run`);
    const availability = adapter.isAvailable();
    assert.strictEqual(typeof availability.ok, 'boolean', `${name}: isAvailable().ok`);
    if (!availability.ok) {
      assert.ok(availability.reason.length > 10, `${name}: unavailability reason is actionable`);
    }
  }
});

test('unknown runner name raises an error listing available runners', () => {
  assert.throws(() => getRunner('does-not-exist'), (err) => {
    assert.ok(err.message.includes('Unknown runner "does-not-exist"'));
    assert.ok(err.message.includes('manual'));
    return true;
  });
});

// --- manual runner ---

test('manual runner round-trips: prints prompt, waits for Enter, writes trace', async () => {
  const input = new PassThrough();
  const output = new PassThrough();
  let printed = '';
  output.on('data', (chunk) => { printed += chunk.toString(); });

  const runner = manual._create({ input, output });
  const traceFile = tmpTrace();
  const pending = runner.run({
    prompt: 'THE ASSEMBLED PROMPT', taskId: 'T001', attempt: 1, cwd: process.cwd(), traceFile,
  });

  // the prompt must be visible before we ever press Enter
  await new Promise((r) => setTimeout(r, 20));
  assert.ok(printed.includes('THE ASSEMBLED PROMPT'), 'prompt printed before Enter');
  input.write('\n');

  const result = await pending;
  assert.strictEqual(result.ok, true);
  const trace = fs.readFileSync(traceFile, 'utf8');
  assert.ok(trace.includes('Manual session: T001 attempt 1'));
  assert.ok(trace.includes('THE ASSEMBLED PROMPT'));
});

test('manual runner is always available', () => {
  assert.deepStrictEqual(manual.isAvailable(), { ok: true });
});

// --- claude-code runner ---

test('claude-code builds the headless invocation with the prompt on stdin', async () => {
  const spawnCalls = [];
  const fake = (command, args, opts) => {
    spawnCalls.push({ command, args, opts });
    return { status: 0, stdout: 'agent transcript here', stderr: '' };
  };
  const runner = claudeCode._create(fake);
  const traceFile = tmpTrace();
  const result = await runner.run({
    prompt: 'DO THE TASK', taskId: 'T002', attempt: 3, cwd: '/proj', traceFile,
  });

  assert.strictEqual(result.ok, true);
  assert.strictEqual(result.output, 'agent transcript here');
  const call = spawnCalls[0];
  assert.strictEqual(call.command, 'claude');
  assert.deepStrictEqual(call.args, ['-p']);
  assert.strictEqual(call.opts.input, 'DO THE TASK', 'prompt travels via stdin');
  assert.strictEqual(call.opts.cwd, '/proj');

  const trace = fs.readFileSync(traceFile, 'utf8');
  assert.ok(trace.includes('Claude Code session: T002 attempt 3'));
  assert.ok(trace.includes('DO THE TASK'));
  assert.ok(trace.includes('agent transcript here'));
});

test('claude-code degrades gracefully when the binary is absent', () => {
  const fake = () => ({ error: new Error('spawn claude ENOENT'), status: null });
  const runner = claudeCode._create(fake);
  const availability = runner.isAvailable();
  assert.strictEqual(availability.ok, false);
  assert.ok(availability.reason.includes('manual'), 'points at the manual fallback');
});

test('claude-code reports a non-zero agent exit as a runner failure with stderr tail', async () => {
  const fake = (command, args, opts) => {
    if (args[0] === '--version') return { status: 0, stdout: '2.0.0' };
    return { status: 1, stdout: '', stderr: 'error: not logged in\nrun claude login' };
  };
  const runner = claudeCode._create(fake);
  const result = await runner.run({
    prompt: 'x', taskId: 'T001', attempt: 1, cwd: '.', traceFile: tmpTrace(),
  });
  assert.strictEqual(result.ok, false);
  assert.ok(result.output.includes('exited 1'));
  assert.ok(result.output.includes('not logged in'));
});

module.exports = run;
