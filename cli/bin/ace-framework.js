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

Commands:
  add-skill   Import an open-source skill into .ace/skills/ and register it.
  loop        Drive the ACE loop: pick eligible tasks from
              docs/progress/tasks.json, spawn a fresh agent session per
              attempt, gate on verify, retry or block per loop guards.

Loop options:
  --dry-run             Report queue state and next action; change nothing.
  --max-iterations N    Stop after N attempts this run.
  --runner NAME         Override defaults.runner from tasks.json.
  --no-reflect          Skip the Reflector step on failures.

Examples:
  ace-framework add-skill anthropics/skills/skills/document-skills
  ace-framework loop --dry-run
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
  const opts = { dryRun: false, maxIterations: undefined, runnerName: undefined, reflect: true };
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--dry-run') opts.dryRun = true;
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

  const result = await runLoop({
    projectDir,
    queuePath,
    runner,
    dryRun: opts.dryRun,
    maxIterations: opts.maxIterations,
    reflect: undefined, // wired by the Reflector integration when enabled
    log: console,
  });
  process.exit(result.exitCode);
}

// --- dispatch ---

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (command === 'add-skill') {
    cmdAddSkill(args.slice(1));
  } else if (command === 'loop') {
    await cmdLoop(args.slice(1));
  } else {
    printUsage();
    process.exit(command ? 1 : 0);
  }
}

main().catch((err) => {
  log.error(`Error: ${err.message}`);
  process.exit(1);
});
