# ACE-Framework v2.3

## AI-assisted Code Engineering

> A rigorous, IDE-agnostic standard for professional development teams using AI agents. Treats AI interactions as structured transactions, not casual conversations.

---

## Table of Contents

1. [Directory Blueprint](#1-directory-blueprint)
2. [Core Methodologies](#2-core-methodologies)
3. [BMAD Agentic Roles](#3-bmad-agentic-roles)
4. [Documentation Standards](#4-documentation-standards)
5. [Architecture Decision Records](#5-architecture-decision-records)
6. [Active Context Pattern](#6-active-context-pattern)
7. [Root Cause Analysis & Regression Prevention](#7-root-cause-analysis--regression-prevention)
8. [Governance & Standards](#8-governance--standards)
9. [Session Management](#9-session-management)
10. [Multi-Agent Coordination](#10-multi-agent-coordination)
11. [Validation & Schemas](#11-validation--schemas)
12. [Getting Started](#12-getting-started)

---

## 1. Directory Blueprint

The repository must contain a `.ace/` directory (AI Context Engine). This is the **Shared Brain** of the project.

```
/
├── .ace/                      # AI Control Center (Knowledge Layer)
│   ├── feedback/              # Incident logs and improvement tracking
│   │   └── log.md
│   ├── knowledge/             # Domain-specific context
│   │   ├── glossary.md        # Domain terminology
│   │   ├── business-rules.md  # Core business logic
│   │   └── entities.md        # Domain model definitions
│   ├── prompts/               # Verified "Golden Prompts"
│   │   ├── analyze-requirements.md
│   │   ├── extract-transcript.md
│   │   ├── generate-implementation-plan.md
│   │   └── verify-implementation.md
│   ├── roles/                 # BMAD Agentic Role definitions
│   │   └── roles.md           # All 7 roles in one file
│   ├── schemas/               # Validation definitions
│   │   └── validation.md
│   ├── skills/                # Task-specific procedural knowledge
│   │   ├── api-design.md
│   │   ├── database-operations.md
│   │   ├── migration-logic.md
│   │   ├── refactoring.md
│   │   ├── root-cause-analysis.md
│   │   ├── testing-strategy.md
│   │   └── transcript-analysis.md
│   ├── standards/             # Immutable guardrails
│   │   ├── coding.md
│   │   ├── security.md
│   │   ├── architecture.md
│   │   └── documentation.md
│   └── workflows/             # Automation hooks
│       └── hooks.md
├── docs/
│   ├── adr/                   # Architecture Decision Records
│   │   ├── ADR-000-template.md
│   │   └── ADR-XXX-*.md
│   ├── context/               # Session state
│   │   └── ACTIVE_CONTEXT.md
│   ├── inputs/                # Raw unstructured data
│   │   └── transcripts/       # Meeting/interview transcripts
│   ├── planning/              # Implementation artifacts
│   │   ├── implementation_plan.md
│   │   ├── task_checklist.md
│   │   └── walkthrough.md
│   ├── rca/                   # Root Cause Analysis
│   │   ├── README.md
│   │   ├── RCA-000-template.md
│   │   └── regression-guards.yaml
│   └── requirements/          # Specifications & extracted requirements
│       ├── PRD-template.md
│       └── TECH_SPEC-template.md
├── .aceconfig                 # Framework configuration
├── ACE-SPEC.md               # This specification
└── README.md                 # Quick start guide
```

### Directory Purposes

| Directory         | Purpose                   | Mutability               |
| ----------------- | ------------------------- | ------------------------ |
| `.ace/standards/` | Non-negotiable rules      | Immutable (ADR required) |
| `.ace/skills/`    | Procedural task knowledge | Append-only              |
| `.ace/roles/`     | Agent role definitions    | Stable                   |
| `.ace/knowledge/` | Domain context            | Evolving                 |
| `.ace/prompts/`   | Tested prompt templates   | Versioned                |
| `docs/context/`   | Session state             | Volatile                 |
| `docs/inputs/`    | Raw unstructured data     | Append-only              |
| `docs/requirements/` | Specifications & requirements | Controlled          |
| `docs/adr/`       | Decision history          | Append-only              |
| `docs/rca/`       | Issue analysis            | Append-only              |
| `docs/planning/`  | Implementation artifacts  | Per-task                 |

---

## 2. Core Methodologies

### A. BMAD (Breakthrough Method for Agile AI-Driven Development)

BMAD enforces **Analyze → Plan → Execute → Verify** to prevent premature implementation.

```
┌───────────────────────────────────────────────────────────────────────┐
│                          BMAD Cycle                                   │
├───────────────────────────────────────────────────────────────────────┤
│                                                                       │
│   ┌───────┐    ┌───────┐    ┌──────┐    ┌───────┐    ┌──────┐         │
│   │ANALYZE│───▶│DISCUSS│───▶│ PLAN │───▶│EXECUTE│───▶│VERIFY│         │
│   └───────┘    └───────┘    └──────┘    └───────┘    └──────┘         │
│       │                                                   │           │
│       └──────────────◀────────────────────────────────────┘           │
│                    (Feedback Loop)                                    │
│                           │                                           │
│                    ┌──────┴──────┐                                    │
│                    │  INCIDENT   │ (When issues found)                │
│                    └─────────────┘                                    │
└───────────────────────────────────────────────────────────────────────┘
```

#### Phase 1: ANALYZE

```
Role: Architect
Input: docs/requirements/*, docs/adr/*, .ace/knowledge/*
Output: Understanding confirmation with extracted constraints

Actions:
- Read and summarize requirements
- Identify constraints from standards
- Extract applicable business rules
- List unknowns and questions
- Check regression guards for affected files
```

#### Phase 2: DISCUSS

```
Role: Architect
Input: Analysis output, User preferences
Output: docs/context/PROJECT_CONTEXT.md

Actions:
- Present multiple options for "gray areas" (UI, API style, etc.)
- Capture user preference on specific implementation details
- Document decisions in PROJECT_CONTEXT.md
- Ensure "Soft Requirements" are explicit before planning
```

#### Phase 3: PLAN

```
Role: Architect
Input: Analysis output
Output: docs/planning/implementation_plan.md (requires approval)

Actions:
- Break down into atomic tasks
- Define acceptance criteria per task
- Identify tests to write
- Order by dependencies
- Review against ADRs
```

#### Phase 4: EXECUTE

```
Role: Developer
Input: Approved plan, relevant .ace/skills/*
Output: Code in atomic, reviewable increments

Actions:
- Check regression guards before modifying files
- Implement one task at a time
- Write tests alongside code
- Update task_checklist.md
- Commit after each task
```

#### Phase 5: VERIFY

```
Role: QA Engineer
Input: Completed code, .ace/standards/*, docs/adr/*
Output: docs/planning/walkthrough.md

Actions:
- Execute verification plan
- Run all tests including regression tests
- Validate against acceptance criteria
- Check regression guard compliance
- Document proof of success
```

#### INCIDENT Mode

```
Role: Incident Responder
Trigger: Issue discovered at any phase
Output: docs/rca/RCA-XXX.md, regression guard, tests

Actions:
- Apply immediate fix
- Perform 5 Whys analysis
- Create RCA document
- Implement permanent fix
- Add regression guard
- Update standards if needed
```

### B. Skill-Augmentation

Skills are specialized instruction sets in `.ace/skills/` that grant deep technical capabilities.

**Available Skills:**

- `api-design.md` - REST API conventions and patterns
- `database-operations.md` - Schema changes and queries
- `migration-logic.md` - Safe data and schema migrations
- `refactoring.md` - Code structure improvements
- `root-cause-analysis.md` - Issue investigation methodology
- `transcript-analysis.md` - Transcript to requirements extraction
- `testing-strategy.md` - Test pyramid and coverage

**Invocation:**

```markdown
"Apply the skill in .ace/skills/[skill-name]/SKILL.md for this task.
Follow the procedure exactly and report validation results."
```

---

## 3. BMAD Agentic Roles

Seven specialized roles for distinct phases of work. Defined in `.ace/roles/roles.md`.

### Role Summary

| Role               | Mode         | Focus                   |
| ------------------ | ------------ | ----------------------- |
| Architect          | PLANNING     | Design, planning, ADRs  |
| Developer          | EXECUTION    | Implementation, tests   |
| QA Engineer        | VERIFICATION | Testing, validation     |
| Incident Responder | INCIDENT     | RCA, fixes, guards      |
| Data Scientist     | RESEARCH     | Statistics, experiments |
| AI Expert          | RESEARCH     | Algorithms, models      |
| Scientific Editor  | PUBLICATION  | Papers, documentation   |

### Role Activation

```markdown
"Assume the [Role] role defined in .ace/roles/roles.md.
Focus on [role's responsibilities]. Follow the mode protocol."
```

### Role Transitions

```
PLANNING → EXECUTION
  Handoff: implementation_plan.md approved
  Pre-check: Regression guards reviewed

EXECUTION → VERIFICATION
  Handoff: Code committed, tests written
  Pre-check: Regression tests identified

Any → INCIDENT
  Trigger: Issue discovered
  Output: RCA with prevention measures

INCIDENT → Previous Mode
  Handoff: RCA closed, guards in place
  Pre-check: Regression tests passing
```

### Regression Guard Protocol

**All roles must follow:**

1. Before modifying files → Check `docs/rca/regression-guards.yaml`
2. If file is guarded → Read associated RCA, understand invariants
3. During modification → Ensure invariants maintained
4. After modification → Run regression tests, verify compliance

---

## 4. Documentation Standards

### Documentation Hierarchy

```
┌─────────────────────────────────────────────────────────┐
│                  DOCUMENTATION PYRAMID                  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│              ┌─────────────────────┐                    │
│              │   docs/requirements/│  Source of Truth   │
│              │   (WHAT to build)   │  [Static]          │
│              └──────────┬──────────┘                    │
│                         │                               │
│         ┌───────────────┼───────────────┐               │
│         ▼               ▼               ▼               │
│   ┌───────────┐   ┌───────────┐   ┌───────────┐        │
│   │.ace/      │   │ docs/adr/ │   │.ace/      │        │
│   │standards/ │   │ (WHY we   │   │knowledge/ │        │
│   │(HOW to    │   │  decided) │   │(DOMAIN    │        │
│   │ build)    │   │ [Append]  │   │ context)  │        │
│   │[Immutable]│   └───────────┘   │[Evolving] │        │
│   └───────────┘                   └───────────┘        │
│                         │                               │
│         ┌───────────────┼───────────────┐               │
│         ▼               ▼               ▼               │
│   ┌───────────┐   ┌───────────┐   ┌───────────┐        │
│   │docs/rca/  │   │docs/      │   │docs/      │        │
│   │(Issues &  │   │planning/  │   │context/   │        │
│   │ Guards)   │   │(Tasks)    │   │(State)    │        │
│   │[Append]   │   │[Per-task] │   │[Volatile] │        │
│   └───────────┘   └───────────┘   └───────────┘        │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Document Types

| Type          | Location          | Purpose              | Update Frequency      |
| ------------- | ----------------- | -------------------- | --------------------- |
| Specification | `docs/requirements/` | Define requirements  | Per feature           |
| Standard      | `.ace/standards/` | Enforce constraints  | Rarely (ADR required) |
| Decision      | `docs/adr/`       | Record choices       | Per decision          |
| RCA           | `docs/rca/`       | Document issues      | Per incident          |
| Plan          | `docs/planning/`  | Track implementation | Per task              |
| Context       | `docs/context/`   | Session state        | Per session           |

---

## 5. Architecture Decision Records

ADRs prevent AI from suggesting patterns that conflict with existing decisions.

### ADR Protocol

1. **Mandatory Creation:** Any significant architectural choice requires an ADR
2. **Naming:** `ADR-###-short-description.md`
3. **Pre-Task Loading:** Always read relevant ADRs before work

### ADR Template

```markdown
# ADR-###: [Title]

## Status

[Proposed | Accepted | Deprecated | Superseded by ADR-###]

## Date

[YYYY-MM-DD]

## Context

[Problem and constraints]

## Decision

[Specific choice made]

## Alternatives Considered

[What else was evaluated and why rejected]

## Consequences

### Positive

### Negative

### Neutral

## Compliance

[How to verify adherence]
```

---

## 6. Active Context Pattern

The **Context Memo Protocol** bridges sessions and prevents context drift.

### ACTIVE_CONTEXT.md Structure

```markdown
# Active Context: [Task Name]

## Session Metadata

- **Last Updated:** [YYYY-MM-DD HH:MM]
- **Active Role:** [Current role]
- **Mode:** [PLANNING | EXECUTION | VERIFICATION | INCIDENT]

## Current Objective

[Specific goal for this session]

## Current State

### Working

### In Progress

### Blocked

## Next Steps

1. [ ] [Immediate task]
2. [ ] [Following task]

## Active Constraints

- Standards: [relevant files]
- ADRs: [relevant files]
- Guards: [relevant files]

## Session Notes

[Context that would be lost without documentation]
```

### Update Triggers

- End of every session
- After completing significant task
- When encountering blocker
- Before role transition

---

## 7. Root Cause Analysis & Regression Prevention

Every issue requires RCA with regression prevention. No exceptions.

### RCA Process

```
1. DOCUMENT → Capture symptoms, evidence, timeline
2. ANALYZE  → 5 Whys to identify root cause
3. FIX      → Immediate fix + Permanent fix
4. PREVENT  → Tests + Guard + Standards update
5. VERIFY   → Confirm fix and prevention measures
```

### Regression Guards

Located in `docs/rca/regression-guards.yaml`:

```yaml
guards:
  - id: RCA-001
    title: "Description of issue"
    severity: critical
    rca_file: docs/rca/RCA-001-description.md
    guarded_files:
      - path/to/file.ts
    invariants:
      - "Condition that must remain true"
    tests:
      - tests/regression/rca-001.test.ts
    standard_rule: "RULE-ID in .ace/standards/xxx.md"
```

### Guard Enforcement

- **Pre-generation hook:** Check guards before modifying files
- **Post-generation hook:** Verify invariants maintained
- **Pre-commit hook:** Run regression tests
- **Code review:** Verify guard compliance

---

## 8. Governance & Standards

### The Instruction Budget

AI context windows are finite. Use tiered loading:

```
TIER 1: Always Loaded (~500 tokens)
├── .aceconfig (core rules)
└── Current ACTIVE_CONTEXT.md

TIER 2: Task-Specific (loaded on demand)
├── Relevant .ace/standards/ file
├── Relevant .ace/skills/ file
├── Relevant docs/adr/ files
└── Relevant regression guards

TIER 3: Deep Context (when referenced)
├── .ace/knowledge/* (domain)
└── docs/requirements/* (requirements)
```

### Core Rules (.aceconfig)

```yaml
core_rules:
  - "Never commit secrets, credentials, or API keys"
  - "All code must pass linting before commit"
  - "Follow patterns established in docs/adr/"
  - "Update ACTIVE_CONTEXT.md after each session"
  - "Verify against .ace/standards/ before completing any task"
  - "Generate IMPLEMENTATION_PLAN.md before writing code"
  - "Every task follows BMAD: Analyze → Plan → Execute → Verify"
  - "Create ADR for any significant architectural decision"
  - "Atomic commits with clear, descriptive messages"
  - "No code generation without reading existing code first"
  - "Check regression guards before modifying any guarded file"
  - "Every issue requires RCA with regression prevention"
```

---

## 9. Session Management

### Starting a Session

```markdown
"I am starting a new session with the ACE-Framework. Please:

1. Read .aceconfig for project configuration
2. Read .ace/roles/roles.md for available roles
3. Read docs/context/ACTIVE_CONTEXT.md for current state
4. Read docs/rca/regression-guards.yaml for active guards
5. Confirm understanding and await instructions."
```

### During a Session

- Maintain awareness of current role and mode
- Check regression guards before file modifications
- Update task_checklist.md as work progresses
- Note any decisions that need ADRs

### Ending a Session

```markdown
"Update docs/context/ACTIVE_CONTEXT.md with:

- Work completed this session
- Current blockers
- Next steps (1-3 specific tasks)
- Any open questions

Summarize the session state."
```

### Session Handoff

When transitioning between sessions or agents:

1. ACTIVE_CONTEXT.md must be current
2. All work-in-progress committed
3. Blockers documented
4. Next steps clearly defined

---

## 10. Multi-Agent Coordination

### Sequential Handoff

```
Agent A (Architect) → Agent B (Developer) → Agent C (QA)
                   ↓                     ↓
           implementation_plan.md   walkthrough.md
```

### Parallel Work

```
Coordinator assigns separate features to different agents.
Each maintains separate ACTIVE_CONTEXT_[feature].md.
Coordinator reviews before integration.
```

### Coordination Rules

1. **Lock awareness:** Check if files are being modified by another agent
2. **Context namespacing:** Use feature-specific context files for parallel work
3. **Merge protocol:** Coordinator reviews all changes before integration
4. **Conflict resolution:** ADR required for conflicting approaches

---

## 11. Validation & Schemas

### Schema Enforcement

Defined in `.ace/schemas/validation.md`. Validate AI outputs against expected structures:

- Implementation Plan schema
- ADR schema
- Active Context schema
- API documentation schema

### Validation Commands

```markdown
"Validate [document] against the schema in .ace/schemas/validation.md.
Report any violations."
```

---

## 12. Getting Started

### Quick Start Checklist

```markdown
## Phase 1: Initialize Structure

- [ ] .ace/ directory with subdirectories created
- [ ] docs/ directory with subdirectories created
- [ ] .aceconfig with core rules
- [ ] README.md with quick start

## Phase 2: Define Standards

- [ ] .ace/standards/coding.md for your stack
- [ ] .ace/standards/security.md with constraints
- [ ] .ace/standards/architecture.md with patterns

## Phase 3: Record Decisions

- [ ] ADR-001 for tech stack
- [ ] ADR-002 for architecture pattern
- [ ] Document existing decisions

## Phase 4: First Task

- [ ] Create spec in docs/requirements/
- [ ] Initialize ACTIVE_CONTEXT.md
- [ ] Run complete BMAD cycle
```

### First Session Prompt

```markdown
"I am initializing an ACE-Framework project. Please:

1. Read .aceconfig for project configuration
2. Read .ace/standards/ for coding constraints
3. Read .ace/roles/roles.md for available roles
4. Read docs/adr/ for existing decisions
5. Confirm you understand the project context

Then await further instructions."
```

---

## Appendix A: File Quick Reference

| Need To...                    | Look In...                             |
| ----------------------------- | -------------------------------------- |
| Understand project rules      | `.aceconfig`                           |
| Know available roles          | `.ace/roles/roles.md`                  |
| Check coding standards        | `.ace/standards/coding.md`             |
| Check security rules          | `.ace/standards/security.md`           |
| Get current context           | `docs/context/ACTIVE_CONTEXT.md`       |
| See implementation plan       | `docs/planning/implementation_plan.md` |
| Check architectural decisions | `docs/adr/`                            |
| Check regression guards       | `docs/rca/regression-guards.yaml`      |
| Understand domain terms       | `.ace/knowledge/glossary.md`           |
| Learn a specific skill        | `.ace/skills/[skill]/SKILL.md`               |

---

## Appendix B: Mode Quick Reference

| Mode         | Role               | Entry Trigger    | Exit Trigger        |
| ------------ | ------------------ | ---------------- | ------------------- |
| PLANNING     | Architect          | New task/feature | Plan approved       |
| EXECUTION    | Developer          | Plan approved    | Code complete       |
| VERIFICATION | QA Engineer        | Code complete    | Verification passed |
| INCIDENT     | Incident Responder | Issue discovered | RCA closed          |
| RESEARCH     | Data Scientist     | Analysis needed  | Results documented  |
| PUBLICATION  | Scientific Editor  | Writing needed   | Document complete   |

---

## Appendix C: Glossary

| Term              | Definition                                          |
| ----------------- | --------------------------------------------------- |
| **ACE**           | AI Context Engine - the `.ace/` directory structure |
| **ADR**           | Architecture Decision Record                        |
| **BMAD**          | Breakthrough Method for Agile AI-Driven Development |
| **Context Drift** | Loss of focus/state across AI sessions              |
| **Golden Prompt** | A tested, versioned prompt with known success rate  |
| **Guard**         | Regression prevention rule protecting a file        |
| **Invariant**     | Condition that must remain true after changes       |
| **RCA**           | Root Cause Analysis                                 |
| **Role**          | A defined agent persona with specific expertise     |
| **Skill**         | Procedural knowledge for a specific task type       |

---

_ACE-Framework v2.3_
_Treat AI interactions as structured transactions, not casual conversations._
