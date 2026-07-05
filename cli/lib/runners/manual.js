/**
 * runners/manual.js — the always-works, vendor-neutral runner (ADR-002).
 *
 * Prints the assembled prompt; the human runs the session in any agent tool
 * (or does the work themselves) and presses Enter when done. The verify gate
 * still decides success, so this runner never needs to know what happened.
 */

'use strict';

const fs = require('fs');
const readline = require('readline');

function create(io) {
  const input = (io && io.input) || process.stdin;
  const output = (io && io.output) || process.stdout;

  return {
    name: 'manual',

    isAvailable() {
      return { ok: true };
    },

    async run(request) {
      output.write('\n=============== ACE MANUAL RUNNER ===============\n');
      output.write(`Task ${request.taskId}, attempt ${request.attempt}.\n`);
      output.write('Paste the prompt below into your agent tool (or do the work\n');
      output.write('yourself), then return here and press Enter to run the verify gate.\n');
      output.write('--------------------------------------------------\n\n');
      output.write(`${request.prompt}\n`);
      output.write('\n--------------------------------------------------\n');

      const answered = await new Promise((resolve) => {
        const rl = readline.createInterface({ input, output });
        let done = false;
        rl.question('Press Enter when the session is complete... ', () => {
          done = true;
          rl.close();
          resolve(true);
        });
        // If stdin closes before Enter (piped input exhausted, Ctrl+D),
        // resolving as a runner failure halts the loop predictably instead
        // of letting node exit silently mid-loop with code 0.
        rl.on('close', () => { if (!done) resolve(false); });
      });

      if (!answered) {
        return {
          ok: false,
          output: 'stdin closed before the manual session was confirmed - cannot continue unattended. '
            + 'Run ace-framework loop from an interactive terminal when using the manual runner.',
        };
      }

      fs.writeFileSync(request.traceFile,
        `# Manual session: ${request.taskId} attempt ${request.attempt}\n\n`
        + 'Executed by a human-driven session outside the orchestrator; no\n'
        + 'transcript was captured. The prompt used is recorded below.\n\n'
        + '## Prompt\n\n'
        + '```\n'
        + `${request.prompt}\n`
        + '```\n');

      return { ok: true, output: '(manual session; see trace for the prompt used)' };
    },
  };
}

module.exports = create();
module.exports._create = create;
