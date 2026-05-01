#!/usr/bin/env node

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

const args = process.argv.slice(2);
const command = args[0];

if (command !== 'add-skill') {
  console.log(`
${colors.cyan}ACE Framework CLI${colors.reset}

Usage:
  ace-framework add-skill <source>

Examples:
  ace-framework add-skill anthropics/skills/skills/document-skills
  ace-framework add-skill https://github.com/user/repo/tree/main/my-skill
  `);
  process.exit(1);
}

const source = args[1];
if (!source) {
  log.error('Please provide a source. Example: ace-framework add-skill anthropics/skills/skills/docx');
  process.exit(1);
}

// Ensure we are in an ACE-Framework project
const skillsDir = path.join(process.cwd(), '.ace', 'skills');
if (!fs.existsSync(skillsDir)) {
  log.error('Could not find .ace/skills/ directory. Are you in an ACE-Framework project?');
  process.exit(1);
}

// Extract skill name from source (last part of path)
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
  // Use degit to download the subfolder
  execSync(`npx degit ${source} "${targetPath}"`, { stdio: 'inherit' });
  log.success(`Successfully downloaded skill to .ace/skills/${skillName}`);
  
  // Register in .aceconfig
  const aceConfigPath = path.join(process.cwd(), '.aceconfig');
  if (fs.existsSync(aceConfigPath)) {
    let config = fs.readFileSync(aceConfigPath, 'utf8');
    
    if (config.includes('skill_triggers:')) {
      const triggerLine = `  ${skillName}: .ace/skills/${skillName}/SKILL.md\n`;
      // Insert after skill_triggers:
      config = config.replace(/skill_triggers:\n/, `skill_triggers:\n${triggerLine}`);
      fs.writeFileSync(aceConfigPath, config, 'utf8');
      log.success(`Registered '${skillName}' in .aceconfig skill_triggers`);
    }
  }

} catch (err) {
  log.error(`Failed to download skill: ${err.message}`);
  process.exit(1);
}
