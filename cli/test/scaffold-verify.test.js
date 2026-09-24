'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const { test, run } = require('./harness');

const ROOT = path.resolve(__dirname, '../..');

function copyFramework(source) {
  for (const entry of ['.ace', 'docs', '.aceconfig', '.aiconfig', '.cursorrules',
    '.editorconfig', '.markdownlint-cli2.jsonc', 'ACE-SPEC.md', 'USER_GUIDE.md']) {
    const from = path.join(ROOT, entry);
    const to = path.join(source, entry);
    if (fs.statSync(from).isDirectory()) fs.cpSync(from, to, { recursive: true });
    else fs.copyFileSync(from, to);
  }
}

function makeCli({ bundled }) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ace-cli-'));
  fs.cpSync(path.join(ROOT, 'cli'), path.join(root, 'cli'), { recursive: true });
  if (bundled) {
    const templates = path.join(root, 'cli/templates');
    fs.mkdirSync(templates, { recursive: true });
    copyFramework(templates);
  }
  return root;
}

function makeCloneSource() {
  const source = fs.mkdtempSync(path.join(os.tmpdir(), 'ace-source-'));
  copyFramework(source);
  const git = (...args) => spawnSync('git', args, { cwd: source, encoding: 'utf8' });
  assert.strictEqual(git('init', '-q').status, 0);
  assert.strictEqual(git('add', '.').status, 0);
  const commit = git('-c', 'user.name=Fixture', '-c', 'user.email=fixture@invalid',
    'commit', '-qm', 'fixture');
  assert.strictEqual(commit.status, 0, commit.stderr);
  return source;
}

function scaffold(pack, bundled) {
  const cliRoot = makeCli({ bundled });
  const source = bundled ? null : makeCloneSource();
  const target = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'ace-target-')), 'project');
  const args = [target, '--yes'];
  if (pack) args.push('--pack', pack);
  const result = spawnSync(process.execPath,
    [path.join(cliRoot, 'cli/bin/create-ace-framework.js'), ...args], {
      encoding: 'utf8',
      env: { ...process.env, ACE_FRAMEWORK_SOURCE: source || '' },
    });
  assert.strictEqual(result.status, 0, result.stdout + result.stderr);
  return { cliRoot, source, target };
}

for (const bundled of [true, false]) {
  for (const pack of [null, 'postgres', 'supabase']) {
    const label = `${bundled ? 'bundled' : 'offline clone'} ${pack || 'no-pack'}`;
    test(`${label} scaffold passes its real first-run gates`, () => {
      const fixture = scaffold(pack, bundled);
      try {
        const config = fs.readFileSync(path.join(fixture.target, '.aceconfig'), 'utf8');
        assert.match(config, /docs_cmd: ""/);
        assert.ok(!fs.existsSync(path.join(fixture.target, 'docs/progress/tasks.json')));
        const expected = pack === 'supabase' ? ['postgres', 'supabase'] : (pack ? [pack] : []);
        const actualPacks = fs.existsSync(path.join(fixture.target, '.ace/packs'))
          ? fs.readdirSync(path.join(fixture.target, '.ace/packs')).sort() : [];
        assert.deepStrictEqual(actualPacks, expected);
        for (const profile of [[], ['--fast']]) {
          const gate = spawnSync('bash', ['.ace/scripts/verify.sh', ...profile], {
            cwd: fixture.target,
            encoding: 'utf8',
            env: { ...process.env, PATH: '/usr/bin:/bin' },
          });
          assert.strictEqual(gate.status, 0, gate.stdout + gate.stderr);
          assert.ok(!gate.stdout.includes("Gate 'docs'"));
        }
        fs.unlinkSync(path.join(fixture.target, '.ace/roles/roles.md'));
        assert.notStrictEqual(spawnSync('bash', ['.ace/scripts/verify.sh'], {
          cwd: fixture.target, env: { ...process.env, PATH: '/usr/bin:/bin' },
        }).status, 0);
      } finally {
        fs.rmSync(fixture.cliRoot, { recursive: true, force: true });
        if (fixture.source) fs.rmSync(fixture.source, { recursive: true, force: true });
        fs.rmSync(path.dirname(fixture.target), { recursive: true, force: true });
      }
    });
  }
}

module.exports = run;
