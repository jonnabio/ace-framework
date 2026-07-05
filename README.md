# ACE Framework v2.7.0

> **AI-assisted Code Engineering Framework**
> A rigorous, IDE-agnostic standard for professional development teams using AI agents. Treats AI interactions as structured transactions, not casual conversations.

## v2.7.0 Features: The Loop Engineering Update

v2.6 described a self-improving harness; v2.7 makes it executable — three nested, **bounded** loops with real gates:

- **The Honest Gate**: `verify.sh` now actually runs your configured test/lint/typecheck commands and exits non-zero on failure. An unconfigured gate fails too — silence never counts as passing. Output ends with machine-parseable `VERIFY_RESULT=pass|fail gate=<name>`.
- **The Task Queue**: `docs/progress/tasks.json` is schema-enforced (`.ace/schemas/tasks.schema.json`, JSON Schema 2020-12) with a zero-dependency validator that also checks loop invariants (single in-progress task, dependency cycles, attempt ceilings).
- **`ace-framework loop`**: the orchestrator picks eligible tasks, spawns a **fresh agent session per attempt** (mechanical context flushing) through pluggable runners — `claude-code` headless or `manual` (any tool, zero lock-in) — and gates every attempt on `verify.sh`.
- **Loop Guards**: retry budgets plus stall detection (identical failure fingerprint twice = halt). The loop escalates to a human with an actionable `blocked_reason` instead of burning budget on repeats.
- **Enforced Hooks**: `--adapter claude-code` installs real PreToolUse/Stop hooks (regression-guard blocking, verify-before-stop) — hooks are now gates, not recitations.
- **The Learning Loop** *(experimental)*: failed attempts auto-invoke a Reflector session whose distilled lessons land in a Curator staging file with provenance and hit counts; rules are promoted into standards only with evidence and human confirmation, and expire if they stop firing (ADR-003).
- **Telemetry**: every attempt logs one metadata-only JSONL line; `ace-framework loop --report` shows first-pass rate and repeat failure fingerprints — proof the harness improves.

```bash
npx create-ace-framework my-project --adapter claude-code
cd my-project
# Architect writes docs/progress/tasks.json from the approved plan, then:
npx ace-framework loop
npx ace-framework loop --report
npx ace-framework curate list
```

## v2.6.2 Features: The Agentic Context Engineering (ACE) Update

- **Context Flushing (Clean Slate)**: Strict protocols to start fresh LLM sessions between roles to prevent context degradation and hallucinations.
- **The Triad (Generator, Reflector, Curator)**: Formalized the ACE paper's modular cycle:
  1. **Generator**: Developer agent executes the task using explicit **ReAct** (Reason+Act) traces.
  2. **Reflector**: QA agent distills natural language lessons from dense ReAct feedback.
  3. **Curator**: Integrates insights into the evolving playbook to manage redundancy.
- **File-Based State Tracking**: Replaced conversational context with explicit, atomic task queues (`tasks.json`) and progress logs.
- **Anti-Collapse Appends**: To prevent "Brevity Bias," agents are forbidden from rewriting standard files, updating them deterministically via `update_harness.sh` instead.
- **White-Box Auditing**: Playbooks (`.ace/standards/`) can be manually reviewed and sanitized by human domain experts to ensure compliance without requiring ML fine-tuning.

## v2.5.0 Features: The Expansion Pack Update

- **Modular Expansion Packs**: Support for domain-specific skillsets via the new `includes` architecture in `.aceconfig`.
- **Scientific Pack (135+ Skills)**: Bundles PhD-level expertise in Bioinformatics, Chemistry, and Clinical Data with augmented roles like *Data Scientist* and *Scientific Editor*.
- **AI Research Pack (98+ Skills)**: Provides production-grade engineering instructions for the entire LLM lifecycle (vLLM, DeepSpeed, RLHF, Axolotl).
- **CLI v2.5.0**: Enhanced scaffolding with automated expansion pack installers (`--pack` flag).
- **AgentSkills Standard**: Fully migrated and validated skills in the universal AgentSkills.io folder format.

## Core Pillars

1.  **BMAD Cycle**: Analyze → Discuss → Plan → Execute → Verify.
2.  **Agentic Roles**: 7 specialized personas (Architect, Developer, QA, etc.).
3.  **Active Context**: Persistent session management via `ACTIVE_CONTEXT.md`.
4.  **Regression Guards**: Proactive protection against regressions.

## Getting Started

- [USER_GUIDE.md](USER_GUIDE.md) - For daily workflow and phase execution.
- [SKILLS_GUIDE.md](SKILLS_GUIDE.md) - For a deep dive into the 19 core skills and how to invoke them.
