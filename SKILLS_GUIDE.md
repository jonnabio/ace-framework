# ACE Framework Skills Guide

> **A comprehensive guide to understanding, using, and creating skills in the ACE Framework.**

---

## Table of Contents

1. [What are Skills?](#1-what-are-skills)
2. [The Skill Catalog](#2-the-skill-catalog)
3. [How to Invoke Skills](#3-how-to-invoke-skills)
4. [Using Third-Party Skills (AgentSkills.io)](#4-using-third-party-skills)
5. [Creating Custom Skills](#5-creating-custom-skills)

---

## 1. What are Skills?

In the ACE Framework, **Skills** are formalized procedural knowledge documents. If a **Role** (like Architect or Developer) is the *who*, a **Skill** is the *how*. 

Instead of asking an AI to "write a database migration" and hoping it remembers all the edge cases, you ask it to "apply the database-operations skill." 

A skill forces the AI to follow a rigorous, step-by-step checklist, preventing hallucinations, ensuring edge cases are covered, and maintaining consistency across your engineering team.

### Anatomy of a Skill

ACE Framework skills are stored in `.ace/skills/` and follow the [AgentSkills.io](https://github.com/anthropics/skills) folder standard. A typical skill directory looks like this:

```text
.ace/skills/api-design/
└── SKILL.md
```

Inside the `SKILL.md`, you will find:
- **YAML Frontmatter**: Metadata like the name and description.
- **Purpose**: Why the skill exists.
- **Prerequisites**: What must be done *before* starting.
- **Procedures**: The exact step-by-step checklist the AI must follow.
- **Common Pitfalls**: Known anti-patterns the AI should actively avoid.

---

## 2. The Skill Catalog

The framework comes with 19 core skills covering the entire Software Development Life Cycle.

### Core Engineering
| Skill | Trigger Keywords | Description |
|-------|------------------|-------------|
| `api-design` | api, endpoint, REST | Designing robust, RESTful API endpoints. |
| `database-operations` | database, schema, migration | Modifying schemas, writing complex queries safely. |
| `migration-logic` | migration | Orchestrating zero-downtime data migrations. |
| `state-management` | state, redux, context | Managing complex UI or backend state securely. |

### AI & Data Engineering
| Skill | Trigger Keywords | Description |
|-------|------------------|-------------|
| `data-pipeline-design` | pipeline, etl, data | Designing idempotent ETL/ELT pipelines. |
| `prompt-engineering` | prompt, llm, ai | Structuring zero-shot and few-shot LLM prompts. |
| `model-evaluation` | model, evaluation, ml | Designing metrics and golden datasets for ML. |
| `feature-engineering` | feature, engineering | Handling nulls, outliers, and data encoding. |
| `agent-design` | agent, autonomous, tools | Designing autonomous AI agents and execution loops. |
| `a2a-communication` | a2a, multi-agent | Orchestrating multi-agent systems and handoffs. |
| `mcp-implementation` | mcp, protocol, server | Implementing Model Context Protocol servers. |

### Code Quality & Review
| Skill | Trigger Keywords | Description |
|-------|------------------|-------------|
| `code-review` | review | Conducting deep, multi-layered code reviews. |
| `testing-strategy` | test, coverage | Writing unit, integration, and E2E tests. |
| `refactoring` | refactor, clean up | Safely restructuring code without changing behavior. |
| `performance-optimization` | performance, optimize, speed | Identifying bottlenecks and improving Big-O efficiency. |
| `error-handling` | error, exception, logging | Standardizing boundaries and graceful degradation. |

### Security & Compliance
| Skill | Trigger Keywords | Description |
|-------|------------------|-------------|
| `security-audit` | security, vulnerability, audit | Identifying OWASP top 10 vulnerabilities. |
| `accessibility-audit`| accessibility, wcag, a11y | Ensuring strict WCAG UI compliance. |

### Analysis & Operations
| Skill | Trigger Keywords | Description |
|-------|------------------|-------------|
| `transcript-analysis` | transcript, meeting, interview | Extracting requirements from raw meeting notes. |
| `root-cause-analysis` | bug, issue, incident | Running a 5-Whys analysis on production bugs. |
| `ci-cd-pipeline` | ci, cd, pipeline, deploy | Building GitHub Actions and deployment flows. |
| `documentation-generation`| documentation, docs, readme | Generating JSDoc, OpenAPI specs, and diagrams. |

---

## 3. How to Invoke Skills

There are two primary ways to invoke a skill: **Explicit Invocation** and **Automatic Triggers**.

### Explicit Invocation (Recommended)

To guarantee the AI uses the skill, explicitly point to the `SKILL.md` path in your prompt. This works perfectly in tools like Cursor, GitHub Copilot, and Claude.

**Prompt Example:**
```markdown
"Apply the performance-optimization skill from .ace/skills/performance-optimization/SKILL.md to analyze why this database query is slow."
```

### Automatic Triggers

The framework includes an `.aceconfig` and `.aiconfig` file. Advanced AI environments (like Claude Code or advanced Cursor rules) can read these files to automatically load a skill when you type a specific keyword.

For example, if you type:
```markdown
"Please help me fix this critical bug."
```
The AI sees the word `bug`, checks `.aceconfig`, and invisibly loads `.ace/skills/root-cause-analysis/SKILL.md` before responding.

---

## 4. Using Third-Party Skills

Because ACE adopted the **AgentSkills.io standard**, you can seamlessly import community-created skills. 

### Importing via ACE CLI

If you want to pull a skill from a GitHub repository into your project permanently:

```bash
npx ace-framework add-skill anthropics/skills/skills/pdf
```

This will:
1. Download the skill to `.ace/skills/pdf`.
2. Automatically register it in your `.aceconfig` so the AI knows it exists.

### Using Native Claude Code Plugins

If you use Claude Code via terminal, you don't even need to download them locally. You can use native plugins:

```bash
/plugin marketplace add anthropics/skills
/plugin install document-skills@anthropic-agent-skills
```
*Now you can simply say: "Use the PDF skill to read docs/inputs/spec.pdf".*

---

## 5. Creating Custom Skills

Every engineering team has unique procedures. You should absolutely create your own custom skills.

### Step 1: Create the Directory
```bash
mkdir .ace/skills/our-auth-flow
```

### Step 2: Create the SKILL.md
Create `.ace/skills/our-auth-flow/SKILL.md` using this template:

```markdown
---
name: our-auth-flow
description: How to implement Okta authentication in our frontend.
---

# Skill: Okta Auth Flow

## Purpose
Ensure all new micro-frontends implement auth consistently.

## Prerequisites
- [ ] Okta Client ID available in `.env`

## Procedures
Step 1: Install the SDK
- Run `npm install @okta/okta-react`

Step 2: Wrap the App
- Use the `<Security>` provider.
- Pass the standard configuration object.
...
```

### Step 3: Register It
Open `.aceconfig` and add a trigger word:

```yaml
skill_triggers:
  auth: .ace/skills/our-auth-flow/SKILL.md
```

Now, anytime you ask the AI to "set up auth," it will follow your exact corporate standard!
