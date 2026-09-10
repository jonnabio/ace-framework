'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const { test, run } = require('./harness');

const {
  scaffoldVerifyBlock,
  scaffoldLintGlobs,
  activeContextDocument,
  SCAFFOLD_GLOBS,
} = require('../lib/scaffold-config');

const REPO_ROOT = path.join(__dirname, '..', '..');
const VERIFY_SH = path.join(REPO_ROOT, '.ace', 'scripts', 'verify.sh');

function repoFile(name) {
  return fs.readFileSync(path.join(REPO_ROOT, name), 'utf8');
}

// How verify.sh reads the block (see its get_cmd). If a rewrite ever produces
// something this cannot parse, the scaffolded gate breaks silently, so the
// test uses sed rather than a YAML parser on purpose.
function sedValue(content, key) {
  const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'ace-sed-')), 'cfg');
  fs.writeFileSync(file, content);
  const result = spawnSync('sed', ['-n', `s/^[[:space:]]*${key}:[[:space:]]*"\\(.*\\)".*$/\\1/p`, file], { encoding: 'utf8' });
  return result.stdout.split('\n')[0];
}

// --- verify block ---

test('the scaffolded verify block carries no test command', () => {
  // v2.7.0 shipped `cd cli && npm test` to every scaffolded project, where
  // there is no cli/ directory, so their gate failed on the first run.
  const out = scaffoldVerifyBlock(repoFile('.aceconfig'));
  assert.ok(!out.includes('cd cli && npm test'), 'must not carry our test command');
  assert.strictEqual(sedValue(out, 'test_cmd'), '');
});

test('the scaffolded verify block still lints', () => {
  const out = scaffoldVerifyBlock(repoFile('.aceconfig'));
  assert.strictEqual(sedValue(out, 'lint_cmd'), 'npx --yes markdownlint-cli2');
  assert.strictEqual(sedValue(out, 'typecheck_cmd'), '');
});

test('the rewrite leaves the rest of .aceconfig alone', () => {
  const before = repoFile('.aceconfig');
  const after = scaffoldVerifyBlock(before);
  for (const marker of ['skill_triggers:', 'role_routing:', 'hooks:', 'includes:']) {
    assert.ok(after.includes(marker), `${marker} survived`);
  }
  assert.strictEqual(after.split('verify:').length, 2, 'exactly one verify: block');
});

test('the rewrite preserves CRLF line endings', () => {
  const crlf = repoFile('.aceconfig').replace(/\n/g, '\r\n');
  const out = scaffoldVerifyBlock(crlf);
  assert.ok(out.includes('test_cmd: ""\r\n'), 'emitted block uses CRLF');
  assert.ok(!/[^\r]\n/.test(out), 'no bare LF introduced');
});

test('the rewrite is a no-op when there is no verify block', () => {
  const content = 'version: "2.7.0"\nproject_name: "demo"\n';
  assert.strictEqual(scaffoldVerifyBlock(content), content);
});

// --- lint globs ---

test('the scaffolded lint config only covers the framework documents', () => {
  const strip = (text) => JSON.parse(text.replace(/^\s*\/\/.*$/gm, ''));
  const source = repoFile('.markdownlint-cli2.jsonc');
  const parsed = strip(scaffoldLintGlobs(source));

  assert.deepStrictEqual(parsed.globs, SCAFFOLD_GLOBS);
  assert.ok(!parsed.globs.includes('**/*.md'), 'must not lint the adopter\'s own markdown');
  // Everything except globs carries across untouched. Compared against the
  // source rather than a literal, so adding an ignore or a rule to the
  // repository's config does not fail this test for the wrong reason.
  const before = strip(source);
  assert.deepStrictEqual(parsed.ignores, before.ignores, 'ignores untouched');
  assert.deepStrictEqual(parsed.config, before.config, 'rules untouched');
});

test('the glob rewrite is a no-op when there are no globs', () => {
  const content = '{ "config": { "default": true } }';
  assert.strictEqual(scaffoldLintGlobs(content), content);
});

// --- generated ACTIVE_CONTEXT.md ---

test('the generated ACTIVE_CONTEXT.md satisfies MD022 and MD032', () => {
  // It failed both in 15 places, and it is the one file in a fresh scaffold
  // that the framework's own lint rules reject.
  const lines = activeContextDocument('demo', '2026-09-02').split('\n');
  lines.forEach((line, i) => {
    const prev = i === 0 ? '' : lines[i - 1];
    const next = lines[i + 1] === undefined ? '' : lines[i + 1];
    if (/^#{1,6} /.test(line)) {
      assert.ok(i === 0 || prev === '', `MD022: blank line needed above line ${i + 1}: ${line}`);
      assert.ok(next === '', `MD022: blank line needed below line ${i + 1}: ${line}`);
    }
    // First line of a list block needs a blank line above it.
    const isItem = (l) => /^\s*([-*+]|\d+\.) /.test(l);
    if (isItem(line) && !isItem(prev)) {
      assert.ok(prev === '', `MD032: blank line needed above line ${i + 1}: ${line}`);
    }
  });
});

test('the generated ACTIVE_CONTEXT.md interpolates its inputs', () => {
  const doc = activeContextDocument('my-app', '2026-09-02');
  assert.ok(doc.includes('for my-app.'), doc.slice(0, 200));
  assert.ok(doc.includes('**Last Updated:** 2026-09-02'));
  assert.ok(doc.includes('verify.test_cmd'), 'points at the gate the adopter must configure');
});

// --- the gate a scaffolded project actually runs ---

function scaffoldedProject(lintCmd) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ace-scaffold-'));
  let config = scaffoldVerifyBlock(repoFile('.aceconfig'));
  if (lintCmd !== undefined) {
    config = config.replace(/lint_cmd: ".*"/, `lint_cmd: "${lintCmd}"`);
  }
  fs.writeFileSync(path.join(dir, '.aceconfig'), config);
  return dir;
}

// The real lint command is stubbed so the suite stays off the network; the
// unstubbed path is covered by the manual scaffold in the branch's
// verification steps.
test('a scaffolded project passes its own verify gate', () => {
  const result = spawnSync('sh', [VERIFY_SH], { cwd: scaffoldedProject('true'), encoding: 'utf8' });
  assert.strictEqual(result.status, 0, result.stdout + result.stderr);
  assert.ok(result.stdout.includes('VERIFY_RESULT=pass gate=all'), result.stdout);
});

test('a scaffolded project is told its gate runs no tests', () => {
  const result = spawnSync('sh', [VERIFY_SH], { cwd: scaffoldedProject('true'), encoding: 'utf8' });
  assert.ok(result.stdout.includes('not running any tests'), result.stdout);
});

test('a scaffolded project still fails on a real lint failure', () => {
  // The fix must not be another gate that cannot fail.
  const result = spawnSync('sh', [VERIFY_SH], { cwd: scaffoldedProject('exit 1'), encoding: 'utf8' });
  assert.strictEqual(result.status, 1, result.stdout);
  assert.ok(result.stdout.includes('VERIFY_RESULT=fail gate=lint'), result.stdout);
});

module.exports = run;
