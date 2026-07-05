'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { test, run } = require('./harness');
const { reflect, parseReflection, buildReflectionPrompt } = require('../lib/reflector');

const quiet = { log() {}, warn() {}, error() {} };
const REPO_ROOT = path.join(__dirname, '..', '..');

function makeProject() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ace-reflect-'));
  fs.mkdirSync(path.join(dir, '.ace', 'prompts'), { recursive: true });
  fs.copyFileSync(
    path.join(REPO_ROOT, '.ace', 'prompts', 'reflect-on-trace.md'),
    path.join(dir, '.ace', 'prompts', 'reflect-on-trace.md'),
  );
  const traceFile = path.join(dir, 'trace.md');
  fs.writeFileSync(traceFile, 'FAIL: pager resets sort order to default on page change\nexpected asc got default');
  return { dir, traceFile };
}

const task = {
  id: 'T002',
  name: 'Paginated user list',
  objective: 'UserList consumes the paginated endpoint and preserves sort order.',
  attempts: 1,
};
const failure = {
  at: '2026-07-05T10:00:00Z',
  summary: 'pager resets sort order to default on page change',
  fingerprint: '9f3ac1d20b47aaaa',
  trace_ref: 'docs/progress/task_T002_attempt1_trace.md',
};

function cannedRunner(output, ok = true) {
  return {
    name: 'mock',
    isAvailable: () => ({ ok: true }),
    async run(req) {
      fs.writeFileSync(req.traceFile, 'reflection session trace');
      return { ok, output };
    },
  };
}

// --- parseReflection: the strict contract ---

test('well-formed reflection parses', () => {
  const parsed = parseReflection('CATEGORY: State\nLESSON: UI state that must survive navigation belongs in URL params, not component state.');
  assert.deepStrictEqual(parsed, {
    category: 'State',
    lesson: 'UI state that must survive navigation belongs in URL params, not component state.',
  });
});

test('code-fenced reflection parses (models love fences)', () => {
  const parsed = parseReflection('```\nCATEGORY: Testing\nLESSON: Regression tests must pin sort order explicitly rather than relying on defaults.\n```');
  assert.strictEqual(parsed.category, 'Testing');
});

test('NO_LESSON token is recognized', () => {
  assert.deepStrictEqual(parseReflection('NO_LESSON'), { noLesson: true });
});

test('malformed outputs are rejected, not coerced', () => {
  assert.strictEqual(parseReflection('Here is my analysis of the failure...'), null);
  assert.strictEqual(parseReflection('CATEGORY: State'), null);
  assert.strictEqual(parseReflection('CATEGORY: two words\nLESSON: something long enough here.'), null);
  assert.strictEqual(parseReflection('CATEGORY: State\nLESSON: short'), null, 'lesson too short');
  assert.strictEqual(parseReflection('CATEGORY: State\nLESSON: fine lesson sentence here\nEXTRA: line'), null);
});

// --- buildReflectionPrompt ---

test('prompt substitutes all placeholders and embeds the trace', () => {
  const template = fs.readFileSync(path.join(REPO_ROOT, '.ace', 'prompts', 'reflect-on-trace.md'), 'utf8');
  const prompt = buildReflectionPrompt({ task, failure, traceContent: 'THE TRACE BODY', template });
  assert.ok(prompt.includes('T002 — Paginated user list'));
  assert.ok(prompt.includes('pager resets sort order'));
  assert.ok(prompt.includes('THE TRACE BODY'));
  assert.ok(!prompt.includes('{{'), 'no unsubstituted placeholders');
});

test('oversized traces are truncated from the head, keeping the tail', () => {
  const template = '{{TRACE}}';
  const big = `${'x'.repeat(30000)}THE-END`;
  const prompt = buildReflectionPrompt({ task, failure, traceContent: big, template });
  assert.ok(prompt.length < 25000);
  assert.ok(prompt.includes('THE-END'));
  assert.ok(prompt.includes('truncated'));
});

// --- reflect: end to end with canned runners ---

test('failed attempt distills a lesson into the sink with provenance', async () => {
  const { dir, traceFile } = makeProject();
  const lessons = [];
  const result = await reflect({
    task,
    failure,
    traceFile,
    projectDir: dir,
    runner: cannedRunner('CATEGORY: State\nLESSON: UI state that must survive navigation belongs in URL params, not component state.'),
    sink: async (l) => lessons.push(l),
    log: quiet,
  });
  assert.strictEqual(result.outcome, 'distilled');
  assert.strictEqual(lessons.length, 1);
  assert.strictEqual(lessons[0].category, 'State');
  assert.strictEqual(lessons[0].provenance.task, 'T002');
  assert.strictEqual(lessons[0].provenance.fingerprint, failure.fingerprint);
});

test('malformed reflector output leaves the sink untouched', async () => {
  const { dir, traceFile } = makeProject();
  const lessons = [];
  const result = await reflect({
    task, failure, traceFile, projectDir: dir,
    runner: cannedRunner('I think the problem is that the component state is wrong.'),
    sink: async (l) => lessons.push(l),
    log: quiet,
  });
  assert.strictEqual(result.outcome, 'rejected');
  assert.strictEqual(lessons.length, 0);
});

test('NO_LESSON skips the sink without error', async () => {
  const { dir, traceFile } = makeProject();
  const lessons = [];
  const result = await reflect({
    task, failure, traceFile, projectDir: dir,
    runner: cannedRunner('NO_LESSON'),
    sink: async (l) => lessons.push(l),
    log: quiet,
  });
  assert.strictEqual(result.outcome, 'no_lesson');
  assert.strictEqual(lessons.length, 0);
});

test('reflector runner failure is non-fatal and sink-safe', async () => {
  const { dir, traceFile } = makeProject();
  const lessons = [];
  const result = await reflect({
    task, failure, traceFile, projectDir: dir,
    runner: cannedRunner('irrelevant', false),
    sink: async (l) => lessons.push(l),
    log: quiet,
  });
  assert.strictEqual(result.outcome, 'runner_error');
  assert.strictEqual(lessons.length, 0);
});

module.exports = run;
