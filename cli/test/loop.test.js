'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { test, run } = require('./harness');
const { runLoop, nextEligible } = require('../lib/loop');
const { validateTasksFile } = require('../lib/validate-tasks');

const quiet = { log() {}, warn() {}, error() {} };

const PASS_CMD = 'node -e "process.exit(0)"';
const FAIL_CMD = 'node -e "console.error(\'assertion failed: expected 200 got 500\'); process.exit(1)"';
const MARKER_CMD = 'node -e "process.exit(require(\'fs\').existsSync(\'ok.txt\') ? 0 : 1)"';

function makeProject(tasks, defaults) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ace-loop-'));
  fs.mkdirSync(path.join(dir, 'docs', 'progress'), { recursive: true });
  fs.writeFileSync(path.join(dir, '.aceconfig'), [
    'version: "2.7.0"',
    'entry:',
    '  standards:',
    '    - .ace/standards/coding.md',
    '',
  ].join('\n'));
  const doc = {
    version: '1.0',
    plan_ref: 'docs/planning/implementation_plan.md',
    created: '2026-07-05T00:00:00Z',
    updated: '2026-07-05T00:00:00Z',
    defaults: { max_attempts: 3, runner: 'mock', ...defaults },
    tasks,
  };
  fs.writeFileSync(path.join(dir, 'docs', 'progress', 'tasks.json'), JSON.stringify(doc, null, 2));
  return dir;
}

function makeTask(id, overrides) {
  return {
    id,
    name: `Task ${id}`,
    objective: `Objective for task ${id}, long enough for the schema.`,
    status: 'pending',
    attempts: 0,
    depends_on: [],
    acceptance_cmd: PASS_CMD,
    ...overrides,
  };
}

function mockRunner(behavior) {
  const calls = [];
  return {
    name: 'mock',
    calls,
    isAvailable: () => ({ ok: true }),
    async run(req) {
      calls.push({ taskId: req.taskId, attempt: req.attempt, prompt: req.prompt });
      if (!behavior || behavior(req) !== 'skip-trace') {
        fs.writeFileSync(req.traceFile, `mock trace ${req.taskId} attempt ${req.attempt}\n`);
      }
      return { ok: true, output: `mock output for ${req.taskId}` };
    },
  };
}

function readQueue(dir) {
  return JSON.parse(fs.readFileSync(path.join(dir, 'docs', 'progress', 'tasks.json'), 'utf8'));
}

// --- happy path ---

test('happy path: dependent tasks complete in order, verified, result files written', async () => {
  const dir = makeProject([
    makeTask('T001'),
    makeTask('T002', { depends_on: ['T001'] }),
  ]);
  const runner = mockRunner();
  const result = await runLoop({ projectDir: dir, runner, log: quiet });

  assert.strictEqual(result.outcome, 'complete');
  assert.strictEqual(result.exitCode, 0);
  assert.deepStrictEqual(runner.calls.map((c) => c.taskId), ['T001', 'T002']);

  const doc = readQueue(dir);
  assert.ok(doc.tasks.every((t) => t.status === 'verified'));
  for (const id of ['T001', 'T002']) {
    assert.ok(fs.existsSync(path.join(dir, 'docs', 'progress', `task_${id}_result.md`)), `result file for ${id}`);
  }
  // queue stays schema-valid and no temp file is left behind
  assert.deepStrictEqual(validateTasksFile(path.join(dir, 'docs', 'progress', 'tasks.json')), []);
  assert.ok(!fs.existsSync(path.join(dir, 'docs', 'progress', 'tasks.json.tmp')));
});

// --- failure -> retry with a fresh session ---

test('failed attempt records failure, retry spawns a new session, then succeeds', async () => {
  const dir = makeProject([makeTask('T001', { acceptance_cmd: MARKER_CMD })]);
  const runner = mockRunner((req) => {
    if (req.attempt === 2) fs.writeFileSync(path.join(dir, 'ok.txt'), 'ok');
  });
  const result = await runLoop({ projectDir: dir, runner, log: quiet });

  assert.strictEqual(result.outcome, 'complete');
  const task = readQueue(dir).tasks[0];
  assert.strictEqual(task.status, 'verified');
  assert.strictEqual(task.attempts, 2);
  assert.strictEqual(task.failures.length, 1);
  assert.match(task.failures[0].fingerprint, /^[a-f0-9]{16}$/);
  assert.ok(fs.existsSync(path.join(dir, task.failures[0].trace_ref)), 'trace file exists');
  // two distinct sessions, and the retry prompt carries the failure context
  assert.strictEqual(runner.calls.length, 2);
  assert.ok(runner.calls[1].prompt.includes('Previous attempt failed'));
  assert.ok(!runner.calls[0].prompt.includes('Previous attempt failed'));
});

// --- blocked paths ---

test('stall: identical failure twice blocks with exit 1 even with budget left', async () => {
  const dir = makeProject([makeTask('T001', { acceptance_cmd: FAIL_CMD })], { max_attempts: 5 });
  const result = await runLoop({ projectDir: dir, runner: mockRunner(), log: quiet });

  assert.strictEqual(result.outcome, 'blocked');
  assert.strictEqual(result.exitCode, 1);
  const task = readQueue(dir).tasks[0];
  assert.strictEqual(task.status, 'blocked');
  assert.strictEqual(task.attempts, 2);
  assert.ok(task.blocked_reason.includes('Stall detected'), task.blocked_reason);
});

test('budget: max_attempts=1 blocks after the first failure', async () => {
  const dir = makeProject([makeTask('T001', { acceptance_cmd: FAIL_CMD, max_attempts: 1 })]);
  const result = await runLoop({ projectDir: dir, runner: mockRunner(), log: quiet });

  assert.strictEqual(result.outcome, 'blocked');
  const task = readQueue(dir).tasks[0];
  assert.strictEqual(task.status, 'blocked');
  assert.ok(task.blocked_reason.includes('Retry budget exhausted'), task.blocked_reason);
});

// --- crash safety / resume ---

test('resume: an in_progress task from a crashed run restarts without burning budget', async () => {
  const dir = makeProject([makeTask('T001', { status: 'in_progress', attempts: 1 })]);
  const runner = mockRunner();
  const result = await runLoop({ projectDir: dir, runner, log: quiet });

  assert.strictEqual(result.outcome, 'complete');
  assert.strictEqual(runner.calls[0].attempt, 1, 'resumed attempt keeps its number');
  assert.strictEqual(readQueue(dir).tasks[0].attempts, 1);
});

// --- nothing eligible ---

test('no eligible: blocked dependency halts with exit 1 and names the remainder', async () => {
  const dir = makeProject([
    makeTask('T001', { status: 'blocked', attempts: 3, blocked_reason: 'needs a human decision here' }),
    makeTask('T002', { depends_on: ['T001'] }),
  ]);
  const runner = mockRunner();
  const result = await runLoop({ projectDir: dir, runner, log: quiet });

  assert.strictEqual(result.outcome, 'no_eligible');
  assert.strictEqual(result.exitCode, 1);
  assert.ok(result.detail.includes('T001(blocked)'), result.detail);
  assert.strictEqual(runner.calls.length, 0);
});

test('all-verified queue reports complete without spawning sessions', async () => {
  const dir = makeProject([
    makeTask('T001', { status: 'verified', attempts: 1, result_file: 'docs/progress/task_T001_result.md' }),
  ]);
  const runner = mockRunner();
  const result = await runLoop({ projectDir: dir, runner, log: quiet });
  assert.strictEqual(result.outcome, 'complete');
  assert.strictEqual(runner.calls.length, 0);
});

// --- runner failures don't burn budget (ADR-002) ---

test('runner failure halts with exit 1 and restores task state', async () => {
  const dir = makeProject([makeTask('T001')]);
  const runner = {
    name: 'broken',
    isAvailable: () => ({ ok: true }),
    run: async () => ({ ok: false, output: 'claude binary not found on PATH' }),
  };
  const result = await runLoop({ projectDir: dir, runner, log: quiet });

  assert.strictEqual(result.outcome, 'runner_error');
  assert.strictEqual(result.exitCode, 1);
  const task = readQueue(dir).tasks[0];
  assert.strictEqual(task.status, 'pending');
  assert.strictEqual(task.attempts, 0, 'retry budget untouched');
});

test('unavailable runner halts before touching the queue', async () => {
  const dir = makeProject([makeTask('T001')]);
  const before = fs.readFileSync(path.join(dir, 'docs', 'progress', 'tasks.json'), 'utf8');
  const runner = {
    name: 'claude-code',
    isAvailable: () => ({ ok: false, reason: 'claude CLI not installed' }),
    run: async () => { throw new Error('must not be called'); },
  };
  const result = await runLoop({ projectDir: dir, runner, log: quiet });
  assert.strictEqual(result.outcome, 'runner_error');
  assert.strictEqual(fs.readFileSync(path.join(dir, 'docs', 'progress', 'tasks.json'), 'utf8'), before);
});

// --- dry run ---

test('dry run reports the next task and changes nothing', async () => {
  const dir = makeProject([makeTask('T001')]);
  const before = fs.readFileSync(path.join(dir, 'docs', 'progress', 'tasks.json'), 'utf8');
  const lines = [];
  const result = await runLoop({
    projectDir: dir,
    runner: mockRunner(),
    dryRun: true,
    log: { log: (m) => lines.push(m), warn() {}, error() {} },
  });
  assert.strictEqual(result.outcome, 'dry_run');
  assert.ok(lines.some((l) => l.includes('T001')), lines.join('\n'));
  assert.strictEqual(fs.readFileSync(path.join(dir, 'docs', 'progress', 'tasks.json'), 'utf8'), before);
});

// --- missing trace triggers stub (ADR-002 rule 2) ---

test('missing trace file is stubbed by the orchestrator', async () => {
  const dir = makeProject([makeTask('T001')]);
  const runner = mockRunner(() => 'skip-trace');
  await runLoop({ projectDir: dir, runner, log: quiet });
  const trace = fs.readFileSync(path.join(dir, 'docs', 'progress', 'task_T001_attempt1_trace.md'), 'utf8');
  assert.ok(trace.includes('Trace stub'));
});

// --- hooks: reflect + telemetry events ---

test('reflect hook fires on failure with task, failure, and trace', async () => {
  const dir = makeProject([makeTask('T001', { acceptance_cmd: FAIL_CMD, max_attempts: 1 })]);
  const reflections = [];
  await runLoop({
    projectDir: dir,
    runner: mockRunner(),
    log: quiet,
    reflect: async ({ task, failure, traceFile }) => {
      reflections.push({ id: task.id, fingerprint: failure.fingerprint, traceFile });
    },
  });
  assert.strictEqual(reflections.length, 1);
  assert.strictEqual(reflections[0].id, 'T001');
  assert.ok(fs.existsSync(reflections[0].traceFile));
});

test('onEvent receives the attempt lifecycle', async () => {
  const dir = makeProject([makeTask('T001')]);
  const events = [];
  await runLoop({ projectDir: dir, runner: mockRunner(), log: quiet, onEvent: (e) => events.push(e.event) });
  assert.deepStrictEqual(events, ['attempt_start', 'attempt_verified', 'loop_complete']);
});

// --- selection helper ---

test('nextEligible skips tasks with unverified dependencies', () => {
  const doc = {
    tasks: [
      makeTask('T001', { status: 'failed', attempts: 1 }),
      makeTask('T002', { depends_on: ['T001'] }),
    ],
  };
  const next = nextEligible(doc);
  assert.strictEqual(next.task.id, 'T001', 'failed task with budget is retried first');
});

module.exports = run;
