'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { test, run } = require('./harness');

const ROOT = path.resolve(__dirname, '../..');
const ACTIVE = ['.aceconfig', '.aiconfig', '.cursorrules', 'ACE-SPEC.md',
  'README.md', 'USER_GUIDE.md', 'AGENTS.md', 'CLAUDE.md',
  'cli/bin/create-ace-framework.js', 'scripts/init.sh'];

test('all active framework surfaces report 2.8.0', () => {
  for (const file of ACTIVE) {
    const text = fs.readFileSync(path.join(ROOT, file), 'utf8');
    assert.ok(text.includes('2.8.0'), `${file} lacks 2.8.0`);
  }
  assert.strictEqual(require('../package.json').version, '2.8.0');
  const result = spawnSync(process.execPath,
    [path.join(ROOT, 'cli/bin/create-ace-framework.js'), '--version'], { encoding: 'utf8' });
  assert.strictEqual(result.status, 0, result.stderr);
  assert.strictEqual(result.stdout.trim(), '2.8.0');
});

test('independent schema and historical release versions remain intact', () => {
  assert.strictEqual(require('../../.ace/schemas/tasks.schema.json').properties.version.const, '1.0');
  const changelog = fs.readFileSync(path.join(ROOT, 'CHANGELOG.md'), 'utf8');
  for (const release of ['v2.7.0', 'v2.6.2', 'v2.5.0']) assert.ok(changelog.includes(release));
  assert.ok(fs.readFileSync(path.join(ROOT, '.ace/standards/harness-engineering.md'), 'utf8')
    .includes('**Version**: 2.7.0'));
});

test('CLI retains zero runtime dependencies', () => {
  const pkg = require('../package.json');
  assert.ok(!pkg.dependencies || Object.keys(pkg.dependencies).length === 0);
});

module.exports = run;
