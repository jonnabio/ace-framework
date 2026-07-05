/**
 * loop.js — the ACE loop orchestrator (Implementation Plan v2.7, T004).
 *
 * A thin state machine over docs/progress/tasks.json:
 *
 *   pick eligible task -> fresh runner session -> verify gate ->
 *   verified | (record failure -> loop-guards -> retry | blocked)
 *
 * Design constraints (ADR-002, plan risk table):
 *   - all agent execution goes through an injected runner adapter;
 *   - verification is decided ONLY by the verify gate's exit code;
 *   - the loop itself never modifies files outside docs/progress/,
 *     the queue, and telemetry;
 *   - state transitions are atomic (write-temp-then-rename);
 *   - a runner failure halts the loop WITHOUT burning task retry budget.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const { validateTasks } = require('./validate-tasks');
const guards = require('./loop-guards');
const { assemblePrompt } = require('./prompt-assembler');

const VERIFIED_STATES = ['verified', 'skipped'];

// --- queue I/O ---

function loadQueue(queuePath) {
  const raw = fs.readFileSync(queuePath, 'utf8');
  const doc = JSON.parse(raw);
  const errors = validateTasks(doc);
  if (errors.length > 0) {
    const err = new Error(`invalid task queue ${queuePath}:\n  - ${errors.join('\n  - ')}`);
    err.code = 'INVALID_QUEUE';
    throw err;
  }
  return doc;
}

function saveQueue(queuePath, doc) {
  doc.updated = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
  const tmpPath = `${queuePath}.tmp`;
  fs.writeFileSync(tmpPath, `${JSON.stringify(doc, null, 2)}\n`);
  fs.renameSync(tmpPath, queuePath);
}

// --- task selection ---

function depsSatisfied(task, byId) {
  return (task.depends_on || []).every((id) => {
    const dep = byId.get(id);
    return dep && VERIFIED_STATES.includes(dep.status);
  });
}

/**
 * Next task the loop may work on. A crashed loop leaves a task in_progress;
 * that task is always resumed first. Otherwise: first pending or failed task
 * (queue order) whose dependencies are all verified/skipped.
 */
function nextEligible(doc) {
  const byId = new Map(doc.tasks.map((t) => [t.id, t]));
  const resumed = doc.tasks.find((t) => t.status === 'in_progress');
  if (resumed) return { task: resumed, resumed: true };
  const task = doc.tasks.find(
    (t) => (t.status === 'pending' || t.status === 'failed') && depsSatisfied(t, byId),
  );
  return task ? { task, resumed: false } : null;
}

function queueSummary(doc) {
  const counts = {};
  for (const t of doc.tasks) counts[t.status] = (counts[t.status] || 0) + 1;
  return Object.entries(counts).map(([k, v]) => `${v} ${k}`).join(', ');
}

// --- verify gate ---

function buildVerifyCommand(task, defaults) {
  const cmd = task.acceptance_cmd || (defaults && defaults.verify_cmd) || '.ace/scripts/verify.sh';
  // .sh gates need bash on Windows; harmless elsewhere since we only prefix
  // when the command is a bare script path.
  if (process.platform === 'win32' && /^\S+\.sh$/.test(cmd)) return `bash ${cmd}`;
  return cmd;
}

function runVerify(command, cwd) {
  const result = spawnSync(command, { cwd, shell: true, encoding: 'utf8', timeout: 15 * 60 * 1000 });
  const output = `${result.stdout || ''}${result.stderr || ''}`;
  return { passed: result.status === 0, output, exitCode: result.status };
}

/** Short human summary of a verify failure: last non-empty, non-marker lines. */
function summarizeFailure(output) {
  const lines = String(output).split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('VERIFY_RESULT='));
  return lines.slice(-3).join(' | ').slice(0, 300) || 'verify gate failed with no output';
}

// --- progress artifacts ---

function tracePath(progressDir, taskId, attempt) {
  return path.join(progressDir, `task_${taskId}_attempt${attempt}_trace.md`);
}

function relToProject(projectDir, absPath) {
  return path.relative(projectDir, absPath).split(path.sep).join('/');
}

function writeResultFileIfMissing(projectDir, task, verifyOutput) {
  const rel = `docs/progress/task_${task.id}_result.md`;
  const abs = path.join(projectDir, rel);
  if (!fs.existsSync(abs)) {
    const tail = String(verifyOutput).split(/\r?\n/).slice(-10).join('\n');
    fs.writeFileSync(abs, `# Result: ${task.id} — ${task.name}

> Written by the orchestrator (the Generator did not leave a progress log).

- **Status:** verified
- **Attempts:** ${task.attempts}
- **Objective:** ${task.objective}

## Verify gate output (tail)

\`\`\`
${tail}
\`\`\`
`);
  }
  return rel;
}

// --- the loop ---

/**
 * Run the ACE loop until the queue completes, a task blocks, the runner
 * fails, or maxIterations attempts have been made.
 *
 * @param {object} opts
 * @param {string} opts.projectDir - project root (contains .aceconfig)
 * @param {object} opts.runner - runner adapter per ADR-002
 * @param {string} [opts.queuePath] - default docs/progress/tasks.json
 * @param {string} [opts.configPath] - default .aceconfig
 * @param {function} [opts.reflect] - async ({task, failure, traceFile}) => void (T007)
 * @param {function} [opts.onEvent] - telemetry sink (T009)
 * @param {number} [opts.maxIterations] - safety cap on attempts this run
 * @param {boolean} [opts.dryRun] - report state and next action, change nothing
 * @param {object} [opts.log] - console-like logger
 * @returns {{outcome: string, exitCode: number, attempts: number, detail?: string}}
 *   outcome: complete | blocked | no_eligible | runner_error | max_iterations | dry_run
 */
async function runLoop(opts) {
  const projectDir = opts.projectDir;
  const queuePath = opts.queuePath || path.join(projectDir, 'docs', 'progress', 'tasks.json');
  const configPath = opts.configPath || path.join(projectDir, '.aceconfig');
  const progressDir = path.dirname(queuePath);
  const runner = opts.runner;
  const log = opts.log || console;
  const maxIterations = opts.maxIterations || Number.POSITIVE_INFINITY;
  const emit = (event) => { if (opts.onEvent) opts.onEvent({ ts: new Date().toISOString(), ...event }); };

  const configText = fs.existsSync(configPath) ? fs.readFileSync(configPath, 'utf8') : '';
  let doc = loadQueue(queuePath);

  if (opts.dryRun) {
    const next = nextEligible(doc);
    log.log(`Queue: ${queueSummary(doc)}`);
    log.log(next
      ? `Next: ${next.task.id} "${next.task.name}"${next.resumed ? ' (resuming in_progress task)' : ''}`
      : 'Next: nothing eligible');
    return { outcome: 'dry_run', exitCode: 0, attempts: 0 };
  }

  const availability = runner.isAvailable ? runner.isAvailable() : { ok: true };
  if (!availability.ok) {
    log.error(`Runner "${runner.name}" unavailable: ${availability.reason}`);
    return { outcome: 'runner_error', exitCode: 1, attempts: 0, detail: availability.reason };
  }

  let attemptsThisRun = 0;

  for (;;) {
    if (attemptsThisRun >= maxIterations) {
      log.warn(`Stopping: reached max iterations (${maxIterations}). Queue: ${queueSummary(doc)}`);
      return { outcome: 'max_iterations', exitCode: 0, attempts: attemptsThisRun };
    }

    const next = nextEligible(doc);
    if (!next) {
      const unfinished = doc.tasks.filter((t) => !VERIFIED_STATES.includes(t.status));
      if (unfinished.length === 0) {
        log.log(`Queue complete: ${queueSummary(doc)}`);
        emit({ event: 'loop_complete' });
        return { outcome: 'complete', exitCode: 0, attempts: attemptsThisRun };
      }
      const detail = `nothing eligible; remaining: ${unfinished.map((t) => `${t.id}(${t.status})`).join(', ')}`;
      log.warn(`Stopping: ${detail}`);
      return { outcome: 'no_eligible', exitCode: unfinished.some((t) => t.status === 'blocked') ? 1 : 0, attempts: attemptsThisRun, detail };
    }

    const { task, resumed } = next;
    const priorStatus = resumed ? 'in_progress' : task.status;
    if (!resumed) {
      task.status = 'in_progress';
      task.attempts += 1;
    } else {
      log.warn(`Resuming ${task.id}: found in_progress (previous run did not finish). Attempt ${task.attempts} restarts.`);
    }
    saveQueue(queuePath, doc);
    attemptsThisRun += 1;

    const attempt = task.attempts;
    const traceAbs = tracePath(progressDir, task.id, attempt);
    const resultFileRel = `docs/progress/task_${task.id}_result.md`;
    const verifyCmd = buildVerifyCommand(task, doc.defaults);
    const lastFailure = (task.failures && task.failures.length)
      ? task.failures[task.failures.length - 1] : null;

    log.log(`[${task.id}] attempt ${attempt}: spawning ${runner.name} session...`);
    emit({ event: 'attempt_start', task: task.id, attempt, runner: runner.name });
    const startedAt = Date.now();

    const run = await runner.run({
      prompt: assemblePrompt({ task, defaults: doc.defaults, verifyCmd, resultFile: resultFileRel, configText, lastFailure }),
      taskId: task.id,
      attempt,
      cwd: projectDir,
      traceFile: traceAbs,
    });

    if (!run.ok) {
      // Infrastructure failure: restore state, do NOT burn the retry budget (ADR-002).
      task.attempts -= 1;
      task.status = priorStatus === 'in_progress' ? 'failed' : priorStatus;
      if (task.status === 'failed' && task.attempts === 0) task.status = 'pending';
      saveQueue(queuePath, doc);
      log.error(`Runner "${runner.name}" failed on ${task.id}: ${run.output}`);
      emit({ event: 'runner_error', task: task.id, attempt, detail: String(run.output).slice(0, 200) });
      return { outcome: 'runner_error', exitCode: 1, attempts: attemptsThisRun, detail: run.output };
    }

    if (!fs.existsSync(traceAbs)) {
      log.warn(`Runner did not write a trace for ${task.id} attempt ${attempt}; writing stub (see ADR-002).`);
      fs.writeFileSync(traceAbs, `# Trace stub: ${task.id} attempt ${attempt}\n\nRunner "${runner.name}" did not capture a trace.\n\n## Runner output\n\n${run.output || '(empty)'}\n`);
    }

    log.log(`[${task.id}] running verify gate: ${verifyCmd}`);
    const verify = runVerify(verifyCmd, projectDir);
    const durationMs = Date.now() - startedAt;

    if (verify.passed) {
      task.status = 'verified';
      task.result_file = writeResultFileIfMissing(projectDir, task, verify.output);
      saveQueue(queuePath, doc);
      log.log(`[${task.id}] VERIFIED (attempt ${attempt}).`);
      emit({ event: 'attempt_verified', task: task.id, attempt, duration_ms: durationMs });
      continue;
    }

    const failure = {
      at: new Date().toISOString().replace(/\.\d{3}Z$/, 'Z'),
      summary: summarizeFailure(verify.output),
      fingerprint: guards.fingerprint(verify.output),
      trace_ref: relToProject(projectDir, traceAbs),
    };
    fs.appendFileSync(traceAbs, `\n## Verify gate output (exit ${verify.exitCode})\n\n\`\`\`\n${verify.output}\n\`\`\`\n`);
    task.failures = task.failures || [];
    task.failures.push(failure);

    const decision = guards.decide(task, doc.defaults);
    emit({ event: 'attempt_failed', task: task.id, attempt, fingerprint: failure.fingerprint, decision: decision.action, duration_ms: durationMs });

    if (opts.reflect) {
      try {
        await opts.reflect({ task, failure, traceFile: traceAbs });
      } catch (err) {
        log.warn(`Reflector step failed (non-fatal): ${err.message}`);
      }
    }

    if (decision.action === 'block') {
      task.status = 'blocked';
      task.blocked_reason = decision.reason;
      saveQueue(queuePath, doc);
      log.error(`[${task.id}] BLOCKED after attempt ${attempt}: ${decision.reason}`);
      emit({ event: 'task_blocked', task: task.id, attempt, fingerprint: failure.fingerprint });
      return { outcome: 'blocked', exitCode: 1, attempts: attemptsThisRun, detail: decision.reason };
    }

    task.status = 'failed';
    saveQueue(queuePath, doc);
    log.warn(`[${task.id}] attempt ${attempt} failed (${failure.summary}); ${decision.reason}`);
  }
}

module.exports = {
  runLoop, loadQueue, saveQueue, nextEligible, buildVerifyCommand, summarizeFailure,
};
