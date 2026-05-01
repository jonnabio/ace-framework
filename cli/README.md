# create-ace-framework

CLI tool to scaffold projects with ACE-Framework (AI-assisted Code Engineering).

## Usage

### Quick Start

```bash
# Create a new project
npx create-ace-framework my-project

# Add to current directory
npx create-ace-framework .

# Interactive mode
npx create-ace-framework
```

### Adding Third-Party Skills

Once a project is scaffolded, you can use the companion `ace-framework` CLI to import community AgentSkills into your local `.ace/skills/` directory:

```bash
# Import the PDF parsing skill from Anthropic
npx ace-framework add-skill anthropics/skills/skills/pdf
```

### Global Installation

```bash
npm install -g create-ace-framework

# Then use directly
create-ace-framework my-project
```

## What It Does

1. Creates the ACE-Framework directory structure
2. Copies all templates, standards, and skills
3. Sets up IDE configurations (VS Code, Cursor)
4. Initializes ACTIVE_CONTEXT.md for your project
5. Creates a basic .gitignore

## After Installation

1. **Read the guides:**
   - `USER_GUIDE.md` - Practical day-to-day usage
   - `ACE-SPEC.md` - Full technical specification

2. **Customize for your stack:**
   - Edit `.ace/standards/coding.md`
   - Edit `.ace/standards/security.md`

3. **Start your first AI session:**
   ```
   "Read .aceconfig and ACTIVE_CONTEXT.md to begin."
   ```

## Requirements

- Node.js 16+
- Git (for downloading templates)

## Links

- [GitHub Repository](https://github.com/jonnabio/ace-framework)
- [Documentation](https://github.com/jonnabio/ace-framework#readme)
- [Report Issues](https://github.com/jonnabio/ace-framework/issues)

## License

MIT
