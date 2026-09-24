'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { test, run } = require('./harness');
test('lint excludes generated bundles but includes maintained source and first-party packs', () => {
  const config = JSON.parse(fs.readFileSync(path.join(__dirname, '../../.markdownlint-cli2.jsonc'), 'utf8').replace(/^\s*\/\/.*$/gm, ''));
  assert.deepStrictEqual(config.globs, ['**/*.md']);
  assert.ok(config.ignores.includes('ace_notebooklm_export_part*.md'));
  assert.ok(!config.ignores.includes('.ace/packs/**'));
  assert.ok(!config.ignores.some(p => p.includes('postgres') || p.includes('supabase')));
  assert.strictEqual(config.config.default, true);
});
module.exports = run;
