#!/usr/bin/env node

/**
 * create-ace-framework CLI
 *
 * Usage:
 *   npx create-ace-framework my-project
 *   npx create-ace-framework .  (current directory)
 *   npx create-ace-framework    (interactive)
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Colors
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

// Banner
function printBanner() {
  console.log(`
${colors.cyan}    _    ____ _____   _____                                            _
   / \\  / ___| ____| |  ___| __ __ _ _ __ ___   _____      _____  _ __| | __
  / _ \\| |   |  _|   | |_ | '__/ _\` | '_ \` _ \\ / _ \\ \\ /\\ / / _ \\| '__| |/ /
 / ___ \\ |___| |___  |  _|| | | (_| | | | | | |  __/\\ V  V / (_) | |  |   <
/_/   \\_\\____|_____| |_|  |_|  \\__,_|_| |_| |_|\\___| \\_/\\_/ \\___/|_|  |_|\\_\\
${colors.reset}
${colors.green}AI-assisted Code Engineering Framework v2.7.0${colors.reset}
`);
}

// Prompt for input
function prompt(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

// Get template directory (bundled with package or download)
function getTemplateDir() {
  const localTemplate = path.join(__dirname, '..', 'templates');
  if (fs.existsSync(localTemplate)) {
    return localTemplate;
  }
  return null;
}

// Copy directory recursively
function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Clone from GitHub
function cloneFromGitHub(targetDir) {
  const repoUrl = 'https://github.com/jonnabio/ace-framework.git';
  const tempDir = path.join(targetDir, '.ace-temp');

  try {
    log.info('Downloading ACE-Framework from GitHub...');
    execSync(`git clone --depth 1 ${repoUrl} "${tempDir}"`, { stdio: 'pipe' });

    // Copy relevant directories
    const dirsToCopy = ['.ace', 'docs'];
    const filesToCopy = [
      '.aceconfig',
      '.aiconfig',
      '.cursorrules',
      '.editorconfig',
      'ACE-SPEC.md',
      'USER_GUIDE.md',
    ];

    for (const dir of dirsToCopy) {
      const src = path.join(tempDir, dir);
      const dest = path.join(targetDir, dir);
      if (fs.existsSync(src)) {
        copyDir(src, dest);
      }
    }

    for (const file of filesToCopy) {
      const src = path.join(tempDir, file);
      const dest = path.join(targetDir, file);
      if (fs.existsSync(src)) {
        fs.copyFileSync(src, dest);
      }
    }

    // Copy IDE configs
    const vscodeSrc = path.join(tempDir, '.vscode');
    const cursorSrc = path.join(tempDir, '.cursor');
    if (fs.existsSync(vscodeSrc)) {
      copyDir(vscodeSrc, path.join(targetDir, '.vscode'));
    }
    if (fs.existsSync(cursorSrc)) {
      copyDir(cursorSrc, path.join(targetDir, '.cursor'));
    }

    // Cleanup
    fs.rmSync(tempDir, { recursive: true, force: true });

    return true;
  } catch (error) {
    log.error(`Failed to download: ${error.message}`);
    return false;
  }
}

// Update project configuration
function customizeProject(targetDir, projectName) {
  // Update .aceconfig
  const aceconfigPath = path.join(targetDir, '.aceconfig');
  if (fs.existsSync(aceconfigPath)) {
    let content = fs.readFileSync(aceconfigPath, 'utf8');
    content = content.replace(
      /project_name: .*/,
      `project_name: "${projectName}"`
    );
    fs.writeFileSync(aceconfigPath, content);
    log.success('Updated .aceconfig');
  }

  // Reset ACTIVE_CONTEXT.md
  const contextPath = path.join(targetDir, 'docs', 'context', 'ACTIVE_CONTEXT.md');
  if (fs.existsSync(contextPath)) {
    const today = new Date().toISOString().split('T')[0];
    const content = `# Active Context: Project Setup

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
1. [ ] Customize .ace/standards/ for your tech stack
2. [ ] Create ADR-001 for tech stack decisions
3. [ ] Set up first feature specification

## Active Constraints
- .ace/standards/coding.md
- .ace/standards/security.md

## Session Notes
- Framework initialized via create-ace-framework CLI
`;
    fs.writeFileSync(contextPath, content);
    log.success('Reset ACTIVE_CONTEXT.md');
  }
}

// Ensure docs/progress/ exists with its README (v2.7 Loop Engineering).
// The clone path copies it with docs/, but bundled templates may predate it.
function ensureProgressDir(targetDir) {
  const progressDir = path.join(targetDir, 'docs', 'progress');
  fs.mkdirSync(progressDir, { recursive: true });

  const readmePath = path.join(progressDir, 'README.md');
  if (!fs.existsSync(readmePath)) {
    fs.writeFileSync(readmePath, `# docs/progress/ — File-Based Task State

Working memory of the ACE loop. The task queue lives in \`tasks.json\`
(schema: \`.ace/schemas/tasks.schema.json\`); Generators write
\`task_<ID>_result.md\` progress logs here so state survives context flushes.

Validate the queue with:

    node cli/lib/validate-tasks.js docs/progress/tasks.json
`);
    log.success('Created docs/progress/');
  }
}

// Install an enforced-hooks adapter (v2.7): copies the adapter's settings
// template into the tool's config location so hooks are enforced by the
// harness instead of simulated by the model.
function installAdapter(targetDir, adapterName) {
  if (!adapterName) return;
  const normalized = adapterName.toLowerCase();
  const templatePath = path.join(targetDir, '.ace', 'adapters', normalized, 'settings-template.json');
  if (!fs.existsSync(templatePath)) {
    log.warn(`Unknown adapter "${adapterName}" (no ${templatePath}). Skipping.`);
    return;
  }
  if (normalized === 'claude-code') {
    const claudeDir = path.join(targetDir, '.claude');
    const settingsPath = path.join(claudeDir, 'settings.json');
    if (fs.existsSync(settingsPath)) {
      log.warn('.claude/settings.json already exists; not overwriting.');
      log.info(`Merge the hooks from ${templatePath} manually.`);
      return;
    }
    fs.mkdirSync(claudeDir, { recursive: true });
    fs.copyFileSync(templatePath, settingsPath);
    log.success('Installed claude-code enforced hooks adapter (.claude/settings.json)');
  } else {
    log.warn(`Adapter "${adapterName}" ships a template but no install rule; see ${templatePath}.`);
  }
}

// Create .gitignore if not exists
function createGitignore(targetDir) {
  const gitignorePath = path.join(targetDir, '.gitignore');
  if (!fs.existsSync(gitignorePath)) {
    const content = `# Dependencies
node_modules/
vendor/
.venv/
venv/

# Build outputs
dist/
build/
*.egg-info/

# IDE
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Logs
*.log
logs/

# Environment
.env
.env.local
.env.*.local

# Secrets (never commit!)
*.pem
*.key
credentials.json
secrets.yaml
`;
    fs.writeFileSync(gitignorePath, content);
    log.success('Created .gitignore');
  }
}

// Print next steps
function printNextSteps(targetDir, projectName) {
  console.log(`
${colors.green}========================================${colors.reset}
${colors.green}ACE-Framework initialized successfully!${colors.reset}
${colors.green}========================================${colors.reset}

Project: ${colors.cyan}${projectName}${colors.reset}
Location: ${colors.cyan}${path.resolve(targetDir)}${colors.reset}

Next steps:

  ${colors.yellow}1.${colors.reset} Navigate to your project:
     ${colors.cyan}cd ${targetDir}${colors.reset}

  ${colors.yellow}2.${colors.reset} Read the guides:
     - ${colors.cyan}USER_GUIDE.md${colors.reset}  (practical usage)
     - ${colors.cyan}ACE-SPEC.md${colors.reset}    (full specification)

  ${colors.yellow}3.${colors.reset} Customize for your stack:
     - Edit ${colors.cyan}.ace/standards/coding.md${colors.reset}
     - Edit ${colors.cyan}.ace/standards/security.md${colors.reset}

  ${colors.yellow}4.${colors.reset} Start your first session:
     Tell your AI assistant:
     ${colors.cyan}"Read .aceconfig and ACTIVE_CONTEXT.md to begin."${colors.reset}

  ${colors.yellow}5.${colors.reset} Create your first ADR:
     Copy ${colors.cyan}docs/adr/ADR-000-template.md${colors.reset} to ${colors.cyan}ADR-001-tech-stack.md${colors.reset}

${colors.blue}Happy coding with ACE-Framework!${colors.reset}
`);
}

// Keep only the requested expansion pack (if any) out of the packs bundled/cloned into targetDir
function pruneExpansionPacks(targetDir, packName) {
  const packsDir = path.join(targetDir, '.ace', 'packs');
  if (!fs.existsSync(packsDir)) {
    return null;
  }

  const available = fs
    .readdirSync(packsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);

  let installed = null;
  if (packName) {
    const normalized = packName.toLowerCase();
    if (available.includes(normalized)) {
      installed = normalized;
    } else {
      log.warn(`Unknown expansion pack "${packName}". Available packs: ${available.join(', ')}`);
    }
  }

  for (const pack of available) {
    if (pack !== installed) {
      fs.rmSync(path.join(packsDir, pack), { recursive: true, force: true });
    }
  }

  if (!installed) {
    fs.rmSync(packsDir, { recursive: true, force: true });
  }

  return installed;
}

// Reconcile .aceconfig's `includes:` list with the expansion pack actually installed
function updateAceConfigIncludes(targetDir, packName) {
  const aceconfigPath = path.join(targetDir, '.aceconfig');
  if (!fs.existsSync(aceconfigPath)) {
    return;
  }

  let content = fs.readFileSync(aceconfigPath, 'utf8');
  const usesCrlf = content.includes('\r\n');
  const includesBlock = /includes:\r?\n(?:[ \t]*-[ \t]+.*\r?\n)*/;

  if (!includesBlock.test(content)) {
    return;
  }

  let replacement = packName
    ? `includes:\n  - .ace/packs/${packName}/.aceconfig-ext\n`
    : 'includes: []\n';
  if (usesCrlf) {
    replacement = replacement.replace(/\n/g, '\r\n');
  }

  content = content.replace(includesBlock, replacement);

  fs.writeFileSync(aceconfigPath, content);
}

// Main function
async function main() {
  printBanner();

  // Parse arguments
  let targetDir = null;
  let packName = null;
  let adapterName = null;

  for (let i = 2; i < process.argv.length; i++) {
    const arg = process.argv[i];
    if (arg === '--pack' && i + 1 < process.argv.length) {
      packName = process.argv[++i];
    } else if (arg === '--adapter' && i + 1 < process.argv.length) {
      adapterName = process.argv[++i];
    } else if (!arg.startsWith('-') && !targetDir) {
      targetDir = arg;
    }
  }

  if (!targetDir) {
    targetDir = await prompt('Enter project directory (default: ./ace-project): ');
    targetDir = targetDir.trim() || './ace-project';
  }

  // Get project name
  let projectName = path.basename(path.resolve(targetDir));
  if (targetDir === '.') {
    projectName = path.basename(process.cwd());
  }

  const customName = await prompt(`Project name (default: ${projectName}): `);
  if (customName.trim()) {
    projectName = customName.trim();
  }

  // Create target directory
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
    log.success(`Created directory: ${targetDir}`);
  } else if (targetDir !== '.' && fs.readdirSync(targetDir).length > 0) {
    const confirm = await prompt('Directory is not empty. Continue? (y/N): ');
    if (confirm.toLowerCase() !== 'y') {
      log.error('Aborted.');
      process.exit(1);
    }
  }

  // Check for bundled templates or download
  const templateDir = getTemplateDir();
  if (templateDir) {
    log.info('Using bundled templates...');
    copyDir(templateDir, targetDir);
    log.success('Framework files copied');
  } else {
    // Download from GitHub
    if (!cloneFromGitHub(targetDir)) {
      process.exit(1);
    }
    log.success('Framework files downloaded');
  }

  // Customize project
  customizeProject(targetDir, projectName);

  // Ensure the task-state directory exists (v2.7)
  ensureProgressDir(targetDir);

  // Install enforced-hooks adapter if requested (v2.7)
  installAdapter(targetDir, adapterName);

  // Create .gitignore
  createGitignore(targetDir);

  // Keep only the requested expansion pack and reconcile .aceconfig
  const installedPack = pruneExpansionPacks(targetDir, packName);
  updateAceConfigIncludes(targetDir, installedPack);
  if (installedPack) {
    log.success(`Installed "${installedPack}" expansion pack`);
  }

  // Print next steps
  printNextSteps(targetDir, projectName);
}

main().catch((error) => {
  log.error(`Error: ${error.message}`);
  process.exit(1);
});
