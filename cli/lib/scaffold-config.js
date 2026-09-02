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

// The framework's own documents, which are lint-clean on a fresh scaffold.
// The repository's own config uses **/*.md, which is right here and wrong in
// a project that has markdown of its own: `create-ace-framework .` inside an
// existing repository would lint every file the adopter already had, and the
// day-one gate would fail on documents ACE never touched.
const SCAFFOLD_GLOBS = ['.ace/**/*.md', 'docs/**/*.md', 'ACE-SPEC.md', 'USER_GUIDE.md'];

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

/**
 * Narrow the markdownlint globs to the directories the framework owns.
 * Returns the content unchanged if there is no globs array to replace.
 */
function scaffoldLintGlobs(content) {
  const globs = /^[ \t]*"globs":[ \t]*\[[^\]]*\],?/m;
  if (!globs.test(content)) {
    return content;
  }
  const crlf = usesCrlf(content);
  const list = SCAFFOLD_GLOBS.map((g) => `"${g}"`).join(', ');
  const replacement = applyEol(`  // Scoped to the documents ACE-Framework ships, which are lint-clean.
  // Widen this to ["**/*.md"] once your own markdown passes, so the gate
  // covers it too.
  "globs": [${list}],`, crlf);
  return content.replace(globs, replacement);
}

/**
 * The ACTIVE_CONTEXT.md a new project starts with.
 *
 * Lives here rather than inline in the bin so its shape can be asserted: the
 * first version had no blank lines around headings or lists and failed the
 * framework's own lint rules in 15 places, which only mattered once
 * scaffolded projects got a working lint gate.
 */
function activeContextDocument(projectName, today) {
  return `# Active Context: Project Setup

## Session Metadata

- **Last Updated:** ${today}
- **Active Role:** Architect
- **Mode:** PLANNING

## Current Objective

Initialize and configure the ACE-Framework for ${projectName}.

## Current State

### Working

- ACE-Framework structure initialized

### In Progress

- Project customization

### Blocked

- None

## Next Steps

1. [ ] Set \`verify.test_cmd\` in .aceconfig to this project's test command
2. [ ] Customize .ace/standards/ for your tech stack
3. [ ] Create ADR-001 for tech stack decisions
4. [ ] Set up first feature specification

## Active Constraints

- .ace/standards/coding.md
- .ace/standards/security.md

## Session Notes

- Framework initialized via create-ace-framework CLI
`;
}

module.exports = {
  scaffoldVerifyBlock,
  scaffoldLintGlobs,
  activeContextDocument,
  SCAFFOLD_GLOBS,
};
