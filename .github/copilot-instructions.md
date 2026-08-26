# ACE-Framework Instructions for GitHub Copilot

This project uses the ACE-Framework (AI-assisted Code Engineering) v2.7.0.
Every task follows the BMAD methodology: Analyze -> Discuss -> Plan -> Execute -> Verify.

## Required Reading on Session Start

Before any task, read these files:

1. `.aceconfig` - Core rules, skill routing, role routing, and the verify gate
2. `.ace/roles/roles.md` - Available roles and their responsibilities
3. `docs/context/ACTIVE_CONTEXT.md` - Current session state
4. `docs/rca/regression-guards.yaml` - Protected files and invariants

## Core Rules

1. Never commit secrets, credentials, or API keys
2. All code must pass linting before commit
3. Follow patterns established in `docs/adr/`
4. Update `ACTIVE_CONTEXT.md` after each session
5. Verify against `.ace/standards/` before completing any task
6. Generate `docs/planning/implementation_plan.md` before writing code
7. Every task follows BMAD: Analyze -> Discuss -> Plan -> Execute -> Verify
8. Create an ADR for any significant architectural decision
9. Atomic commits with clear, descriptive messages
10. No code generation without reading existing code first
11. Check regression guards before modifying any guarded file
12. Every issue requires an RCA with regression prevention

## Roles

Activate the role that matches the current mode (see `role_routing` in `.aceconfig`):

| Mode | Role |
|------|------|
| PLANNING | Architect |
| EXECUTION | Developer (the Generator) |
| VERIFICATION | QA Engineer (also acts as Reflector and Curator) |
| INCIDENT | Incident Responder |
| RESEARCH | Data Scientist |
| PUBLICATION | Scientific Editor |

## Standards

When writing code, follow:

- `.ace/standards/coding.md` - Code quality rules
- `.ace/standards/security.md` - Security requirements (CRITICAL)
- `.ace/standards/architecture.md` - Design patterns
- `.ace/standards/git-workflow.md` - Commit and branching conventions
- `.ace/standards/harness-engineering.md` - Context flushing and rule lifecycle

Standards are immutable without an ADR. Never rewrite a standards file directly;
append deterministically via `.ace/scripts/update_harness.sh`.

## Skills

Load a skill on demand when the task matches its keyword. The full mapping lives
under `skill_triggers` in `.aceconfig`; each skill is at
`.ace/skills/<name>/SKILL.md`. Common triggers: `database`, `api`, `testing`,
`migration`, `refactor`, `review`, `bug`/`issue`/`incident`, `security`,
`performance`, `documentation`, `agent`, `mcp`.

If an expansion pack is installed, its skills are also available under
`.ace/packs/`.

## Before Modifying Files

1. Check `docs/rca/regression-guards.yaml` for guards
2. If the file is guarded, read the associated RCA
3. Understand the invariants that must be maintained
4. Run the regression tests listed in the guard after modification

## The Verify Gate

Nothing is done until the gate passes. Run it directly with:

```bash
bash .ace/scripts/verify.sh
```

It runs the commands configured under `verify:` in `.aceconfig` and prints a
machine-parseable `VERIFY_RESULT=pass|fail gate=<name>` as its last line. An
unconfigured gate fails - silence never counts as passing.

## The Loop (v2.7)

Task state lives in `docs/progress/tasks.json`, schema-enforced by
`.ace/schemas/tasks.schema.json`. When working inside `ace-framework loop`, the
orchestrator supplies the prompt and gates each attempt on `verify.sh`.

Copilot is driven through the `manual` runner: the loop prints the assembled
prompt, you run the session in Copilot Chat, then press Enter to trigger the
gate. The runner does not inspect what happened - the verify gate alone decides
pass or fail.

```bash
node cli/bin/ace-framework.js loop --dry-run   # preview queue state
node cli/bin/ace-framework.js loop --runner manual
```

Note: the enforced PreToolUse/Stop hooks under `.ace/adapters/claude-code/` are
Claude Code specific. Under Copilot the rules above are conventions, not
mechanically enforced gates - `verify.sh` is the enforcement point.

## Session Protocol

- **Start**: read `.aceconfig`, `.ace/roles/roles.md`, and `ACTIVE_CONTEXT.md`
- **End**: update `ACTIVE_CONTEXT.md` with completed work, blockers, and 1-3
  specific next steps

## Response Format

- Be specific about file locations
- Reference the relevant standard or ADR
- Follow established patterns in `docs/context/system_patterns.md`
