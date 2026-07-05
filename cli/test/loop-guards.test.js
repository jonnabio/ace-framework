'use strict';

const assert = require('assert');
const { test, run } = require('./harness');
const {
  decide, fingerprint, isStalled, effectiveMaxAttempts,
} = require('../lib/loop-guards');

function makeTask(overrides) {
  return {
    id: 'T001',
    name: 'Example',
    objective: 'A sufficiently long objective for the schema.',
    status: 'failed',
    attempts: 1,
    depends_on: [],
    failures: [],
    ...overrides,
  };
}

function failure(fp, summary) {
  return {
    at: '2026-07-04T12:00:00Z',
    summary: summary || 'test failed',
    fingerprint: fp,
  };
}

// --- decide: retry budget ---

test('budget exhausted (attempts == max_attempts) blocks', () => {
  const task = makeTask({ attempts: 3, failures: [failure('aaaaaaaaaaaa')] });
  const result = decide(task, { max_attempts: 3 });
  assert.strictEqual(result.action, 'block');
  assert.ok(result.reason.includes('Retry budget exhausted: 3/3'), result.reason);
});

test('task-level max_attempts overrides defaults', () => {
  const task = makeTask({ attempts: 3, max_attempts: 5, failures: [failure('aaaaaaaaaaaa')] });
  const result = decide(task, { max_attempts: 3 });
  assert.strictEqual(result.action, 'retry');
});

test('fallback budget is 3 when neither task nor defaults specify one', () => {
  assert.strictEqual(effectiveMaxAttempts({}, undefined), 3);
  const result = decide(makeTask({ attempts: 3, failures: [failure('aaaaaaaaaaaa')] }));
  assert.strictEqual(result.action, 'block');
});

// --- decide: stall detection ---

test('two consecutive identical fingerprints block even with budget remaining', () => {
  const task = makeTask({
    attempts: 2,
    failures: [failure('9f3ac1d20b47'), failure('9f3ac1d20b47')],
  });
  const result = decide(task, { max_attempts: 5 });
  assert.strictEqual(result.action, 'block');
  assert.ok(result.reason.includes('Stall detected'), result.reason);
  assert.ok(result.reason.includes('9f3ac1d20b47'), result.reason);
});

test('identical fingerprints that are NOT consecutive do not stall', () => {
  const task = makeTask({
    attempts: 3,
    failures: [failure('aaaaaaaaaaaa'), failure('bbbbbbbbbbbb'), failure('aaaaaaaaaaaa')],
  });
  assert.strictEqual(isStalled(task), false);
  const result = decide(task, { max_attempts: 5 });
  assert.strictEqual(result.action, 'retry');
});

test('distinct fingerprints under budget permit retry', () => {
  const task = makeTask({
    attempts: 2,
    failures: [failure('aaaaaaaaaaaa'), failure('bbbbbbbbbbbb')],
  });
  const result = decide(task, { max_attempts: 3 });
  assert.strictEqual(result.action, 'retry');
});

test('a single failure never stalls', () => {
  assert.strictEqual(isStalled(makeTask({ failures: [failure('aaaaaaaaaaaa')] })), false);
});

// --- decide: reasons are human-actionable ---

test('every block reason is non-empty and names a next action', () => {
  const stalled = decide(makeTask({
    attempts: 2,
    failures: [failure('cccccccccccc'), failure('cccccccccccc')],
  }), { max_attempts: 5 });
  const exhausted = decide(makeTask({
    attempts: 3,
    failures: [failure('dddddddddddd')],
  }), { max_attempts: 3 });
  for (const result of [stalled, exhausted]) {
    assert.strictEqual(result.action, 'block');
    assert.ok(result.reason.length >= 10, 'reason satisfies schema minLength');
    assert.ok(/human decision needed/i.test(result.reason), result.reason);
  }
});

test('block reason includes the last failure summary when available', () => {
  const task = makeTask({
    attempts: 3,
    failures: [failure('eeeeeeeeeeee', 'pager resets sort order on page change')],
  });
  const result = decide(task, { max_attempts: 3 });
  assert.ok(result.reason.includes('pager resets sort order'), result.reason);
});

// --- decide: purity ---

test('decide does not mutate its inputs', () => {
  const task = makeTask({ attempts: 2, failures: [failure('aaaaaaaaaaaa'), failure('aaaaaaaaaaaa')] });
  const defaults = { max_attempts: 3 };
  const taskSnapshot = JSON.stringify(task);
  const defaultsSnapshot = JSON.stringify(defaults);
  decide(task, defaults);
  assert.strictEqual(JSON.stringify(task), taskSnapshot);
  assert.strictEqual(JSON.stringify(defaults), defaultsSnapshot);
});

// --- fingerprint ---

test('fingerprint is deterministic and schema-conformant', () => {
  const a = fingerprint('Error: expected 200 but got 500');
  const b = fingerprint('Error: expected 200 but got 500');
  assert.strictEqual(a, b);
  assert.match(a, /^[a-f0-9]{16}$/);
});

test('fingerprint is path-invariant (windows and unix)', () => {
  const win = fingerprint('FAIL D:\\Github\\proj\\src\\users.test.ts — expected 200 got 500');
  const win2 = fingerprint('FAIL C:\\ci\\workspace\\src\\users.test.ts — expected 200 got 500');
  const unix = fingerprint('FAIL /home/ci/proj/src/users.test.ts — expected 200 got 500');
  assert.strictEqual(win, win2);
  assert.strictEqual(win, unix);
});

test('fingerprint is timestamp- and duration-invariant', () => {
  const a = fingerprint('2026-07-04T13:05:44Z tests failed in 1.23s: assertion error');
  const b = fingerprint('2026-07-05T09:12:01Z tests failed in 45.6s: assertion error');
  assert.strictEqual(a, b);
});

test('fingerprint is case- and whitespace-invariant', () => {
  const a = fingerprint('Assertion  Failed:\n  Expected TRUE');
  const b = fingerprint('assertion failed: expected true');
  assert.strictEqual(a, b);
});

test('different logical failures produce different fingerprints', () => {
  const a = fingerprint('assertion failed: expected 200 got 500');
  const b = fingerprint('timeout: server did not respond');
  assert.notStrictEqual(a, b);
});

module.exports = run;
