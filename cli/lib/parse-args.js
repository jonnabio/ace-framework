/**
 * parse-args.js — argument parser for bin/create-ace-framework.js
 *
 * Split out of the bin so the parsing rules can be unit-tested without
 * spawning a process and without reaching the network. The bin's previous
 * inline loop had no else branch: any flag it did not recognise was silently
 * discarded, so `--no-git` looked accepted and did nothing.
 *
 * Returns { ok: true, options } or { ok: false, message }. It never exits or
 * prints — that is the caller's job.
 *
 * Zero dependencies.
 */

'use strict';

const path = require('path');

const VALUE_FLAGS = { '--pack': 'packName', '--adapter': 'adapterName' };

const USAGE = `Usage: create-ace-framework [directory] [options]

Scaffolds the ACE-Framework (.ace/ + docs/) into a project.

Options:
  --pack <name>       Install an expansion pack (scientific, ai-research)
  --adapter <name>    Install an enforced-hooks adapter (claude-code)
  -y, --yes           Accept every default; never prompt. The project name
                      becomes the target directory's basename, and a
                      non-empty target is refused rather than written into.
  -h, --help          Show this message and exit
  -V, --version       Print the CLI version and exit

Examples:
  npx create-ace-framework my-project
  npx create-ace-framework .
  npx create-ace-framework my-project --pack scientific --adapter claude-code
  npx create-ace-framework my-project --yes        # unattended, for CI`;

function parseArgs(argv) {
  const options = {
    targetDir: null,
    packName: null,
    adapterName: null,
    yes: false,
    help: false,
    version: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === '-h' || arg === '--help') {
      options.help = true;
    } else if (arg === '-V' || arg === '--version') {
      options.version = true;
    } else if (arg === '-y' || arg === '--yes') {
      options.yes = true;
    } else if (Object.prototype.hasOwnProperty.call(VALUE_FLAGS, arg)) {
      const value = argv[i + 1];
      // A missing value used to be ignored along with the flag, so
      // `--pack` alone scaffolded a project with no pack and said nothing.
      if (value === undefined || value.startsWith('-')) {
        return { ok: false, message: `${arg} requires a value.` };
      }
      options[VALUE_FLAGS[arg]] = value;
      i += 1;
    } else if (arg.startsWith('-')) {
      return { ok: false, message: `Unknown option: ${arg}` };
    } else if (options.targetDir === null) {
      options.targetDir = arg;
    } else {
      return { ok: false, message: `Unexpected argument: ${arg} (target directory is already "${options.targetDir}")` };
    }
  }

  return { ok: true, options };
}

// The project name a --yes run would choose, so the bin and the tests agree
// on one definition.
function defaultProjectName(targetDir, cwd) {
  return targetDir === '.' ? path.basename(cwd) : path.basename(path.resolve(targetDir));
}

module.exports = { parseArgs, defaultProjectName, USAGE, DEFAULT_TARGET_DIR: './ace-project' };
