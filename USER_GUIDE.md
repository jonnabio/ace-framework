# ACE-Framework User Guide v2.5.0

> A practical guide to using the AI-assisted Code Engineering Framework.

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Getting Started](#2-getting-started)
3. [Daily Workflows](#3-daily-workflows)
4. [Working with Roles](#4-working-with-roles)
5. [Using Skills](#5-using-skills)
6. [Managing Context](#6-managing-context)
7. [Handling Issues](#7-handling-issues)
8. [Code Review Process](#8-code-review-process)
9. [Common Scenarios](#9-common-scenarios)
10. [Best Practices](#10-best-practices)
11. [Troubleshooting](#11-troubleshooting)
12. [Quick Reference](#12-quick-reference)

---

## 1. Introduction

### What is ACE-Framework?

ACE-Framework (AI-assisted Code Engineering) is a structured methodology for working with AI coding assistants. It ensures:

- **Consistency** - Same patterns across sessions and team members
- **Context Preservation** - No lost work between sessions
- **Quality** - Standards enforced at every step
- **Safety** - Regression prevention through guards

### The BMAD Methodology

Every task follows four phases:

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                          BMAD Cycle                                   â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚                                                                       â”‚
â”‚   â”Œâ”€â”€â”€â”€â”€â”€â”€â”    â”Œâ”€â”€â”€â”€â”€â”€â”€â”    â”Œâ”€â”€â”€â”€â”€â”€â”    â”Œâ”€â”€â”€â”€â”€â”€â”€â”    â”Œâ”€â”€â”€â”€â”€â”€â”         â”‚
â”‚   â”‚ANALYZEâ”‚â”€â”€â”€â–¶â”‚DISCUSSâ”‚â”€â”€â”€â–¶â”‚ PLAN â”‚â”€â”€â”€â–¶â”‚EXECUTEâ”‚â”€â”€â”€â–¶â”‚VERIFYâ”‚         â”‚
â”‚   â””â”€â”€â”€â”€â”€â”€â”€â”˜    â””â”€â”€â”€â”€â”€â”€â”€â”˜    â””â”€â”€â”€â”€â”€â”€â”˜    â””â”€â”€â”€â”€â”€â”€â”€â”˜    â””â”€â”€â”€â”€â”€â”€â”˜         â”‚
â”‚       â”‚                                                   â”‚           â”‚
â”‚       â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â—€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜           â”‚
â”‚                    (Feedback Loop)                                    â”‚
â”‚                           â”‚                                           â”‚
â”‚                    â”Œâ”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”                                    â”‚
â”‚                    â”‚  INCIDENT   â”‚ (When issues found)                â”‚
â”‚                    â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜                                    â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**Never skip steps.** This prevents costly mistakes and rework.

### Key Concepts

| Concept  | What It Is                         | Where It Lives                    |
| -------- | ---------------------------------- | --------------------------------- |
| Role     | AI persona with specific expertise | `.ace/roles/roles.md`             |
| Skill    | Procedural knowledge for tasks     | `.ace/skills/`                    |
| Standard | Rules that must be followed        | `.ace/standards/`                 |
| Context  | Current session state              | `docs/context/ACTIVE_CONTEXT.md`  |
| ADR      | Recorded architectural decision    | `docs/adr/`                       |
| RCA      | Issue analysis with prevention     | `docs/rca/`                       |
| Guard    | Protection against regression      | `docs/rca/regression-guards.yaml` |

---

## 2. Getting Started

### First-Time Setup

If you're setting up a new project with ACE-Framework:

1. **Copy the framework structure** to your project
2. **Customize standards** for your tech stack
3. **Create initial ADRs** for existing decisions
4. **Set up IDE configuration** (`.cursorrules`, `.vscode/`)

### Starting Your First Session

When you begin working with an AI assistant:

```markdown
"I am starting a new session with the ACE-Framework. Please:

1. Read .aceconfig for project rules
2. Read .ace/roles/roles.md for available roles
3. Read docs/context/ACTIVE_CONTEXT.md for current state
4. Read docs/rca/regression-guards.yaml for protected files

Confirm you understand the context, then await instructions."
```

**What the AI will do:**

- Load project configuration
- Understand available roles
- See where previous work left off
- Know which files need special care

### Understanding Your Current State

Before starting work, check:

```markdown
"What is the current state of the project?
Summarize ACTIVE_CONTEXT.md and any pending tasks."
```

---

## 3. Daily Workflows

### Workflow A: Starting a New Feature

**Step 1: Analyze & Discuss**

```markdown
"Set mode to ANALYZE with Architect role.
I need to implement [feature description].
Analyze requirements, then run the Discuss phase to align on preferences."
```

**Step 2: Plan**

```markdown
"Use the preferences in PROJECT_CONTEXT.md to create an implementation plan.
Output tasks using the new XML format."
```

**Step 3: Review the Plan**
The AI will create `docs/planning/implementation_plan.md`. Review it:

- Are tasks correctly broken down?
- Are dependencies in order?
- Are acceptance criteria clear?

**Step 4: Approve and Execute**

```markdown
"The plan is approved. Switch to Developer role and EXECUTION mode.
Commit effectively: One atomic commit per task. No batching."
```

**Step 5: Verify**

```markdown
"Switch to QA Engineer role and VERIFICATION mode.
Verify the implementation against the acceptance criteria."
```

### Workflow B: Fixing a Bug

**Step 1: Investigate**

```markdown
"I found a bug: [description].
Investigate the issue and identify potential causes."
```

**Step 2: If Simple Fix**

```markdown
"This is a simple fix. Implement the fix following coding standards.
Write a test that would have caught this bug."
```

**Step 3: If Complex or Recurring**

```markdown
"This needs root cause analysis.
Switch to INCIDENT mode and apply the RCA skill."
```

### Workflow C: Continuing Previous Work

**Step 1: Load Context**

```markdown
"Read ACTIVE_CONTEXT.md and continue from where we left off.
What are the next steps?"
```

**Step 2: Resume Work**

```markdown
"Continue with [next task from context].
Remember to check regression guards for any files we modify."
```

### Workflow D: Code Review

```markdown
"Review this code change.
Check for standards compliance, security issues, and regression guards."
```

### Workflow E: Processing a Transcript

**Step 1: Prepare the Transcript**

Place your raw transcript (meeting notes, interview recording, etc.) in the input directory:

```
docs/inputs/transcripts/2026-05-01-kickoff-meeting.md
```

**Step 2: Extract Requirements**

```markdown
"Apply the transcript analysis skill from .ace/skills/transcript-analysis/SKILL.md
to process the transcript at docs/inputs/transcripts/2026-05-01-kickoff-meeting.md.
Extract all requirements and save to docs/requirements/REQ-001-project-kickoff.md."
```

**Step 3: Review and Validate**

```markdown
"Review the extracted requirements in docs/requirements/REQ-001-project-kickoff.md.
Identify any requirements marked AMBIGUOUS and suggest clarifying questions
I should ask the stakeholders."
```

**Step 4: Feed into BMAD Analyze**

```markdown
"Requirements extraction complete. Use docs/requirements/REQ-001-project-kickoff.md
as input for the Analyze phase. Apply the analyze-requirements prompt."
```

---

## 4. Working with Roles

### Available Roles

| Role                   | When to Use                             | Key Focus                    |
| ---------------------- | --------------------------------------- | ---------------------------- |
| **Architect**          | Planning new features, design decisions | Big picture, patterns, ADRs  |
| **Developer**          | Writing code, implementing features     | Clean code, tests, standards |
| **QA Engineer**        | Testing, verification                   | Edge cases, regression       |
| **Incident Responder** | Fixing bugs, investigating issues       | RCA, prevention              |
| **Data Scientist**     | Analysis, experiments (Scientific Pack) | Statistics, rigor            |
| **AI Expert**          | Algorithm design (Scientific Pack)      | Theory, optimization         |
| **Scientific Editor**  | Writing papers (Scientific Pack)        | Clarity, precision           |
| **AI Researcher**      | Model architecture (AI Research Pack)   | SOTA, theory, evaluation     |
| **MLOps Engineer**     | Deployment & serving (AI Research Pack) | vLLM, DeepSpeed, performance |

### Activating a Role

```markdown
"Switch to [Role Name] role."
```

Or more explicitly:

```markdown
"Assume the Developer role defined in .ace/roles/roles.md.
Focus on clean implementation following the approved plan."
```

### Role Transitions

Roles follow a natural flow:

```
Feature Development:
Architect â†’ Developer â†’ QA Engineer

Bug Investigation:
Any Role â†’ Incident Responder â†’ Previous Role

Research:
AI Expert â†’ Data Scientist â†’ Scientific Editor
```

**Important:** Complete one role's work before switching. Update `ACTIVE_CONTEXT.md` at transitions.

---

## 5. Using Skills

> **Note:** For a complete deep-dive into the core skills, expansion pack skills (Scientific & AI Research), how to invoke them, and how to import third-party skills via the CLI, please see the dedicated [SKILLS_GUIDE.md](SKILLS_GUIDE.md).

### What Are Skills?

Skills are detailed procedures for specific tasks. They contain:

- Step-by-step instructions
- Checklists
- Common pitfalls to avoid
- Validation criteria

### Available Skills

| Skill                    | Use For                  |
| ------------------------ | ------------------------ |
| `api-design/SKILL.md`          | Creating REST APIs       |
| `database-operations/SKILL.md` | Schema changes, queries  |
| `migration-logic/SKILL.md`     | Data/schema migrations   |
| `refactoring/SKILL.md`         | Improving code structure |
| `root-cause-analysis/SKILL.md` | Investigating issues     |
| `testing-strategy/SKILL.md`    | Writing tests            |
| `transcript-analysis/SKILL.md` | Extracting requirements  |
| `code-review/SKILL.md`         | Reviewing code           |
| `data-pipeline-design/SKILL.md`| Designing ETL/ELT flows  |
| `prompt-engineering/SKILL.md`  | Building LLM prompts     |
| `model-evaluation/SKILL.md`    | Testing ML models        |
| `feature-engineering/SKILL.md` | Transforming ML data     |
| `security-audit/SKILL.md`      | Security reviews         |
| `performance-optimization/SKILL.md` | Profiling/optimization |
| `accessibility-audit/SKILL.md` | WCAG compliance          |
| `ci-cd-pipeline/SKILL.md`      | DevOps & deployments     |
| `error-handling/SKILL.md`      | Exception strategies     |
| `documentation-generation/SKILL.md`| Auto-generating docs |
| `state-management/SKILL.md`    | App state & flow         |
| `agent-design/SKILL.md`        | Autonomous AI agents     |
| `a2a-communication/SKILL.md`   | Multi-agent protocols    |
| `mcp-implementation/SKILL.md`  | Model Context Protocol   |

### Third-Party Skills (Marketplace)

ACE Framework uses the **AgentSkills.io** standard, which means you can install external, executable skills directly from the community. 

**Option 1: Using the ACE CLI (Recommended)**
You can easily import any skill from a GitHub repository directly into your project using the ACE CLI:

```bash
npx ace-framework add-skill anthropics/skills/skills/pdf
```
This command will:
1. Download the skill folder into `.ace/skills/pdf`
2. Automatically register it in your `.aceconfig` under `skill_triggers`

**Option 2: Using Claude Code Native Plugins**
If you are using Claude Code, you can instantly add document parsing capabilities natively:

```bash
/plugin marketplace add anthropics/skills
/plugin install document-skills@anthropic-agent-skills
```
*After installation, you can ask the agent to "Use the PDF skill to extract requirements from docs/inputs/spec.pdf".*

### Invoking a Skill

```markdown
"Apply the [skill-name] skill from .ace/skills/[skill-name]/SKILL.md
for this task. Follow the procedure and checklist."
```

**Example:**

```markdown
"Apply the database-operations skill for this schema migration.
Follow the pre-migration checklist and create a rollback plan."
```

### Skill Automatic Triggers

Some keywords automatically suggest skills:

- "database", "migration", "schema" → `database-operations/SKILL.md`
- "api", "endpoint", "REST" → `api-design/SKILL.md`
- "test", "coverage" → `testing-strategy/SKILL.md`
- "bug", "issue", "incident" → `root-cause-analysis/SKILL.md`
- "transcript", "meeting", "interview" → `transcript-analysis/SKILL.md`
- "refactor", "clean up" → `refactoring/SKILL.md`
- "pipeline", "etl" → `data-pipeline-design/SKILL.md`
- "prompt", "llm" → `prompt-engineering/SKILL.md`
- "model", "evaluation" → `model-evaluation/SKILL.md`
- "feature", "engineering" → `feature-engineering/SKILL.md`
- "security", "vulnerability", "audit" → `security-audit/SKILL.md`
- "performance", "optimize", "speed" → `performance-optimization/SKILL.md`
- "accessibility", "wcag", "a11y" → `accessibility-audit/SKILL.md`
- "ci", "cd", "pipeline", "deploy" → `ci-cd-pipeline/SKILL.md`
- "error", "exception", "logging" → `error-handling/SKILL.md`
- "documentation", "docs", "readme" → `documentation-generation/SKILL.md`
- "state", "redux", "context" → `state-management/SKILL.md`
- "agent", "autonomous", "tools" → `agent-design/SKILL.md`
- "a2a", "multi-agent", "handoff" → `a2a-communication/SKILL.md`
- "mcp", "protocol", "server" → `mcp-implementation/SKILL.md`

---

## 6. Managing Context

### The ACTIVE_CONTEXT.md File

This file is the "memory" between sessions. It contains:

- Current objective
- What's working/broken/blocked
- Next steps
- Active constraints

### Updating Context

**During work:**

```markdown
"Update ACTIVE_CONTEXT.md: Task 2 is complete, moving to Task 3."
```

**End of session:**

```markdown
"Update ACTIVE_CONTEXT.md with:

- Completed: [what was done]
- Next steps: [what to do next]
- Notes: [anything important to remember]"
```

### Reading Context

**At session start:**

```markdown
"Read ACTIVE_CONTEXT.md and summarize the current state."
```

**To check status:**

```markdown
"What is my current objective according to ACTIVE_CONTEXT.md?"
```

### Context Best Practices

1. **Update frequently** - Don't wait until session end
2. **Be specific** - "Implemented user validation" not "worked on user stuff"
3. **Include blockers** - If something is stuck, document why
4. **List next steps** - Future you will thank present you

---

## 7. Handling Issues

### When You Find a Bug

**Step 1: Document It**

```markdown
"I found an issue: [description]
Document the symptoms and how to reproduce."
```

**Step 2: Assess Severity**

| Severity | Criteria               | Response        |
| -------- | ---------------------- | --------------- |
| Critical | System down, data loss | Immediate fix   |
| High     | Major feature broken   | Fix today       |
| Medium   | Feature degraded       | Fix this sprint |
| Low      | Minor issue            | Backlog         |

**Step 3: For Medium+ Issues, Create RCA**

```markdown
"Switch to INCIDENT mode.
Apply root-cause-analysis skill to investigate this issue."
```

### The RCA Process

1. **Document** - Capture symptoms, evidence
2. **Analyze** - Use 5 Whys to find root cause
3. **Fix** - Immediate fix + permanent fix
4. **Prevent** - Add tests, guards, update standards
5. **Verify** - Confirm fix and prevention work

### Creating a Regression Guard

After fixing an issue:

```markdown
"Create a regression guard for this fix.
Add to docs/rca/regression-guards.yaml with:

- Guarded files
- Invariants that must be maintained
- Tests that verify the fix"
```

### Checking Guards Before Modifying Files

**Always before editing:**

```markdown
"Check if [filename] has a regression guard.
If so, what invariants must be maintained?"
```

---

## 8. Code Review Process

### Requesting a Review

```markdown
"Apply the code-review skill to review this code.
Check against:

- .ace/standards/coding.md
- .ace/standards/security.md
- Regression guards for modified files"
```

### Review Checklist

The AI will check:

- [ ] Code standards compliance
- [ ] Security requirements
- [ ] Architecture patterns
- [ ] Test coverage
- [ ] Regression guard compliance
- [ ] Documentation

### Responding to Feedback

Feedback comes in types:

- **[BLOCKING]** - Must fix before merge
- **[SUGGESTION]** - Consider improving
- **[QUESTION]** - Needs clarification
- **[NIT]** - Minor style preference

---

## 9. Common Scenarios

### Scenario: "I don't know where to start"

```markdown
"I need to [goal]. I'm not sure where to begin.
Read the codebase and suggest an approach."
```

### Scenario: "The previous developer left no documentation"

```markdown
"Read the code in [directory] and create documentation:

1. What does this code do?
2. How does it fit into the system?
3. What are the key functions/classes?"
```

### Scenario: "I need to understand an existing decision"

```markdown
"Read all ADRs in docs/adr/ and explain why we use [technology/pattern]."
```

### Scenario: "Something broke after a change"

```markdown
"Something broke after my changes to [file].
Check regression guards and identify what invariant I may have violated."
```

### Scenario: "I need to add a feature like an existing one"

```markdown
"I need to add [new feature] similar to [existing feature].
Show me the existing implementation and create a plan for the new one."
```

### Scenario: "The AI is suggesting something that conflicts with our patterns"

```markdown
"Check docs/adr/ and docs/context/system_patterns.md.
Does your suggestion align with our established patterns?"
```

### Scenario: "I need to make an architectural decision"

```markdown
"Switch to Architect role.
I need to decide between [option A] and [option B].
Analyze trade-offs and create an ADR with the recommendation."
```

### Scenario: "I need to hand off work to a colleague"

```markdown
"Update ACTIVE_CONTEXT.md with a complete handoff summary:

- What was accomplished
- Current state of each component
- Pending decisions
- Known issues
- Recommended next steps"
```

---

## 10. Best Practices

### Do's

âœ… **Start every session by reading context**

```markdown
"Read .aceconfig and ACTIVE_CONTEXT.md before we begin."
```

âœ… **Use roles appropriately**

- Architect for planning
- Developer for coding
- QA for verification

âœ… **Check guards before modifying files**

```markdown
"Check regression guards for files I'm about to modify."
```

âœ… **Update context frequently**

- After completing tasks
- When encountering blockers
- At end of session

âœ… **Create ADRs for decisions**

```markdown
"Create an ADR for the decision to use [technology/pattern]."
```

âœ… **Follow BMAD**

- Analyze â†’ Plan â†’ Execute â†’ Verify
- Never skip phases

### Don'ts

âŒ **Don't skip planning**

- "Just write the code" leads to rework

âŒ **Don't ignore standards**

- Standards exist for good reasons

âŒ **Don't modify guarded files without checking**

- Guards prevent regressions

âŒ **Don't forget to update context**

- Future sessions depend on it

âŒ **Don't mix roles**

- Complete one role's work before switching

âŒ **Don't skip verification**

- Testing catches issues early

---

## 11. Troubleshooting

### Problem: AI doesn't follow project patterns

**Solution:**

```markdown
"Read docs/context/system_patterns.md and docs/adr/.
Follow the established patterns in this codebase."
```

### Problem: AI suggests conflicting approach

**Solution:**

```markdown
"Check if there's an ADR that addresses this.
If our approach differs, explain why based on project constraints."
```

### Problem: Lost context between sessions

**Solution:**

```markdown
"Read ACTIVE_CONTEXT.md and all files in docs/planning/.
Reconstruct what was happening and continue."
```

If ACTIVE_CONTEXT.md is outdated:

```markdown
"The context seems outdated. Read recent git commits and
reconstruct the current project state."
```

### Problem: AI generates code that violates standards

**Solution:**

```markdown
"Verify this code against .ace/standards/coding.md and
.ace/standards/security.md. Fix any violations."
```

### Problem: Regression after changes

**Solution:**

```markdown
"Check docs/rca/regression-guards.yaml for the affected file.
What invariant was violated? How do we fix it?"
```

### Problem: Unclear requirements

**Solution:**

```markdown
"The requirements are unclear. Before proceeding:

1. List what I understand
2. List what needs clarification
3. Suggest reasonable assumptions"
```

### Problem: Don't know which skill to use

**Solution:**

```markdown
"I need to [task description].
Which skill in .ace/skills/ would help with this?"
```

---

## 12. Quick Reference

### Session Commands

| Action         | Command                                            |
| -------------- | -------------------------------------------------- |
| Start session  | "Read .aceconfig, roles.md, and ACTIVE_CONTEXT.md" |
| Check status   | "What's the current state per ACTIVE_CONTEXT.md?"  |
| Update context | "Update ACTIVE_CONTEXT.md with [changes]"          |
| End session    | "Update ACTIVE_CONTEXT.md and summarize session"   |

### Role Commands

| Action             | Command                        |
| ------------------ | ------------------------------ |
| Switch role        | "Switch to [Role] role"        |
| Check current role | "What role am I currently in?" |
| List roles         | "What roles are available?"    |

### Mode Commands

| Action             | Command                    |
| ------------------ | -------------------------- |
| Enter planning     | "Set mode to PLANNING"     |
| Enter execution    | "Set mode to EXECUTION"    |
| Enter verification | "Set mode to VERIFICATION" |
| Enter incident     | "Set mode to INCIDENT"     |

### Skill Commands

| Action      | Command                                      |
| ----------- | -------------------------------------------- |
| Apply skill | "Apply [skill-name] skill"                   |
| List skills | "What skills are available in .ace/skills/?" |

### Guard Commands

| Action          | Command                                |
| --------------- | -------------------------------------- |
| Check guards    | "Check regression guards for [file]"   |
| List all guards | "Show all regression guards"           |
| Create guard    | "Create regression guard for this fix" |

### ADR Commands

| Action     | Command                                 |
| ---------- | --------------------------------------- |
| Create ADR | "Create ADR for [decision]"             |
| List ADRs  | "List all ADRs"                         |
| Check ADRs | "Check if there's an ADR about [topic]" |

### Standard Commands

| Action            | Command                                  |
| ----------------- | ---------------------------------------- |
| Check standards   | "Verify against .ace/standards/"         |
| Specific standard | "Check against .ace/standards/[name].md" |

---

## Appendix: File Locations

| Need                | Location                               |
| ------------------- | -------------------------------------- |
| Project rules       | `.aceconfig`                           |
| Role definitions    | `.ace/roles/roles.md`                  |
| Coding standards    | `.ace/standards/coding.md`             |
| Security rules      | `.ace/standards/security.md`           |
| Current context     | `docs/context/ACTIVE_CONTEXT.md`       |
| System patterns     | `docs/context/system_patterns.md`      |
| Implementation plan | `docs/planning/implementation_plan.md` |
| ADR template        | `docs/adr/ADR-000-template.md`         |
| RCA template        | `docs/rca/RCA-000-template.md`         |
| Regression guards   | `docs/rca/regression-guards.yaml`      |
| Skills              | `.ace/skills/*/SKILL.md`                     |

---

## Getting Help

- **Full specification:** `ACE-SPEC.md`
- **Quick start:** `README.md`
- **Skills Guide:** `SKILLS_GUIDE.md`
- **Role details:** `.ace/roles/roles.md`
- **Runbooks:** `docs/runbooks/`

---

_ACE-Framework User Guide v2.3_
_Treat AI interactions as structured transactions, not casual conversations._

