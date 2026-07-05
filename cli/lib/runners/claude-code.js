/**
 * runners/claude-code.js — headless Claude Code runner (ADR-002).
 *
 * Each run() spawns a fresh `claude -p` session: the prompt goes in on
 * stdin (no shell-escaping or argv-length issues), the transcript comes
 * back on stdout and is written to the trace file. Session-per-attempt is
 * what makes context flushing mechanical rather than aspirational.
 */

'use strict';

const fs = require('fs');
const { spawnSync } = require('child_process');

const BINARY = 'claude';
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;

function buildInvocation() {
  // -p: non-interactive print mode. The prompt is piped via stdin.
  return { command: BINARY, args: ['-p'] };
}

function create(spawnImpl) {
  const spawn = spawnImpl || spawnSync;

  return {
    name: 'claude-code',

    isAvailable() {
      const probe = spawn(BINARY, ['--version'], { encoding: 'utf8', shell: process.platform === 'win32' });
      if (probe.error || probe.status !== 0) {
        return {
          ok: false,
          reason: `Claude Code CLI not found (tried \`${BINARY} --version\`). Install it `
            + 'from https://claude.com/claude-code, or use the "manual" runner: '
            + 'set defaults.runner to "manual" in docs/progress/tasks.json.',
        };
      }
      return { ok: true };
    },

    async run(request) {
      const { command, args } = buildInvocation();
      const result = spawn(command, args, {
        input: request.prompt,
        cwd: request.cwd,
        encoding: 'utf8',
        timeout: SESSION_TIMEOUT_MS,
        shell: process.platform === 'win32',
        maxBuffer: 64 * 1024 * 1024,
      });

      const stdout = result.stdout || '';
      const stderr = result.stderr || '';

      fs.writeFileSync(request.traceFile,
        `# Claude Code session: ${request.taskId} attempt ${request.attempt}\n\n`
        + `Invocation: \`${command} ${args.join(' ')}\` (prompt on stdin)\n\n`
        + '## Prompt\n\n```\n'
        + `${request.prompt}\n`
        + '```\n\n## Transcript\n\n'
        + `${stdout || '(no output)'}\n`
        + (stderr ? `\n## stderr\n\n\`\`\`\n${stderr}\n\`\`\`\n` : ''));

      if (result.error) {
        return { ok: false, output: `failed to spawn ${command}: ${result.error.message}` };
      }
      if (result.status !== 0) {
        return {
          ok: false,
          output: `${command} exited ${result.status}. stderr tail: `
            + `${stderr.split(/\r?\n/).filter(Boolean).slice(-3).join(' | ') || '(empty)'}`,
        };
      }
      return { ok: true, output: stdout };
    },
  };
}

module.exports = create();
module.exports._create = create;
module.exports._buildInvocation = buildInvocation;
