#!/usr/bin/env node

/**
 * ace-framework — in-project CLI for ACE-Framework projects.
 *
 * Commands:
 *   add-skill <source>   import an open-source skill into .ace/skills/
 *   loop [options]       run the ACE loop over docs/progress/tasks.json
 */

'use strict';

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}!${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
};

function printUsage() {
  console.log(`
${colors.cyan}ACE Framework CLI${colors.reset}

Usage:
  ace-framework add-skill <source>
  ace-framework loop [--dry-run] [--max-iterations N] [--runner NAME] [--no-reflect]
  ace-framework curate <list | promote <RULE-id> --to <standard.md> | expire [--days N]>

Commands:
  add-skill   Import an open-source skill into .ace/skills/ and register it.
  loop        Drive the ACE loop: pick eligible tasks from
              docs/progress/tasks.json, spawn a fresh agent session per
              attempt, gate on verify, retry or block per loop guards.
  curate      Manage distilled rules (ADR-003): list staged rules with
              eligibility, promote into a standard (append-only), expire
              stale rules to the archive.

Loop options:
  --dry-run             Report queue state and next action; change nothing.
  --report              Print the telemetry report and exit.
  --max-iterations N    Stop after N attempts this run.
  --runner NAME         Override defaults.runner from tasks.json.
  --no-reflect          Skip the Reflector step on failures.

Curate options:
  promote --auto        Promote ALL eligible rules except reserved
                        categories (Security/Data-Loss/Compliance).
  expire --days N       Expiry window (default 30).

Examples:
  ace-framework add-skill anthropics/skills/skills/document-skills
  ace-framework loop --dry-run
  ace-framework curate list
  ace-framework curate promote RULE-9f3ac1d20b47 --to .ace/standards/coding.md
  `);
}

// --- add-skill (unchanged behavior) ---

function cmdAddSkill(args) {
  const source = args[0];
  if (!source) {
    log.error('Please provide a source. Example: ace-framework add-skill anthropics/skills/skills/docx');
    process.exit(1);
  }

  const skillsDir = path.join(process.cwd(), '.ace', 'skills');
  if (!fs.existsSync(skillsDir)) {
    log.error('Could not find .ace/skills/ directory. Are you in an ACE-Framework project?');
    process.exit(1);
  }

  let skillName = source.split('/').pop().replace('.git', '');
  if (source.includes('github.com')) {
    const parts = source.split('/');
    skillName = parts[parts.length - 1];
  }

  const targetPath = path.join(skillsDir, skillName);
  if (fs.existsSync(targetPath)) {
    log.error(`Skill '${skillName}' already exists at ${targetPath}`);
    process.exit(1);
  }

  log.info(`Downloading skill '${skillName}' from ${source}...`);
  try {
    execSync(`npx degit ${source} "${targetPath}"`, { stdio: 'inherit' });
    log.success(`Successfully downloaded skill to .ace/skills/${skillName}`);

    const aceConfigPath = path.join(process.cwd(), '.aceconfig');
    if (fs.existsSync(aceConfigPath)) {
      let config = fs.readFileSync(aceConfigPath, 'utf8');
      if (config.includes('skill_triggers:')) {
        const triggerLine = `  ${skillName}: .ace/skills/${skillName}/SKILL.md\n`;
        config = config.replace(/skill_triggers:\n/, `skill_triggers:\n${triggerLine}`);
        fs.writeFileSync(aceConfigPath, config, 'utf8');
        log.success(`Registered '${skillName}' in .aceconfig skill_triggers`);
      }
    }
  } catch (err) {
    log.error(`Failed to download skill: ${err.message}`);
    process.exit(1);
  }
}

// --- loop ---

function parseLoopArgs(args) {
  const opts = { dryRun: false, maxIterations: undefined, runnerName: undefined, reflect: true, report: false };
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--dry-run') opts.dryRun = true;
    else if (arg === '--report') opts.report = true;
    else if (arg === '--no-reflect') opts.reflect = false;
    else if (arg === '--max-iterations') {
      opts.maxIterations = Number.parseInt(args[++i], 10);
      if (!Number.isInteger(opts.maxIterations) || opts.maxIterations < 1) {
        throw new Error('--max-iterations requires a positive integer');
      }
    } else if (arg === '--runner') {
      opts.runnerName = args[++i];
      if (!opts.runnerName) throw new Error('--runner requires a name');
    } else {
      throw new Error(`Unknown loop option: ${arg}`);
    }
  }
  return opts;
}

async function cmdLoop(args) {
  const { runLoop } = require('../lib/loop');
  const { getRunner } = require('../lib/runners');

  let opts;
  try {
    opts = parseLoopArgs(args);
  } catch (err) {
    log.error(err.message);
    process.exit(2);
  }

  const projectDir = process.cwd();
  const telemetry = require('../lib/telemetry');
  const metricsPath = path.join(projectDir, telemetry.DEFAULT_LOG_REL);

  if (opts.report) {
    console.log(telemetry.formatReport(telemetry.computeReport(telemetry.readEvents(metricsPath))));
    process.exit(0);
  }

  const queuePath = path.join(projectDir, 'docs', 'progress', 'tasks.json');
  if (!fs.existsSync(queuePath)) {
    log.error('No task queue found at docs/progress/tasks.json.');
    log.info('The Architect creates it from the approved implementation plan;');
    log.info('see .ace/schemas/tasks.schema.json and docs/progress/tasks.example.json.');
    process.exit(2);
  }

  let runnerName = opts.runnerName;
  if (!runnerName) {
    try {
      runnerName = JSON.parse(fs.readFileSync(queuePath, 'utf8')).defaults.runner;
    } catch (err) {
      log.error(`Cannot read defaults.runner from tasks.json: ${err.message}`);
      process.exit(2);
    }
  }

  let runner;
  try {
    runner = getRunner(runnerName);
  } catch (err) {
    log.error(err.message);
    process.exit(2);
  }

  // Reflector -> Curator wiring (T007/T008): on every failed attempt, a fresh
  // Reflector session distills a lesson into the Curator staging file.
  let reflectFn;
  if (opts.reflect && !opts.dryRun) {
    const { reflect } = require('../lib/reflector');
    const curator = require('../lib/curator');
    const stagingPath = path.join(projectDir, '.ace', 'standards', 'distilled-staging.md');
    reflectFn = ({ task, failure, traceFile }) => reflect({
      task,
      failure,
      traceFile,
      projectDir,
      runner,
      sink: async (lesson) => {
        const { id, action } = curator.addLesson(stagingPath, lesson);
        log.info(`Curator: ${action} ${id} [${lesson.category}] (see .ace/standards/distilled-staging.md)`);
      },
      log: console,
    });
  }

  const result = await runLoop({
    projectDir,
    queuePath,
    runner,
    dryRun: opts.dryRun,
    maxIterations: opts.maxIterations,
    reflect: reflectFn,
    onEvent: telemetry.createEmitter(metricsPath, log),
    log: console,
  });
  process.exit(result.exitCode);
}

// --- curate ---

async function cmdCurate(args) {
  const curator = require('../lib/curator');
  const readline = require('readline');
  const projectDir = process.cwd();
  const stagingPath = path.join(projectDir, '.ace', 'standards', 'distilled-staging.md');
  const archivePath = path.join(projectDir, '.ace', 'standards', 'distilled-archive.md');
  const sub = args[0];

  if (sub === 'list' || sub === undefined) {
    const rules = fs.existsSync(stagingPath) ? curator.listRules(stagingPath) : [];
    if (rules.length === 0) {
      log.info('No staged rules. The Reflector adds them when loop attempts fail.');
      return;
    }
    for (const r of rules) {
      const marks = [
        r.status,
        r.eligible ? `${colors.green}eligible${colors.reset}` : `hits ${r.hit_count}/${curator.PROMOTION_THRESHOLD}`,
        r.reserved ? `${colors.yellow}reserved${colors.reset}` : null,
      ].filter(Boolean).join(', ');
      console.log(`${colors.cyan}${r.id}${colors.reset} [${r.category}] (${marks})`);
      console.log(`  ${r.lesson}`);
    }
    return;
  }

  if (sub === 'promote') {
    const auto = args.includes('--auto');
    const yes = args.includes('--yes');
    const toIdx = args.indexOf('--to');
    const target = toIdx !== -1 ? args[toIdx + 1] : null;
    const id = args.slice(1).find((a) => a.startsWith('RULE-'));

    const confirm = (question) => new Promise((resolve) => {
      if (yes) return resolve(true);
      const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
      rl.question(`${question} (y/N): `, (answer) => {
        rl.close();
        resolve(answer.trim().toLowerCase() === 'y');
      });
    });

    if (auto) {
      const eligible = curator.listRules(stagingPath).filter((r) => r.eligible && !r.reserved);
      if (eligible.length === 0) { log.info('No eligible, non-reserved rules to auto-promote.'); return; }
      if (!target) { log.error('--auto requires --to <standard.md>'); process.exit(2); }
      for (const rule of eligible) {
        curator.promote(stagingPath, rule.id, path.resolve(projectDir, target), { auto: true });
        log.success(`Promoted ${rule.id} [${rule.category}] -> ${target}`);
      }
      return;
    }

    if (!id || !target) {
      log.error('Usage: ace-framework curate promote <RULE-id> --to <standard.md> [--yes]');
      process.exit(2);
    }
    const rule = curator.listRules(stagingPath).find((r) => r.id === id);
    if (!rule) { log.error(`No staged rule ${id}`); process.exit(1); }
    console.log(`\n${rule.id} [${rule.category}] hit_count ${rule.hit_count}`);
    console.log(`  ${rule.lesson}\n`);
    if (!(await confirm(`Append this rule to ${target}?`))) { log.warn('Aborted.'); return; }
    curator.promote(stagingPath, id, path.resolve(projectDir, target), {});
    log.success(`Promoted ${id} -> ${target}`);
    return;
  }

  if (sub === 'expire') {
    const daysIdx = args.indexOf('--days');
    const days = daysIdx !== -1 ? Number.parseInt(args[daysIdx + 1], 10) : undefined;
    const expired = curator.expire(stagingPath, archivePath, { days });
    if (expired.length === 0) log.info('Nothing to expire.');
    else log.success(`Expired to archive: ${expired.join(', ')}`);
    return;
  }

  log.error(`Unknown curate subcommand: ${sub}`);
  process.exit(2);
}

// --- dispatch ---

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (command === 'add-skill') {
    cmdAddSkill(args.slice(1));
  } else if (command === 'loop') {
    await cmdLoop(args.slice(1));
  } else if (command === 'curate') {
    await cmdCurate(args.slice(1));
  } else {
    printUsage();
    process.exit(command ? 1 : 0);
  }
}

main().catch((err) => {
  log.error(`Error: ${err.message}`);
  process.exit(1);
});
