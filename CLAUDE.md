# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Primary Project

The main codebase lives at `~/code_projects/ace_framework/` â€” an IDE-agnostic framework for structured AI-human collaboration in software development (ACE-Framework v2.3).

## Commands

### Validate framework structure
```bash
cd ~/code_projects/ace_framework && ./scripts/validate.sh
```

### Test scaffold in a new project
```bash
cd ~/code_projects/ace_framework && ./scripts/init.sh ../test-project
```

### Lint markdown files
```bash
cd ~/code_projects/ace_framework && npx markdownlint '**/*.md'
```

### Run CLI locally
```bash
node ~/code_projects/ace_framework/cli/bin/create-ace-framework.js <target-dir>
```

### Scaffold a new project via npx
```bash
npx create-ace-framework my-project
```

## Architecture

The `ace_framework` repo is a **documentation + tooling framework**, not a traditional code project. It provides:

- **`.ace/`** â€” The "AI Control Center" (Shared Brain): immutable standards, role definitions, skills, prompts, and schemas loaded by AI agents on demand.
- **`docs/`** â€” Per-project living documents: ADRs, session context (`ACTIVE_CONTEXT.md`), planning artifacts, RCA records, and specs.
- **`cli/`** â€” A Node.js CLI (`create-ace-framework`) that scaffolds the `.ace/` + `docs/` structure into any project, either from bundled templates or by cloning from GitHub.
- **`.aceconfig`** â€” YAML config that defines core rules, skill triggers, role routing, validation hooks, and context paths. This is always loaded first by AI agents.
- **`.cursorrules`** / **`.aiconfig`** â€” IDE-specific AI behavior configuration files that mirror `.aceconfig` for Cursor and other tools.

### BMAD Methodology

Every task follows **Analyze â†’ Discuss â†’ Plan â†’ Execute â†’ Verify**:

- **ANALYZE** (Architect role): Read specs, ADRs, and regression guards; identify constraints; list unknowns.
- **DISCUSS** (Architect role): Capture user preferences on "gray areas"; update `docs/context/PROJECT_CONTEXT.md`.
- **PLAN** (Architect role): Produce `docs/planning/implementation_plan.md` before writing code.
- **EXECUTE** (Developer role): Implement atomically; check `docs/rca/regression-guards.yaml` before touching guarded files; commit after each task.
- **VERIFY** (QA Engineer role): Run all tests; validate against acceptance criteria; produce `docs/planning/walkthrough.md`.
- **INCIDENT** (Incident Responder role): Triggered on any issue. Requires 5-Whys RCA doc, regression guard, and standards update.

### Key Files to Load at Session Start

Per `.cursorrules`, always read before any task:
1. `.aceconfig` â€” core rules and skill routing
2. `.ace/roles/roles.md` â€” available roles and responsibilities
3. `docs/context/ACTIVE_CONTEXT.md` â€” current session state
4. `docs/rca/regression-guards.yaml` â€” protected files and invariants

### Skill-Triggered Loading

`.aceconfig` maps task keywords to skills (load on demand, not upfront):

| Keyword | Skill file |
|---------|-----------|
| database | `.ace/skills/database-operations/SKILL.md` |
| api | `.ace/skills/api-design/SKILL.md` |
| testing | `.ace/skills/testing-strategy/SKILL.md` |
| migration | `.ace/skills/migration-logic/SKILL.md` |
| refactor | `.ace/skills/refactoring/SKILL.md` |
| bug/issue/incident | `.ace/skills/root-cause-analysis/SKILL.md` |
| transcript/meeting/interview | `.ace/skills/transcript-analysis/SKILL.md` |
| pipeline/etl/data | `.ace/skills/data-pipeline-design/SKILL.md` |
| prompt/llm/ai | `.ace/skills/prompt-engineering/SKILL.md` |
| model/evaluation/ml | `.ace/skills/model-evaluation/SKILL.md` |
| feature/engineering | `.ace/skills/feature-engineering/SKILL.md` |
| security/audit | `.ace/skills/security-audit/SKILL.md` |
| performance/optimize | `.ace/skills/performance-optimization/SKILL.md` |
| accessibility/a11y | `.ace/skills/accessibility-audit/SKILL.md` |
| ci/cd/deploy | `.ace/skills/ci-cd-pipeline/SKILL.md` |
| error/exception | `.ace/skills/error-handling/SKILL.md` |
| documentation/docs | `.ace/skills/documentation-generation/SKILL.md` |
| state/redux/context | `.ace/skills/state-management/SKILL.md` |
| agent/autonomous | `.ace/skills/agent-design/SKILL.md` |
| a2a/multi-agent | `.ace/skills/a2a-communication/SKILL.md` |
| mcp/protocol | `.ace/skills/mcp-implementation/SKILL.md` |

### Third-Party Skills (Claude Code Marketplace)

Because ACE uses the AgentSkills.io standard, you can instantly expand capabilities using Anthropic's native marketplace. 

To give the Architect the ability to parse PDFs, Word docs, and Excel files:
```bash
/plugin marketplace add anthropics/skills
/plugin install document-skills@anthropic-agent-skills
```
*Note: This allows you to directly pass binary documents into the `.ace/skills/transcript-analysis/SKILL.md` workflow or analyze-requirements prompt.*

### Expansion Packs

To keep the core framework lightweight, large domain-specific skill collections are managed as **Expansion Packs**.

**Scientific Expansion Pack**: Enables the *Data Scientist*, *AI Expert*, and *Scientific Editor* roles with 135+ scientific skills (e.g., bioinformatics, chemistry, clinical data).
```bash
npx skills add K-Dense-AI/scientific-agent-skills
```
*Note: Installing this pack dynamically loads `.ace/packs/scientific/.aceconfig-ext` into your core `.aceconfig`.*

### Regression Guard Protocol

Before modifying any file: check `docs/rca/regression-guards.yaml`. If guarded, read the associated RCA, understand the invariants, and run the specified regression tests after modification.

### Commit and Branch Conventions

- Branch naming: `feature/short-description`, `fix/issue-number-description`, `docs/what-changed`
- Commit format: `type(scope): description` (conventional commits)
- All code must pass linting before commit
- Atomic commits â€” one logical change per commit

### ADR Protocol

Create an ADR (`docs/adr/ADR-###-description.md`) for any significant architectural decision. Standards in `.ace/standards/` are immutable without an ADR.

### Session End

Always update `docs/context/ACTIVE_CONTEXT.md` with completed work, blockers, and next steps (1â€“3 specific tasks).

