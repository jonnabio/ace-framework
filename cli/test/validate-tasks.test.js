'use strict';

const assert = require('assert');
const path = require('path');
const { test, run } = require('./harness');
const { validateTasks, validateTasksFile } = require('../lib/validate-tasks');

const EXAMPLE = path.join(__dirname, '..', '..', 'docs', 'progress', 'tasks.example.json');

function validDoc() {
  return {
    version: '1.0',
    plan_ref: 'docs/planning/implementation_plan.md',
    created: '2026-07-04T10:00:00Z',
    updated: '2026-07-04T11:00:00Z',
    defaults: { max_attempts: 3, runner: 'manual' },
    tasks: [
      {
        id: 'T001',
        name: 'First task',
        objective: 'A sufficiently long objective sentence for the schema.',
        status: 'pending',
        attempts: 0,
        depends_on: [],
      },
    ],
  };
}

test('shipped example file validates', () => {
  const errors = validateTasksFile(EXAMPLE);
  assert.deepStrictEqual(errors, []);
});

test('minimal valid document passes', () => {
  assert.deepStrictEqual(validateTasks(validDoc()), []);
});

test('blocked without blocked_reason is rejected', () => {
  const doc = validDoc();
  doc.tasks[0].status = 'blocked';
  doc.tasks[0].attempts = 3;
  const errors = validateTasks(doc);
  assert.ok(errors.some((e) => e.includes('blocked_reason')), errors.join('; '));
});

test('verified without result_file is rejected', () => {
  const doc = validDoc();
  doc.tasks[0].status = 'verified';
  doc.tasks[0].attempts = 1;
  const errors = validateTasks(doc);
  assert.ok(errors.some((e) => e.includes('result_file')), errors.join('; '));
});

test('verified with mismatched result_file id is rejected', () => {
  const doc = validDoc();
  doc.tasks[0].status = 'verified';
  doc.tasks[0].attempts = 1;
  doc.tasks[0].result_file = 'docs/progress/task_T999_result.md';
  const errors = validateTasks(doc);
  assert.ok(errors.some((e) => e.includes("own id")), errors.join('; '));
});

test('in_progress with attempts=0 is rejected', () => {
  const doc = validDoc();
  doc.tasks[0].status = 'in_progress';
  doc.tasks[0].attempts = 0;
  const errors = validateTasks(doc);
  assert.ok(errors.some((e) => e.includes('attempts >= 1')), errors.join('; '));
});

test('attempts exceeding effective max_attempts is rejected', () => {
  const doc = validDoc();
  doc.tasks[0].attempts = 4; // defaults.max_attempts = 3
  doc.tasks[0].status = 'failed';
  const errors = validateTasks(doc);
  assert.ok(errors.some((e) => e.includes('exceeds effective max_attempts')), errors.join('; '));
});

test('task-level max_attempts overrides default for the ceiling', () => {
  const doc = validDoc();
  doc.tasks[0].attempts = 4;
  doc.tasks[0].max_attempts = 5;
  doc.tasks[0].status = 'failed';
  doc.tasks[0].failures = [{
    at: '2026-07-04T11:00:00Z',
    summary: 'test failed',
    fingerprint: 'abcdef123456',
  }];
  assert.deepStrictEqual(validateTasks(doc), []);
});

test('two in_progress tasks are rejected', () => {
  const doc = validDoc();
  doc.tasks[0].status = 'in_progress';
  doc.tasks[0].attempts = 1;
  doc.tasks.push({
    id: 'T002',
    name: 'Second task',
    objective: 'Another sufficiently long objective sentence here.',
    status: 'in_progress',
    attempts: 1,
    depends_on: [],
  });
  const errors = validateTasks(doc);
  assert.ok(errors.some((e) => e.includes('at most one task may be in_progress')), errors.join('; '));
});

test('unknown dependency is rejected', () => {
  const doc = validDoc();
  doc.tasks[0].depends_on = ['T099'];
  const errors = validateTasks(doc);
  assert.ok(errors.some((e) => e.includes('unknown task "T099"')), errors.join('; '));
});

test('self-dependency is rejected', () => {
  const doc = validDoc();
  doc.tasks[0].depends_on = ['T001'];
  const errors = validateTasks(doc);
  assert.ok(errors.some((e) => e.includes('depends on itself')), errors.join('; '));
});

test('dependency cycle is rejected', () => {
  const doc = validDoc();
  doc.tasks[0].depends_on = ['T002'];
  doc.tasks.push({
    id: 'T002',
    name: 'Second task',
    objective: 'Another sufficiently long objective sentence here.',
    status: 'pending',
    attempts: 0,
    depends_on: ['T001'],
  });
  const errors = validateTasks(doc);
  assert.ok(errors.some((e) => e.includes('dependency cycle')), errors.join('; '));
});

test('duplicate task ids are rejected', () => {
  const doc = validDoc();
  doc.tasks.push({ ...validDoc().tasks[0] });
  const errors = validateTasks(doc);
  assert.ok(errors.some((e) => e.includes('duplicate task id "T001"')), errors.join('; '));
});

test('malformed failure entries are rejected', () => {
  const doc = validDoc();
  doc.tasks[0].failures = [{ at: 'yesterday', summary: '', fingerprint: 'XYZ' }];
  const errors = validateTasks(doc);
  assert.ok(errors.some((e) => e.includes('ISO 8601')), errors.join('; '));
  assert.ok(errors.some((e) => e.includes('summary')), errors.join('; '));
  assert.ok(errors.some((e) => e.includes('fingerprint')), errors.join('; '));
});

test('unknown properties are rejected (additionalProperties: false)', () => {
  const doc = validDoc();
  doc.extra = true;
  doc.tasks[0].bogus = 1;
  const errors = validateTasks(doc);
  assert.ok(errors.some((e) => e.includes('root: unknown property "extra"')), errors.join('; '));
  assert.ok(errors.some((e) => e.includes('unknown property "bogus"')), errors.join('; '));
});

test('non-JSON file reports a parse error, not a crash', () => {
  const errors = validateTasksFile(__filename);
  assert.strictEqual(errors.length, 1);
  assert.ok(errors[0].includes('not valid JSON'));
});

module.exports = run;
