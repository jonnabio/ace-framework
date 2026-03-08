# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Primary Project

The main codebase lives at `~/code_projects/ace_framework/` — an IDE-agnostic framework for structured AI-human collaboration in software development (ACE-Framework v2.0).

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

- **`.ace/`** — The "AI Control Center" (Shared Brain): immutable standards, role definitions, skills, prompts, and schemas loaded by AI agents on demand.
- **`docs/`** — Per-project living documents: ADRs, session context (`ACTIVE_CONTEXT.md`), planning artifacts, RCA records, and specs.
- **`cli/`** — A Node.js CLI (`create-ace-framework`) that scaffolds the `.ace/` + `docs/` structure into any project, either from bundled templates or by cloning from GitHub.
- **`.aceconfig`** — YAML config that defines core rules, skill triggers, role routing, validation hooks, and context paths. This is always loaded first by AI agents.
- **`.cursorrules`** / **`.aiconfig`** — IDE-specific AI behavior configuration files that mirror `.aceconfig` for Cursor and other tools.

### BMAD Methodology

Every task follows **Analyze → Plan → Execute → Verify**:

- **ANALYZE** (Architect role): Read specs, ADRs, and regression guards; identify constraints; list unknowns.
- **PLAN** (Architect role): Produce `docs/planning/implementation_plan.md` before writing code.
- **EXECUTE** (Developer role): Implement atomically; check `docs/rca/regression-guards.yaml` before touching guarded files; commit after each task.
- **VERIFY** (QA Engineer role): Run all tests; validate against acceptance criteria; produce `docs/planning/walkthrough.md`.
- **INCIDENT** (Incident Responder role): Triggered on any issue. Requires 5-Whys RCA doc, regression guard, and standards update.

### Key Files to Load at Session Start

Per `.cursorrules`, always read before any task:
1. `.aceconfig` — core rules and skill routing
2. `.ace/roles/roles.md` — available roles and responsibilities
3. `docs/context/ACTIVE_CONTEXT.md` — current session state
4. `docs/rca/regression-guards.yaml` — protected files and invariants

### Skill-Triggered Loading

`.aceconfig` maps task keywords to skills (load on demand, not upfront):

| Keyword | Skill file |
|---------|-----------|
| database | `.ace/skills/database-operations.md` |
| api | `.ace/skills/api-design.md` |
| testing | `.ace/skills/testing-strategy.md` |
| migration | `.ace/skills/migration-logic.md` |
| refactor | `.ace/skills/refactoring.md` |
| bug/issue/incident | `.ace/skills/root-cause-analysis.md` |

### Regression Guard Protocol

Before modifying any file: check `docs/rca/regression-guards.yaml`. If guarded, read the associated RCA, understand the invariants, and run the specified regression tests after modification.

### Commit and Branch Conventions

- Branch naming: `feature/short-description`, `fix/issue-number-description`, `docs/what-changed`
- Commit format: `type(scope): description` (conventional commits)
- All code must pass linting before commit
- Atomic commits — one logical change per commit

### ADR Protocol

Create an ADR (`docs/adr/ADR-###-description.md`) for any significant architectural decision. Standards in `.ace/standards/` are immutable without an ADR.

### Session End

Always update `docs/context/ACTIVE_CONTEXT.md` with completed work, blockers, and next steps (1–3 specific tasks).
