/**
 * loop-guards.js — bounded-iteration guards for the ACE loop.
 *
 * Decides, after every failed attempt, whether the orchestrator may retry
 * a task or must transition it to "blocked" and halt for human escalation.
 * Two guards (Implementation Plan v2.7, T003):
 *
 *   1. Retry budget: attempts >= effective max_attempts (task-level, else
 *      defaults.max_attempts, else 3) → block.
 *   2. Stall detection: the same failure fingerprint on two consecutive
 *      attempts → block, even with budget remaining. Retrying an identical
 *      failure burns budget without new information.
 *
 * All decision functions are pure — state in, decision out, no I/O — so
 * they are unit-testable in isolation and reusable by loop.js (T004).
 */

'use strict';

const crypto = require('crypto');

const FALLBACK_MAX_ATTEMPTS = 3;

/**
 * Effective retry budget for a task.
 */
function effectiveMaxAttempts(task, defaults) {
  if (task && Number.isInteger(task.max_attempts)) return task.max_attempts;
  if (defaults && Number.isInteger(defaults.max_attempts)) return defaults.max_attempts;
  return FALLBACK_MAX_ATTEMPTS;
}

/**
 * Normalize failure output so the same logical failure produces the same
 * fingerprint across runs: case, absolute paths, timestamps, durations,
 * memory addresses, and whitespace must not change the identity.
 */
function normalizeFailureText(raw) {
  return String(raw)
    .toLowerCase()
    // ISO 8601 timestamps (2026-07-04T13:05:44.123Z, +02:00 offsets)
    .replace(/\d{4}-\d{2}-\d{2}t\d{2}:\d{2}:\d{2}(\.\d+)?(z|[+-]\d{2}:\d{2})?/g, '<ts>')
    // bare dates and clock times
    .replace(/\d{4}-\d{2}-\d{2}/g, '<date>')
    .replace(/\b\d{1,2}:\d{2}(:\d{2})?\b/g, '<time>')
    // windows paths (D:\foo\bar, also forward-slash drive paths)
    .replace(/[a-z]:[\\/][^\s'"):,]+/g, '<path>')
    // unix absolute paths
    .replace(/(?<![\w.])\/[\w.-]+(?:\/[\w.-]+)+/g, '<path>')
    // durations ("in 1.23s", "took 456 ms")
    .replace(/\b\d+(\.\d+)?\s*(ms|s|sec|seconds?|m|min|minutes?)\b/g, '<dur>')
    // hex addresses / long hashes
    .replace(/\b0x[0-9a-f]+\b/g, '<addr>')
    .replace(/\b[0-9a-f]{12,64}\b/g, '<hash>')
    // collapse whitespace
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Deterministic, path/timestamp-invariant identity of a failure.
 * Returns 16 lowercase hex chars (fits the schema's ^[a-f0-9]{12,64}$).
 */
function fingerprint(raw) {
  return crypto.createHash('sha256')
    .update(normalizeFailureText(raw))
    .digest('hex')
    .slice(0, 16);
}

/**
 * True when the last two recorded failures have identical fingerprints.
 */
function isStalled(task) {
  const failures = (task && Array.isArray(task.failures)) ? task.failures : [];
  if (failures.length < 2) return false;
  const last = failures[failures.length - 1];
  const prev = failures[failures.length - 2];
  return Boolean(last && prev && last.fingerprint && last.fingerprint === prev.fingerprint);
}

/**
 * Guard decision after a failed attempt.
 *
 * @param {object} task - task object per .ace/schemas/tasks.schema.json,
 *   with the latest failure already appended to task.failures.
 * @param {object} [defaults] - queue defaults ({ max_attempts }).
 * @returns {{action: 'retry'|'block', reason: string}} - on 'block', reason
 *   is a human-actionable blocked_reason ready to be written to the queue.
 */
function decide(task, defaults) {
  const maxAttempts = effectiveMaxAttempts(task, defaults);
  const attempts = Number.isInteger(task.attempts) ? task.attempts : 0;
  const lastFailure = Array.isArray(task.failures) && task.failures.length > 0
    ? task.failures[task.failures.length - 1]
    : null;
  const lastSummary = lastFailure && lastFailure.summary ? ` Last failure: ${lastFailure.summary}` : '';

  if (isStalled(task)) {
    return {
      action: 'block',
      reason: `Stall detected: same failure fingerprint (${lastFailure.fingerprint}) on two `
        + 'consecutive attempts. Retrying will not produce new information. Human decision '
        + `needed - review the attempt traces and either fix the underlying issue, revise the `
        + `task objective, or descope it.${lastSummary}`,
    };
  }

  if (attempts >= maxAttempts) {
    return {
      action: 'block',
      reason: `Retry budget exhausted: ${attempts}/${maxAttempts} attempts used. Human decision `
        + 'needed - review the failure history, then either raise max_attempts with a rationale, '
        + `split the task into smaller tasks, or fix the blocker manually.${lastSummary}`,
    };
  }

  return {
    action: 'retry',
    reason: `Attempt ${attempts}/${maxAttempts} failed with a new failure signature; `
      + 'retrying in a fresh session.',
  };
}

module.exports = { decide, fingerprint, isStalled, effectiveMaxAttempts, normalizeFailureText };
