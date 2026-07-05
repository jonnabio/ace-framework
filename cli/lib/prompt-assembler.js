/**
 * prompt-assembler.js — builds the minimal, self-contained prompt for one
 * task attempt (Tier 1/2 loading only: the task, its acceptance gate, and
 * pointers to the relevant playbook files — never the whole repository).
 *
 * Deterministic: same task + config in, same prompt out.
 */

'use strict';

/**
 * Extract the entry standards list from raw .aceconfig text.
 * Looks for the `standards:` list under `entry:` and returns the paths.
 */
function extractEntryStandards(configText) {
  const lines = String(configText).split(/\r?\n/);
  const standards = [];
  let inEntry = false;
  let inStandards = false;
  for (const line of lines) {
    if (/^entry:\s*$/.test(line)) { inEntry = true; continue; }
    if (inEntry && /^\S/.test(line)) { inEntry = false; inStandards = false; }
    if (inEntry && /^\s+standards:\s*$/.test(line)) { inStandards = true; continue; }
    if (inStandards) {
      const m = line.match(/^\s+-\s+(\S+)/);
      if (m) { standards.push(m[1]); continue; }
      inStandards = false;
    }
  }
  return standards;
}

/**
 * Assemble the prompt for a task attempt.
 *
 * @param {object} opts
 * @param {object} opts.task - task per .ace/schemas/tasks.schema.json
 * @param {object} opts.defaults - queue defaults
 * @param {string} opts.verifyCmd - the exact command the verify gate will run
 * @param {string} opts.resultFile - progress log path the agent must write
 * @param {string} [opts.configText] - raw .aceconfig contents (for standards)
 * @param {object} [opts.lastFailure] - most recent failure entry, if retrying
 * @returns {string}
 */
function assemblePrompt(opts) {
  const { task, verifyCmd, resultFile, configText, lastFailure } = opts;
  const role = task.role || 'Developer';
  const lines = [];

  lines.push(`You are operating inside an ACE-Framework project as the ${role} role`);
  lines.push('defined in .ace/roles/roles.md. This is a fresh session with no prior');
  lines.push('conversation; everything you need is below or in the referenced files.');
  lines.push('');
  lines.push(`# Task ${task.id}: ${task.name}`);
  lines.push('');
  lines.push('## Objective');
  lines.push(task.objective);
  lines.push('');

  const files = task.files || {};
  if ((files.create && files.create.length) || (files.modify && files.modify.length)) {
    lines.push('## Files in scope');
    if (files.create && files.create.length) lines.push(`- Create: ${files.create.join(', ')}`);
    if (files.modify && files.modify.length) lines.push(`- Modify: ${files.modify.join(', ')}`);
    lines.push('');
  }

  lines.push('## Acceptance gate');
  lines.push(`Your work is verified by running: \`${verifyCmd}\``);
  lines.push('It must exit 0. Run it yourself before finishing.');
  lines.push('');

  lines.push('## Constraints (read before writing code)');
  const standards = configText ? extractEntryStandards(configText) : [];
  for (const s of standards) lines.push(`- Read and follow ${s}`);
  lines.push('- Check docs/rca/regression-guards.yaml before modifying any guarded file.');
  lines.push('- Atomic changes only; do not touch files outside the task scope.');
  if (task.notes) lines.push(`- Note: ${task.notes}`);
  lines.push('');

  if (lastFailure) {
    lines.push('## Previous attempt failed');
    lines.push(`The last attempt failed with: ${lastFailure.summary}`);
    if (lastFailure.trace_ref) {
      lines.push(`Full trace: ${lastFailure.trace_ref}. Read it and take a different approach;`);
      lines.push('repeating the same failure will block this task.');
    }
    lines.push('');
  }

  lines.push('## On completion');
  lines.push(`Write a progress log to ${resultFile} summarizing what you changed,`);
  lines.push('decisions made, and anything the next agent must know.');
  lines.push('Do NOT modify docs/progress/tasks.json - the orchestrator owns it.');

  return lines.join('\n');
}

module.exports = { assemblePrompt, extractEntryStandards };
