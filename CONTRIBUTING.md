# Contributing to ACE-Framework

Thank you for your interest in contributing to ACE-Framework! This document provides guidelines for contributing.

---

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [How to Contribute](#how-to-contribute)
4. [Development Setup](#development-setup)
5. [Pull Request Process](#pull-request-process)
6. [Style Guidelines](#style-guidelines)

---

## Code of Conduct

### Our Pledge

We pledge to make participation in our project a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, gender identity and expression, level of experience, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Our Standards

**Positive behavior includes:**

- Using welcoming and inclusive language
- Being respectful of differing viewpoints
- Gracefully accepting constructive criticism
- Focusing on what is best for the community

**Unacceptable behavior includes:**

- Trolling, insulting comments, and personal attacks
- Public or private harassment
- Publishing others' private information
- Other conduct inappropriate in a professional setting

---

## Getting Started

### Prerequisites

- Git
- Text editor (VS Code, Cursor recommended)
- Basic understanding of Markdown
- Familiarity with AI-assisted development (helpful but not required)

### Fork and Clone

```bash
# Fork the repository on GitHub, then:
git clone https://github.com/YOUR_USERNAME/ace-framework.git
cd ace-framework
git remote add upstream https://github.com/jonnabio/ace-framework.git
```

---

## How to Contribute

### Reporting Bugs

1. Check if the bug is already reported in Issues
2. If not, create a new issue using the Bug Report template
3. Provide clear reproduction steps
4. Include your environment details

### Suggesting Features

1. Check existing issues and discussions
2. Create a Feature Request issue
3. Explain the use case and benefits
4. Be open to discussion and feedback

### Contributing Code

1. Find or create an issue for what you want to work on
2. Comment on the issue to claim it
3. Fork and create a branch
4. Make your changes
5. Submit a pull request

### Contributing Documentation

Documentation improvements are always welcome:

- Fix typos or unclear wording
- Add examples
- Improve explanations
- Translate to other languages

---

## Development Setup

### Directory Structure

```text
ace-framework/
├── .ace/                 # Framework core
├── docs/                 # Documentation
├── cli/                  # CLI tool source
├── scripts/              # Utility scripts
└── .github/              # GitHub configuration
```

### Testing Changes

Before submitting:

1. **Validate structure:**

   ```bash
   ./scripts/validate.sh
   ```

2. **Test in a new project:**

   ```bash
   ./scripts/init.sh ../test-project
   cd ../test-project
   # Verify everything works
   ```

3. **Check markdown:**

   ```bash
   npm ci                  # once, pins markdownlint-cli2 via package-lock.json
   npx markdownlint-cli2
   ```

---

## Pull Request Process

### Before Submitting

- [ ] Your code follows the style guidelines
- [ ] You have tested your changes
- [ ] Documentation is updated if needed
- [ ] You have added yourself to CONTRIBUTORS.md (optional)

### PR Guidelines

1. **Branch naming:**
   - `feature/short-description`
   - `fix/issue-number-description`
   - `docs/what-changed`

2. **Commit messages:**

   ```text
   type(scope): description

   - Detail 1
   - Detail 2
   ```

3. **PR description:**
   - Use the PR template
   - Link related issues
   - Describe what and why

### Review Process

1. Maintainers will review within 1-2 weeks
2. Address any requested changes
3. Once approved, a maintainer will merge
4. Your contribution will be in the next release

---

## Style Guidelines

### Markdown

- Use ATX-style headers (`#`, `##`, `###`)
- One sentence per line (for better diffs)
- Use fenced code blocks with language tags
- Use tables for structured data
- Include blank lines before/after code blocks

### YAML

- 2-space indentation
- Quote strings with special characters
- Use comments to explain non-obvious values

### File Naming

- Use kebab-case for file names
- Use descriptive names
- Follow existing patterns in each directory

### Documentation

- Be concise but complete
- Include examples where helpful
- Link to related documents
- Keep the user in mind

---

## Recognition

Contributors are recognized in:

- CONTRIBUTORS.md file
- Release notes
- GitHub contributors page

---

## Questions?

- Open a Discussion on GitHub
- Check existing issues and discussions
- Read the USER_GUIDE.md

---

Thank you for contributing to ACE-Framework! 🎉
