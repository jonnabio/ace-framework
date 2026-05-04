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
${colors.green}AI-assisted Code Engineering Framework v2.5.0${colors.reset}
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

// Install an Expansion Pack
function installExpansionPack(targetDir, packName) {
  if (packName.toLowerCase() === 'scientific') {
    log.info('Installing Scientific Expansion Pack...');
    try {
      execSync('npx skills add K-Dense-AI/scientific-agent-skills', { 
        cwd: targetDir, 
        stdio: 'inherit' 
      });
      log.success('Scientific Expansion Pack installed successfully.');
    } catch (error) {
      log.error(`Failed to install expansion pack: ${error.message}`);
    }
  } else if (packName.toLowerCase() === 'ai-research') {
    log.info('Installing AI Research Expansion Pack...');
    try {
      execSync('npx @orchestra-research/ai-research-skills', { 
        cwd: targetDir, 
        stdio: 'inherit' 
      });
      log.success('AI Research Expansion Pack installed successfully.');
    } catch (error) {
      log.error(`Failed to install expansion pack: ${error.message}`);
    }
  } else {
    log.warn(`Unknown expansion pack: ${packName}. Please install it manually.`);
  }
}

// Main function
async function main() {
  printBanner();

  // Parse arguments
  let targetDir = null;
  let packName = null;
  
  for (let i = 2; i < process.argv.length; i++) {
    const arg = process.argv[i];
    if (arg === '--pack' && i + 1 < process.argv.length) {
      packName = process.argv[++i];
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

  // Create .gitignore
  createGitignore(targetDir);

  // Install expansion pack if specified
  if (packName) {
    installExpansionPack(targetDir, packName);
  }

  // Print next steps
  printNextSteps(targetDir, projectName);
}

main().catch((error) => {
  log.error(`Error: ${error.message}`);
  process.exit(1);
});
