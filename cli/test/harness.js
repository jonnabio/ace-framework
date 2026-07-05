/**
 * Minimal zero-dependency test harness (Node >= 16).
 * Usage in a *.test.js file:
 *   const { test, run } = require('./harness');
 *   test('name', () => { assert(...); });
 *   module.exports = run;   // run-all.js awaits this
 */

'use strict';

const tests = [];

function test(name, fn) {
  tests.push({ name, fn });
}

async function run(fileLabel) {
  let passed = 0;
  const failures = [];
  for (const { name, fn } of tests.splice(0)) {
    try {
      await fn();
      passed += 1;
    } catch (err) {
      failures.push({ name, err });
    }
  }
  console.log(`${fileLabel}: ${passed} passed, ${failures.length} failed`);
  for (const { name, err } of failures) {
    console.error(`  FAIL ${name}`);
    console.error(`       ${err.message.split('\n').join('\n       ')}`);
  }
  return failures.length;
}

module.exports = { test, run };
