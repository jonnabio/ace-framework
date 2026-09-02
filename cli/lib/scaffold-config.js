/**
 * scaffold-config.js — rewrites config files on their way into a new project.
 *
 * .aceconfig serves two audiences: this repository, and every project the CLI
 * creates. Most of it is meant to be copied verbatim; a few fields describe
 * *this* repository and must be rewritten. Nothing in the file distinguished
 * the two, so v2.7.0 shipped `test_cmd: "cd cli && npm test"` to every
 * scaffolded project, where there is no cli/ directory. Their verify gate
 * failed on first run, which blocks the Stop hook and fails every loop task.
 * See docs/rca/RCA-001-scaffold-verify-gate.md.
 *
 * Pure string transforms, so they are testable without scaffolding anything.
 * Zero dependencies.
 */

'use strict';

// verify.sh parses these with sed and requires flat `key: "value"` lines with
// no embedded quotes. Keep it that way.
const SCAFFOLD_VERIFY_BLOCK = `verify:
  # The gate that matters most, and the one this CLI cannot fill in for you.
  # Set it to this project's test command (npm test, pytest, cargo test, ...).
  # Until you do, the gate runs no tests and says so on every full run.
  test_cmd: ""
  lint_cmd: "npx --yes markdownlint-cli2"
  typecheck_cmd: ""`;

function usesCrlf(content) {
  return content.includes('\r\n');
}

function applyEol(text, crlf) {
  return crlf ? text.replace(/\n/g, '\r\n') : text;
}

/**
 * Replace the verify: block with one that suits a fresh project.
 * Returns the content unchanged if there is no verify: block to replace.
 */
function scaffoldVerifyBlock(content) {
  // The block runs from `verify:` to the last of its indented lines. Matching
  // on indentation rather than a fixed key list keeps this working if a key
  // is added later.
  const block = /^verify:[ \t]*\r?\n(?:[ \t]+[^\r\n]*\r?\n?)*/m;
  if (!block.test(content)) {
    return content;
  }
  const crlf = usesCrlf(content);
  const replacement = applyEol(`${SCAFFOLD_VERIFY_BLOCK}\n`, crlf);
  return content.replace(block, replacement);
}

module.exports = { scaffoldVerifyBlock };
