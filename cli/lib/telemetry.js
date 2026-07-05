/**
 * telemetry.js — loop metrics (Implementation Plan v2.7, T009).
 *
 * One JSON line per loop event, appended to .ace/feedback/loop-metrics.jsonl.
 * Metadata only — never prompts, code, or trace contents. Telemetry must
 * never break the loop: a failed write warns and continues.
 *
 * The report answers the question the whole update exists for: is the
 * harness actually getting better? First-pass rate and repeat-failure
 * fingerprints are the evidence.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const DEFAULT_LOG_REL = path.join('.ace', 'feedback', 'loop-metrics.jsonl');

/**
 * Create an onEvent sink for the loop. Events are enriched with ts by the
 * loop; this sink only serializes and appends.
 */
function createEmitter(logPath, log) {
  const warn = (msg) => { if (log && log.warn) log.warn(msg); };
  return function emit(event) {
    try {
      fs.mkdirSync(path.dirname(logPath), { recursive: true });
      fs.appendFileSync(logPath, `${JSON.stringify(event)}\n`);
    } catch (err) {
      warn(`telemetry write failed (non-fatal): ${err.message}`);
    }
  };
}

function readEvents(logPath) {
  if (!fs.existsSync(logPath)) return [];
  const events = [];
  for (const line of fs.readFileSync(logPath, 'utf8').split(/\r?\n/)) {
    if (!line.trim()) continue;
    try {
      events.push(JSON.parse(line));
    } catch {
      // tolerate a torn line (e.g., crash mid-append); skip it
    }
  }
  return events;
}

/**
 * Compute summary metrics from the JSONL log.
 */
function computeReport(events) {
  const perTask = new Map();
  const touch = (id) => {
    if (!perTask.has(id)) perTask.set(id, { attempts: 0, verified: false, verifiedOnAttempt: null, failures: 0, blocked: false });
    return perTask.get(id);
  };

  const fingerprints = new Map();
  let runnerErrors = 0;

  for (const e of events) {
    if (e.event === 'attempt_start') touch(e.task).attempts += 1;
    else if (e.event === 'attempt_verified') {
      const t = touch(e.task);
      t.verified = true;
      t.verifiedOnAttempt = e.attempt;
    } else if (e.event === 'attempt_failed') {
      touch(e.task).failures += 1;
      if (e.fingerprint) fingerprints.set(e.fingerprint, (fingerprints.get(e.fingerprint) || 0) + 1);
    } else if (e.event === 'task_blocked') touch(e.task).blocked = true;
    else if (e.event === 'runner_error') runnerErrors += 1;
  }

  const tasks = [...perTask.entries()].map(([id, t]) => ({ id, ...t }));
  const verified = tasks.filter((t) => t.verified);
  const firstPass = verified.filter((t) => t.verifiedOnAttempt === 1);
  const repeatFingerprints = [...fingerprints.entries()]
    .filter(([, n]) => n > 1)
    .sort((a, b) => b[1] - a[1])
    .map(([fingerprint, count]) => ({ fingerprint, count }));

  return {
    tasks_touched: tasks.length,
    attempts_total: tasks.reduce((sum, t) => sum + t.attempts, 0),
    verified: verified.length,
    blocked: tasks.filter((t) => t.blocked).length,
    runner_errors: runnerErrors,
    first_pass_rate: verified.length ? Number((firstPass.length / verified.length).toFixed(2)) : null,
    avg_attempts_per_verified: verified.length
      ? Number((verified.reduce((sum, t) => sum + t.attempts, 0) / verified.length).toFixed(2))
      : null,
    repeat_fingerprints: repeatFingerprints,
    per_task: tasks,
  };
}

function formatReport(report) {
  const lines = [];
  lines.push('ACE Loop Telemetry Report');
  lines.push('=========================');
  lines.push(`Tasks touched:        ${report.tasks_touched}`);
  lines.push(`Attempts total:       ${report.attempts_total}`);
  lines.push(`Verified:             ${report.verified}`);
  lines.push(`Blocked:              ${report.blocked}`);
  lines.push(`Runner errors:        ${report.runner_errors}`);
  lines.push(`First-pass rate:      ${report.first_pass_rate === null ? 'n/a' : `${Math.round(report.first_pass_rate * 100)}%`}`);
  lines.push(`Avg attempts/verified: ${report.avg_attempts_per_verified === null ? 'n/a' : report.avg_attempts_per_verified}`);
  if (report.repeat_fingerprints.length) {
    lines.push('');
    lines.push('Repeat failures (same fingerprint more than once — playbook candidates):');
    for (const { fingerprint, count } of report.repeat_fingerprints) {
      lines.push(`  ${fingerprint}  x${count}`);
    }
  }
  lines.push('');
  lines.push('Per task:');
  for (const t of report.per_task) {
    const state = t.blocked ? 'BLOCKED' : (t.verified ? `verified on attempt ${t.verifiedOnAttempt}` : 'unfinished');
    lines.push(`  ${t.id}: ${t.attempts} attempt(s), ${t.failures} failure(s) — ${state}`);
  }
  return lines.join('\n');
}

module.exports = { createEmitter, readEvents, computeReport, formatReport, DEFAULT_LOG_REL };
