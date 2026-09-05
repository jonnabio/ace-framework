'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const { test, run } = require('./harness');

const REPO_ROOT = path.join(__dirname, '..', '..');
const ADAPTER_DIR = path.join(REPO_ROOT, '.ace', 'adapters', 'claude-code');

function toPosix(p) {
  return p.replace(/\\/g, '/');
}

function shAvailable() {
  const probe = spawnSync('sh', ['-c', 'exit 0']);
  return !probe.error && probe.status === 0;
}

const HAS_SH = shAvailable();

function runHook(script, stdinText, cwd) {
  return spawnSync('sh', [toPosix(path.join(ADAPTER_DIR, script))], {
    input: stdinText, cwd, encoding: 'utf8',
  });
}

const VERIFY_SH = toPosix(path.join(REPO_ROOT, '.ace', 'scripts', 'verify.sh'));

// Runs the real verify.sh against a throwaway .aceconfig, so the profile
// logic is exercised rather than mocked.
function runVerify(args, config) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ace-verify-'));
  fs.writeFileSync(path.join(dir, '.aceconfig'), config);
  return spawnSync('sh', [VERIFY_SH, ...args], { cwd: dir, encoding: 'utf8' });
}

function verifyConfig({ test = '', lint = '', typecheck = '' }) {
  return `verify:\n  test_cmd: "${test}"\n  lint_cmd: "${lint}"\n  typecheck_cmd: "${typecheck}"\n`;
}

function makeGuardedProject() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ace-adapter-'));
  fs.mkdirSync(path.join(dir, 'docs', 'rca'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'docs', 'rca', 'regression-guards.yaml'), `guards:
  - id: RCA-001
    title: "Sort order regression"
    severity: high
    rca_file: docs/rca/RCA-001-sort.md
    guarded_files:
      - src/components/UserList.tsx
    invariants:
      - "Sort order persists across page changes"
    tests:
      - tests/regression/rca-001.test.ts
`);
  return dir;
}

function hookJson(filePath) {
  return JSON.stringify({
    tool_name: 'Edit',
    tool_input: { file_path: filePath, old_string: 'a', new_string: 'b' },
  });
}

// --- settings template ---

test('settings template is valid JSON wiring PreToolUse and Stop hooks', () => {
  const template = JSON.parse(fs.readFileSync(path.join(ADAPTER_DIR, 'settings-template.json'), 'utf8'));
  const pre = template.hooks.PreToolUse[0];
  assert.ok(pre.matcher.includes('Edit') && pre.matcher.includes('Write'), pre.matcher);
  assert.ok(pre.hooks[0].command.includes('guard-check.sh'));
  assert.ok(template.hooks.Stop[0].hooks[0].command.includes('stop-verify.sh'));
});

// --- guard-check.sh ---

test('guard-check blocks (exit 2) an edit to a guarded path', () => {
  if (!HAS_SH) { console.log('  (skipped: no sh on PATH)'); return; }
  const dir = makeGuardedProject();
  const result = runHook('guard-check.sh', hookJson('D:\\proj\\src\\components\\UserList.tsx'), dir);
  assert.strictEqual(result.status, 2, result.stderr);
  assert.ok(result.stderr.includes('BLOCKED by ACE regression guard'), result.stderr);
  assert.ok(result.stderr.includes('RCA'), 'points at the RCA');
});

test('guard-check allows (exit 0) an unguarded path', () => {
  if (!HAS_SH) { console.log('  (skipped: no sh on PATH)'); return; }
  const dir = makeGuardedProject();
  const result = runHook('guard-check.sh', hookJson('/proj/src/components/Other.tsx'), dir);
  assert.strictEqual(result.status, 0, result.stderr);
});

test('guard-check does not match a partial path segment', () => {
  // A guard on src/components/UserList.tsx must not block
  // vendor/NOTsrc/components/UserList.tsx. The match is anchored on a
  // directory boundary, not a bare suffix.
  if (!HAS_SH) { console.log('  (skipped: no sh on PATH)'); return; }
  const dir = makeGuardedProject();
  const result = runHook('guard-check.sh', hookJson('vendor/NOTsrc/components/UserList.tsx'), dir);
  assert.strictEqual(result.status, 0, result.stderr);
});

test('guard-check still blocks an absolute path ending in the guarded path', () => {
  if (!HAS_SH) { console.log('  (skipped: no sh on PATH)'); return; }
  const dir = makeGuardedProject();
  const result = runHook('guard-check.sh', hookJson('/home/me/proj/src/components/UserList.tsx'), dir);
  assert.strictEqual(result.status, 2, result.stderr);
});

test('guard-check blocks a path equal to the guarded path', () => {
  if (!HAS_SH) { console.log('  (skipped: no sh on PATH)'); return; }
  const dir = makeGuardedProject();
  const result = runHook('guard-check.sh', hookJson('src/components/UserList.tsx'), dir);
  assert.strictEqual(result.status, 2, result.stderr);
});

test('guard-check allows everything when no guards file exists', () => {
  if (!HAS_SH) { console.log('  (skipped: no sh on PATH)'); return; }
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ace-adapter-'));
  const result = runHook('guard-check.sh', hookJson('/proj/src/anything.ts'), dir);
  assert.strictEqual(result.status, 0, result.stderr);
});

test('guard-check ignores non-file tool calls', () => {
  if (!HAS_SH) { console.log('  (skipped: no sh on PATH)'); return; }
  const dir = makeGuardedProject();
  const result = runHook('guard-check.sh', JSON.stringify({ tool_name: 'Bash', tool_input: { command: 'ls' } }), dir);
  assert.strictEqual(result.status, 0, result.stderr);
});

// --- verify.sh profiles ---

test('verify.sh runs every configured command and reports gate=all', () => {
  if (!HAS_SH) { console.log('  (skipped: no sh on PATH)'); return; }
  const r = runVerify([], verifyConfig({ test: 'true', lint: 'true', typecheck: 'true' }));
  assert.strictEqual(r.status, 0, r.stdout + r.stderr);
  assert.ok(r.stdout.includes('VERIFY_RESULT=pass gate=all'), r.stdout);
  assert.ok(r.stdout.includes("Gate 'test'"), 'full profile runs the test gate');
});

test('verify.sh --fast skips the test command and reports gate=fast', () => {
  if (!HAS_SH) { console.log('  (skipped: no sh on PATH)'); return; }
  const r = runVerify(['--fast'], verifyConfig({ test: 'exit 1', lint: 'true' }));
  assert.strictEqual(r.status, 0, r.stdout + r.stderr);
  assert.ok(r.stdout.includes('VERIFY_RESULT=pass gate=fast'), r.stdout);
  assert.ok(!r.stdout.includes("Gate 'test'"), 'fast profile must not run the test gate');
});

test('verify.sh --fast still fails on a failing lint', () => {
  if (!HAS_SH) { console.log('  (skipped: no sh on PATH)'); return; }
  const r = runVerify(['--fast'], verifyConfig({ test: 'true', lint: 'exit 1' }));
  assert.strictEqual(r.status, 1, r.stdout);
  assert.ok(r.stdout.includes('VERIFY_RESULT=fail gate=lint'), r.stdout);
});

test('verify.sh --fast fails when only test_cmd is configured', () => {
  // Silence must not count as passing: a project whose only gate is its test
  // suite has nothing for the fast profile to run, and must not pass anyway.
  if (!HAS_SH) { console.log('  (skipped: no sh on PATH)'); return; }
  const r = runVerify(['--fast'], verifyConfig({ test: 'true' }));
  assert.strictEqual(r.status, 1, r.stdout);
  assert.ok(r.stdout.includes('VERIFY_RESULT=fail gate=unconfigured'), r.stdout);
});

test('verify.sh rejects an unknown option instead of treating it as a config path', () => {
  if (!HAS_SH) { console.log('  (skipped: no sh on PATH)'); return; }
  const r = runVerify(['--quick'], verifyConfig({ lint: 'true' }));
  assert.strictEqual(r.status, 2, r.stdout);
  assert.ok(r.stdout.includes('Unknown option'), r.stdout);
});

// --- stop-verify.sh ---

function makeVerifyProject(verifyExit) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ace-adapter-'));
  fs.mkdirSync(path.join(dir, '.ace', 'scripts'), { recursive: true });
  fs.writeFileSync(path.join(dir, '.ace', 'scripts', 'verify.sh'),
    `#!/bin/sh\nprintf '%s' "$*" > "$(dirname "$0")/args.txt"\necho "VERIFY_RESULT=${verifyExit === 0 ? 'pass gate=fast' : 'fail gate=lint'}"\nexit ${verifyExit}\n`);
  return dir;
}

test('stop-verify blocks the stop (exit 2) when the verify gate fails', () => {
  if (!HAS_SH) { console.log('  (skipped: no sh on PATH)'); return; }
  const result = runHook('stop-verify.sh', '{"stop_hook_active":false}', makeVerifyProject(1));
  assert.strictEqual(result.status, 2, result.stderr);
  assert.ok(result.stderr.includes('do not stop yet'), result.stderr);
});

test('stop-verify allows the stop when the gate passes', () => {
  if (!HAS_SH) { console.log('  (skipped: no sh on PATH)'); return; }
  const result = runHook('stop-verify.sh', '{"stop_hook_active":false}', makeVerifyProject(0));
  assert.strictEqual(result.status, 0, result.stderr);
});

test('stop-verify asks for the fast profile', () => {
  if (!HAS_SH) { console.log('  (skipped: no sh on PATH)'); return; }
  const dir = makeVerifyProject(0);
  runHook('stop-verify.sh', '{"stop_hook_active":false}', dir);
  const args = fs.readFileSync(path.join(dir, '.ace', 'scripts', 'args.txt'), 'utf8');
  assert.strictEqual(args, '--fast', `stop hook passed: ${args}`);
});

test('stop-verify never blocks twice in one turn (stop_hook_active)', () => {
  if (!HAS_SH) { console.log('  (skipped: no sh on PATH)'); return; }
  const result = runHook('stop-verify.sh', '{"stop_hook_active":true}', makeVerifyProject(1));
  assert.strictEqual(result.status, 0, result.stderr);
});

module.exports = run;
