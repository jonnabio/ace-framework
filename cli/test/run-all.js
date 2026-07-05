/**
 * run-all.js — discovers and runs every *.test.js in this directory.
 * Exits non-zero if any test fails. Zero dependencies.
 */

'use strict';

const fs = require('fs');
const path = require('path');

async function main() {
  const files = fs.readdirSync(__dirname).filter((f) => f.endsWith('.test.js')).sort();
  if (files.length === 0) {
    console.error('No test files found.');
    process.exit(1);
  }
  let totalFailed = 0;
  for (const file of files) {
    const runFile = require(path.join(__dirname, file));
    totalFailed += await runFile(file);
  }
  if (totalFailed > 0) {
    console.error(`\n${totalFailed} test(s) failed.`);
    process.exit(1);
  }
  console.log('\nAll tests passed.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
