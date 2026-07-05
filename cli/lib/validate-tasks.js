/**
 * validate-tasks.js — structural validator for docs/progress/tasks.json
 *
 * Implements .ace/schemas/tasks.schema.json (the source of truth) plus the
 * cross-field loop invariants that JSON Schema cannot express:
 *   1. at most one task with status "in_progress"
 *   2. depends_on ids must reference existing tasks, no self- or cyclic deps
 *   3. attempts never exceeds the effective max_attempts
 *
 * Zero dependencies so it can run in any scaffolded project via:
 *   node cli/lib/validate-tasks.js docs/progress/tasks.json
 */

'use strict';

const fs = require('fs');

const STATUSES = ['pending', 'in_progress', 'verified', 'failed', 'blocked', 'skipped'];
const STARTED_STATUSES = ['in_progress', 'verified', 'failed'];
const TOP_LEVEL_KEYS = ['version', 'plan_ref', 'created', 'updated', 'defaults', 'tasks'];
const DEFAULTS_KEYS = ['max_attempts', 'runner', 'verify_cmd'];
const TASK_KEYS = [
  'id', 'name', 'objective', 'status', 'role', 'files', 'depends_on', 'complexity',
  'acceptance_cmd', 'attempts', 'max_attempts', 'result_file', 'failures',
  'blocked_reason', 'notes',
];
const FAILURE_KEYS = ['at', 'summary', 'fingerprint', 'trace_ref'];

const ID_RE = /^T[0-9]{3}$/;
const RESULT_FILE_RE = /^docs\/progress\/task_T[0-9]{3}_result\.md$/;
const PLAN_REF_RE = /^docs\/planning\/.+\.md$/;
const FINGERPRINT_RE = /^[a-f0-9]{12,64}$/;
const DATE_TIME_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/;

function isPlainObject(v) {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

function checkUnknownKeys(obj, allowed, label, errors) {
  for (const key of Object.keys(obj)) {
    if (!allowed.includes(key)) {
      errors.push(`${label}: unknown property "${key}"`);
    }
  }
}

function validateFailure(failure, label, errors) {
  if (!isPlainObject(failure)) {
    errors.push(`${label}: must be an object`);
    return;
  }
  checkUnknownKeys(failure, FAILURE_KEYS, label, errors);
  for (const key of ['at', 'summary', 'fingerprint']) {
    if (typeof failure[key] !== 'string' || failure[key] === '') {
      errors.push(`${label}: "${key}" is required and must be a non-empty string`);
    }
  }
  if (typeof failure.at === 'string' && !DATE_TIME_RE.test(failure.at)) {
    errors.push(`${label}: "at" must be an ISO 8601 date-time`);
  }
  if (typeof failure.fingerprint === 'string' && !FINGERPRINT_RE.test(failure.fingerprint)) {
    errors.push(`${label}: "fingerprint" must match ${FINGERPRINT_RE}`);
  }
}

function validateTask(task, index, defaults, errors) {
  const label = `tasks[${index}]`;
  if (!isPlainObject(task)) {
    errors.push(`${label}: must be an object`);
    return;
  }
  checkUnknownKeys(task, TASK_KEYS, label, errors);

  const id = typeof task.id === 'string' ? task.id : `#${index}`;
  if (typeof task.id !== 'string' || !ID_RE.test(task.id)) {
    errors.push(`${label}: "id" must match T[0-9]{3}`);
  }
  if (typeof task.name !== 'string' || task.name.length < 3) {
    errors.push(`${id}: "name" must be a string of at least 3 characters`);
  }
  if (typeof task.objective !== 'string' || task.objective.length < 20) {
    errors.push(`${id}: "objective" must be a string of at least 20 characters`);
  }
  if (!STATUSES.includes(task.status)) {
    errors.push(`${id}: "status" must be one of ${STATUSES.join(', ')}`);
  }
  if (!Number.isInteger(task.attempts) || task.attempts < 0) {
    errors.push(`${id}: "attempts" must be a non-negative integer`);
  }
  if (!Array.isArray(task.depends_on)) {
    errors.push(`${id}: "depends_on" is required and must be an array (use [] for none)`);
  } else {
    const seen = new Set();
    for (const dep of task.depends_on) {
      if (typeof dep !== 'string' || !ID_RE.test(dep)) {
        errors.push(`${id}: depends_on entry "${dep}" must match T[0-9]{3}`);
      }
      if (seen.has(dep)) {
        errors.push(`${id}: duplicate dependency "${dep}"`);
      }
      seen.add(dep);
    }
  }
  if ('max_attempts' in task
      && (!Number.isInteger(task.max_attempts) || task.max_attempts < 1 || task.max_attempts > 10)) {
    errors.push(`${id}: "max_attempts" must be an integer between 1 and 10`);
  }
  if ('complexity' in task && !['S', 'M', 'L'].includes(task.complexity)) {
    errors.push(`${id}: "complexity" must be S, M, or L`);
  }
  if ('failures' in task) {
    if (!Array.isArray(task.failures)) {
      errors.push(`${id}: "failures" must be an array`);
    } else {
      task.failures.forEach((f, i) => validateFailure(f, `${id}.failures[${i}]`, errors));
    }
  }

  // Conditional requirements (schema allOf)
  if (task.status === 'blocked'
      && (typeof task.blocked_reason !== 'string' || task.blocked_reason.length < 10)) {
    errors.push(`${id}: blocked tasks require a "blocked_reason" of at least 10 characters`);
  }
  if (task.status === 'verified') {
    if (typeof task.result_file !== 'string' || !RESULT_FILE_RE.test(task.result_file)) {
      errors.push(`${id}: verified tasks require "result_file" matching docs/progress/task_<id>_result.md`);
    } else if (ID_RE.test(String(task.id)) && !task.result_file.includes(`task_${task.id}_`)) {
      errors.push(`${id}: "result_file" must reference this task's own id`);
    }
  }
  if (STARTED_STATUSES.includes(task.status) && Number.isInteger(task.attempts) && task.attempts < 1) {
    errors.push(`${id}: status "${task.status}" requires attempts >= 1`);
  }

  // Loop invariant 3: attempt ceiling
  const effectiveMax = Number.isInteger(task.max_attempts)
    ? task.max_attempts
    : (isPlainObject(defaults) && Number.isInteger(defaults.max_attempts) ? defaults.max_attempts : 3);
  if (Number.isInteger(task.attempts) && task.attempts > effectiveMax) {
    errors.push(`${id}: attempts (${task.attempts}) exceeds effective max_attempts (${effectiveMax})`);
  }
}

function detectCycles(tasks, errors) {
  const deps = new Map();
  for (const task of tasks) {
    if (isPlainObject(task) && typeof task.id === 'string' && Array.isArray(task.depends_on)) {
      deps.set(task.id, task.depends_on);
    }
  }
  const state = new Map(); // 0 = visiting, 1 = done
  function visit(id, path) {
    if (state.get(id) === 1) return;
    if (state.get(id) === 0) {
      errors.push(`dependency cycle detected: ${[...path, id].join(' -> ')}`);
      return;
    }
    state.set(id, 0);
    for (const dep of deps.get(id) || []) {
      if (dep === id) {
        errors.push(`${id}: task depends on itself`);
      } else if (deps.has(dep)) {
        visit(dep, [...path, id]);
      }
    }
    state.set(id, 1);
  }
  for (const id of deps.keys()) visit(id, []);
}

/**
 * Validate a parsed tasks.json document.
 * @returns {string[]} errors — empty array means valid.
 */
function validateTasks(doc) {
  const errors = [];

  if (!isPlainObject(doc)) {
    return ['document root must be a JSON object'];
  }
  checkUnknownKeys(doc, TOP_LEVEL_KEYS, 'root', errors);

  if (doc.version !== '1.0') {
    errors.push('root: "version" must be the string "1.0"');
  }
  if (typeof doc.plan_ref !== 'string' || !PLAN_REF_RE.test(doc.plan_ref)) {
    errors.push('root: "plan_ref" must be a path under docs/planning/ ending in .md');
  }
  if (typeof doc.updated !== 'string' || !DATE_TIME_RE.test(doc.updated)) {
    errors.push('root: "updated" is required and must be an ISO 8601 date-time');
  }
  if ('created' in doc && (typeof doc.created !== 'string' || !DATE_TIME_RE.test(doc.created))) {
    errors.push('root: "created" must be an ISO 8601 date-time');
  }

  if (!isPlainObject(doc.defaults)) {
    errors.push('root: "defaults" is required and must be an object');
  } else {
    checkUnknownKeys(doc.defaults, DEFAULTS_KEYS, 'defaults', errors);
    if (!Number.isInteger(doc.defaults.max_attempts)
        || doc.defaults.max_attempts < 1 || doc.defaults.max_attempts > 10) {
      errors.push('defaults: "max_attempts" must be an integer between 1 and 10');
    }
    if (typeof doc.defaults.runner !== 'string' || doc.defaults.runner === '') {
      errors.push('defaults: "runner" is required and must be a non-empty string');
    }
  }

  if (!Array.isArray(doc.tasks) || doc.tasks.length < 1) {
    errors.push('root: "tasks" must be a non-empty array');
    return errors;
  }

  doc.tasks.forEach((task, i) => validateTask(task, i, doc.defaults, errors));

  // Loop invariant: unique ids
  const ids = doc.tasks.filter((t) => isPlainObject(t)).map((t) => t.id).filter((x) => typeof x === 'string');
  const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
  for (const dupe of [...new Set(dupes)]) {
    errors.push(`duplicate task id "${dupe}"`);
  }

  // Loop invariant 1: at most one in_progress
  const inProgress = doc.tasks.filter((t) => isPlainObject(t) && t.status === 'in_progress');
  if (inProgress.length > 1) {
    errors.push(`at most one task may be in_progress; found ${inProgress.length}: ${inProgress.map((t) => t.id).join(', ')}`);
  }

  // Loop invariant 2: dependencies exist, no self-deps or cycles
  const idSet = new Set(ids);
  for (const task of doc.tasks) {
    if (!isPlainObject(task) || !Array.isArray(task.depends_on)) continue;
    for (const dep of task.depends_on) {
      if (typeof dep === 'string' && ID_RE.test(dep) && !idSet.has(dep)) {
        errors.push(`${task.id}: depends_on references unknown task "${dep}"`);
      }
    }
  }
  detectCycles(doc.tasks, errors);

  return errors;
}

/**
 * Validate a tasks.json file on disk.
 * @returns {string[]} errors — empty array means valid.
 */
function validateTasksFile(filePath) {
  let raw;
  try {
    raw = fs.readFileSync(filePath, 'utf8');
  } catch (err) {
    return [`cannot read ${filePath}: ${err.message}`];
  }
  let doc;
  try {
    doc = JSON.parse(raw);
  } catch (err) {
    return [`${filePath} is not valid JSON: ${err.message}`];
  }
  return validateTasks(doc);
}

module.exports = { validateTasks, validateTasksFile };

if (require.main === module) {
  const target = process.argv[2];
  if (!target) {
    console.error('Usage: node validate-tasks.js <path/to/tasks.json>');
    process.exit(2);
  }
  const errors = validateTasksFile(target);
  if (errors.length === 0) {
    console.log(`OK: ${target} is a valid ACE task queue`);
    process.exit(0);
  }
  console.error(`INVALID: ${target} has ${errors.length} error(s):`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
