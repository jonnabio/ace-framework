/**
 * reflector.js — automatic Reflector invocation (Implementation Plan v2.7, T007).
 *
 * After a failed attempt, spawn a fresh Reflector session (same runner
 * interface as the Generator, ADR-002) with the failure trace and the
 * reflect-on-trace golden prompt. The output contract is strict:
 *
 *   CATEGORY: <OneWord>
 *   LESSON: <one sentence>
 *
 * or the single token NO_LESSON. Anything else is rejected and logged —
 * malformed reflections must never pollute the Curator staging file.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const DEFAULT_PROMPT_PATH = path.join('.ace', 'prompts', 'reflect-on-trace.md');
const MAX_TRACE_CHARS = 20000;
const CATEGORY_RE = /^CATEGORY:\s*([A-Za-z][A-Za-z-]{1,30})\s*$/;
const LESSON_RE = /^LESSON:\s*(\S.{9,300})\s*$/;

/**
 * Build the Reflector prompt from the golden prompt template.
 */
function buildReflectionPrompt({ task, failure, traceContent, template }) {
  const trace = String(traceContent).length > MAX_TRACE_CHARS
    ? `${String(traceContent).slice(-MAX_TRACE_CHARS)}\n(trace truncated to the last ${MAX_TRACE_CHARS} characters)`
    : String(traceContent);
  return template
    .replace(/\{\{TASK_ID\}\}/g, task.id)
    .replace(/\{\{TASK_NAME\}\}/g, task.name)
    .replace(/\{\{OBJECTIVE\}\}/g, task.objective)
    .replace(/\{\{FAILURE_SUMMARY\}\}/g, failure.summary)
    .replace(/\{\{TRACE\}\}/g, trace);
}

/**
 * Parse a Reflector response against the strict output contract.
 * @returns {{category: string, lesson: string} | {noLesson: true} | null}
 *   null = malformed (reject).
 */
function parseReflection(output) {
  const lines = String(output).split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && l !== '```');
  if (lines.length === 1 && lines[0] === 'NO_LESSON') return { noLesson: true };
  if (lines.length !== 2) return null;
  const category = lines[0].match(CATEGORY_RE);
  const lesson = lines[1].match(LESSON_RE);
  if (!category || !lesson) return null;
  return { category: category[1], lesson: lesson[1].trim() };
}

/**
 * Run one Reflector session for a failed attempt.
 *
 * @param {object} opts
 * @param {object} opts.task - the failed task
 * @param {object} opts.failure - the failure entry just recorded
 * @param {string} opts.traceFile - absolute path to the attempt trace
 * @param {object} opts.runner - runner adapter (ADR-002); runs in a fresh session
 * @param {string} opts.projectDir - project root
 * @param {function} opts.sink - async ({category, lesson, provenance}) => void;
 *   receives only well-formed lessons (the Curator's addLesson in production)
 * @param {object} [opts.log]
 * @param {string} [opts.promptPath] - golden prompt template location
 * @returns {{outcome: 'distilled'|'no_lesson'|'rejected'|'runner_error', lesson?: object}}
 */
async function reflect(opts) {
  const log = opts.log || console;
  const promptPath = path.join(opts.projectDir, opts.promptPath || DEFAULT_PROMPT_PATH);
  if (!fs.existsSync(promptPath)) {
    log.warn(`Reflector skipped: golden prompt not found at ${promptPath}`);
    return { outcome: 'rejected' };
  }
  const template = fs.readFileSync(promptPath, 'utf8');
  const traceContent = fs.existsSync(opts.traceFile)
    ? fs.readFileSync(opts.traceFile, 'utf8')
    : `(trace file missing: ${opts.traceFile})`;

  const prompt = buildReflectionPrompt({
    task: opts.task, failure: opts.failure, traceContent, template,
  });

  const reflectionTrace = opts.traceFile.replace(/\.md$/, '_reflection.md');
  const run = await opts.runner.run({
    prompt,
    taskId: opts.task.id,
    attempt: opts.task.attempts,
    cwd: opts.projectDir,
    traceFile: reflectionTrace,
  });

  if (!run.ok) {
    log.warn(`Reflector session failed (non-fatal): ${run.output}`);
    return { outcome: 'runner_error' };
  }

  const parsed = parseReflection(run.output);
  if (!parsed) {
    log.warn(`Reflector output rejected (contract violation); staging untouched. Output head: ${String(run.output).slice(0, 120)}`);
    return { outcome: 'rejected' };
  }
  if (parsed.noLesson) {
    log.log(`Reflector: no generalizable lesson in ${opts.task.id} failure.`);
    return { outcome: 'no_lesson' };
  }

  const lesson = {
    category: parsed.category,
    lesson: parsed.lesson,
    provenance: {
      task: opts.task.id,
      fingerprint: opts.failure.fingerprint,
      date: new Date().toISOString().slice(0, 10),
      trace: opts.failure.trace_ref,
    },
  };
  await opts.sink(lesson);
  log.log(`Reflector distilled [${lesson.category}]: ${lesson.lesson}`);
  return { outcome: 'distilled', lesson };
}

module.exports = { reflect, parseReflection, buildReflectionPrompt };
