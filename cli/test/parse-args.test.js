'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const { test, run } = require('./harness');

const { parseArgs, defaultProjectName, DEFAULT_TARGET_DIR } = require('../lib/parse-args');

const BIN = path.join(__dirname, '..', 'bin', 'create-ace-framework.js');

function runBin(args, opts) {
  return spawnSync(process.execPath, [BIN, ...args], { encoding: 'utf8', ...opts });
}

function ok(argv) {
  const result = parseArgs(argv);
  assert.ok(result.ok, `expected success, got: ${result.message}`);
  return result.options;
}

// --- parser ---

test('parses a bare target directory', () => {
  assert.strictEqual(ok(['my-project']).targetDir, 'my-project');
  assert.strictEqual(ok(['.']).targetDir, '.');
});

test('parses --pack and --adapter with their values', () => {
  const o = ok(['proj', '--pack', 'scientific', '--adapter', 'claude-code']);
  assert.strictEqual(o.packName, 'scientific');
  assert.strictEqual(o.adapterName, 'claude-code');
  assert.strictEqual(o.targetDir, 'proj');
});

test('flags may appear before the target directory', () => {
  const o = ok(['--pack', 'ai-research', 'proj']);
  assert.strictEqual(o.packName, 'ai-research');
  assert.strictEqual(o.targetDir, 'proj');
});

test('rejects an unrecognised flag instead of discarding it', () => {
  // The old inline parser had no else branch: --no-git was accepted and
  // silently dropped, so the caller believed an option had taken effect.
  const result = parseArgs(['proj', '--no-git']);
  assert.strictEqual(result.ok, false);
  assert.ok(result.message.includes('--no-git'), result.message);
});

test('rejects a value flag with no value', () => {
  assert.strictEqual(parseArgs(['--pack']).ok, false);
  assert.strictEqual(parseArgs(['--pack', '--adapter', 'claude-code']).ok, false);
  assert.strictEqual(parseArgs(['proj', '--adapter']).ok, false);
});

test('rejects a second positional argument', () => {
  const result = parseArgs(['a', 'b']);
  assert.strictEqual(result.ok, false);
  assert.ok(result.message.includes('b'), result.message);
});

test('recognises the short and long forms of --yes, --help and --version', () => {
  assert.strictEqual(ok(['-y']).yes, true);
  assert.strictEqual(ok(['--yes']).yes, true);
  assert.strictEqual(ok(['-h']).help, true);
  assert.strictEqual(ok(['--help']).help, true);
  assert.strictEqual(ok(['-V']).version, true);
  assert.strictEqual(ok(['--version']).version, true);
});

test('defaults are unset when no flags are given', () => {
  const o = ok([]);
  assert.deepStrictEqual(
    [o.targetDir, o.packName, o.adapterName, o.yes, o.help, o.version],
    [null, null, null, false, false, false],
  );
});

test('defaultProjectName uses the basename, and the cwd for "."', () => {
  assert.strictEqual(defaultProjectName('../some/my-app', '/tmp'), 'my-app');
  assert.strictEqual(defaultProjectName('.', '/tmp/current-dir'), 'current-dir');
  assert.strictEqual(DEFAULT_TARGET_DIR, './ace-project');
});

// --- bin behaviour ---

test('--version prints only the version, with no banner', () => {
  const result = runBin(['--version']);
  assert.strictEqual(result.status, 0, result.stderr);
  assert.strictEqual(result.stdout.trim(), require('../package.json').version);
});

test('--help prints the usage and exits 0', () => {
  const result = runBin(['--help']);
  assert.strictEqual(result.status, 0, result.stderr);
  assert.ok(result.stdout.includes('Usage: create-ace-framework'), result.stdout);
  assert.ok(result.stdout.includes('--yes'), 'documents the unattended flag');
});

test('an unknown flag exits 1 and names the flag', () => {
  const result = runBin(['--no-git']);
  assert.strictEqual(result.status, 1, result.stdout);
  assert.ok((result.stdout + result.stderr).includes('--no-git'));
});

test('--yes refuses a non-empty target directory instead of writing into it', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ace-yes-'));
  fs.writeFileSync(path.join(dir, 'existing.txt'), 'do not clobber me');
  const result = runBin([dir, '--yes']);
  assert.strictEqual(result.status, 1, result.stdout);
  assert.ok((result.stdout + result.stderr).includes('not empty'), result.stdout);
  assert.deepStrictEqual(fs.readdirSync(dir), ['existing.txt'], 'left the directory alone');
});

test('--yes reaches the download step without prompting', () => {
  // The old CLI always prompted, so an unattended run hung or died on EOF.
  // Here stdin is closed and PATH is emptied, so the git clone fails
  // immediately: the run gets as far as the download and no further, which is
  // exactly far enough to prove no prompt was waiting in between. Emptying
  // PATH also keeps this test off the network.
  const dir = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'ace-yes-')), 'fresh');
  const result = runBin([dir, '--yes'], {
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, PATH: '' },
    timeout: 30000,
  });
  const out = result.stdout + result.stderr;
  assert.ok(!out.includes('Project name'), 'must not prompt for a project name');
  assert.ok(!out.includes('Enter project directory'), 'must not prompt for a directory');
  assert.ok(out.includes('Downloading'), `expected to reach the download step:\n${out}`);
  assert.strictEqual(result.status, 1, 'clone cannot succeed with an empty PATH');
});

module.exports = run;
