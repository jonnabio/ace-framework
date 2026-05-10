# ACE Framework v2.6.0

> **AI-assisted Code Engineering Framework**
> A rigorous, IDE-agnostic standard for professional development teams using AI agents. Treats AI interactions as structured transactions, not casual conversations.

## v2.6.0 Features: The Harness Engineering Update

- **Context Flushing (Clean Slate)**: Strict protocols to start fresh LLM sessions between roles to prevent context degradation and hallucinations.
- **File-Based State Tracking**: Replaced conversational context with explicit, atomic task queues (`tasks.json`) and progress logs to avoid the "broken telephone" problem.
- **Multi-Agent Orchestration**: Refined role boundaries separating the Architect (Planner) from isolated Developer (Implementer) and QA executions.
- **Pre/Post-Flight Validation**: Mandatory gatekeeping via `verify.sh` to programmatically prove code health before an agent starts working and before marking a task complete.
- **Self-Improving Harness**: Empowered QA/Reviewer roles to dynamically update prompts and standards to permanently eliminate friction.

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
