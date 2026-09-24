'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { test, run } = require('./harness');
test('documentation standard records the approved row and generated ownership rule', () => {
  const text = fs.readFileSync(path.join(__dirname, '../../.ace/standards/documentation.md'), 'utf8');
  assert.ok(text.includes('| Database documentation | `docs/database/` |'));
  assert.ok(text.includes('Distilled Rule ['));
  assert.ok(text.includes('ADR-004: Database catalog comments'));
  assert.ok(text.includes('never edit them manually'));
  assert.ok(text.includes('absence of drift'));
});
module.exports = run;
