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

// --- stop-verify.sh ---

function makeVerifyProject(verifyExit) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ace-adapter-'));
  fs.mkdirSync(path.join(dir, '.ace', 'scripts'), { recursive: true });
  fs.writeFileSync(path.join(dir, '.ace', 'scripts', 'verify.sh'),
    `#!/bin/sh\necho "VERIFY_RESULT=${verifyExit === 0 ? 'pass gate=all' : 'fail gate=test'}"\nexit ${verifyExit}\n`);
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

test('stop-verify never blocks twice in one turn (stop_hook_active)', () => {
  if (!HAS_SH) { console.log('  (skipped: no sh on PATH)'); return; }
  const result = runHook('stop-verify.sh', '{"stop_hook_active":true}', makeVerifyProject(1));
  assert.strictEqual(result.status, 0, result.stderr);
});

module.exports = run;
