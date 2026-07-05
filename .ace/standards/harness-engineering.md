# Harness Engineering Standard

**Status**: Active
**Version**: 2.7.0
**Philosophy**: The AI is not just a chatbot; the repository itself is the "harness" that controls, validates, and empowers the AI.

---

## 1. Context Flushing (The Clean Slate Protocol)

Long-running LLM sessions suffer from context degradation, where the model forgets instructions, loses track of invariants, and halluciantes.

**Standard:**
- Never use a single, continuously running LLM conversation for an entire project lifecycle.
- When shifting phases (e.g., from `PLANNING` to `EXECUTION`) or when an agent changes roles, **flush the context** by starting a new, empty chat session.
- Only load the minimal necessary files required for the specific atomic task.

## 2. File-Based State Tracking

To support context flushing, agents must not rely on conversation history to remember what needs to be done next.

**Standard:**
- All work must be broken down into atomic units and stored externally, typically in `docs/progress/tasks.json`.
- Agents read the state from the file system, mark tasks as `in_progress`, perform the implementation, and update the status to `done` upon successful verification.
- Agents must dump explicit progress logs into `docs/progress/task_[ID]_result.md` to pass memory to the next agent in the pipeline without passing the entire conversation thread.

## 3. Strict Orchestration (Leader & Subagents)

Monolithic agents given overly broad tasks perform poorly. Complex tasks must be delegated.

**Standard:**
- **The Architect (Leader)** creates the `tasks.json` queue and sets the architecture. They do not write production code.
- **The Generator (Developer Subagent)** is spun up specifically to pick up a single task from `tasks.json`, execute it, and produce an action trace. Once verified, their session is terminated.
- **The Reflector (QA/Incident Subagent)** analyzes feedback from the Generator (success/failure) to distill raw execution traces into *generalizable natural language lessons*.
- **The Curator (Gatekeeper)** takes the distilled lessons and safely integrates them into the evolving playbook (standards/prompts) using incremental, deterministic updates to control redundancy.

## 4. Pre-Flight & Post-Flight Validation

An AI's assertion that "the code works" is insufficient. The harness must prove it mathematically or programmatically.

**Standard:**
- Before any implementation begins, agents must run the validation script (`.ace/scripts/verify.sh`) to guarantee a stable starting state.
- Before marking a task as `done`, the agent must run `verify.sh` again. If the script fails, the task fails.
- The `verify.sh` script acts as the absolute source of truth for code health.

## 5. Self-Improving Harness

The `.ace/` directory and its contents are just code, which means the AI can improve its own operating system.

**Standard:**
- If the Generator identifies a recurring failure pattern, the Reflector must first distill the failure into a generalizable rule.
- To prevent **Context Collapse** and **Brevity Bias**, the Curator is **strictly forbidden** from rewriting entire prompt or standard files. 
- Updates to the harness must be applied using a deterministic append operation (e.g., executing `.ace/scripts/update_harness.sh`) which safely concatenates the new rule to the bottom of the target file.
- The Curator is responsible for managing redundancy by categorizing insights, ensuring the framework evolves dynamically and permanently via cumulative learning.

### 5.1 Distilled Rule Lifecycle (v2.7, ADR-003)

Lessons no longer accumulate unboundedly. Every distilled rule moves through
an explicit lifecycle: **staged → promoted | expired**.

- **Staged**: Reflector lessons land in `.ace/standards/distilled-staging.md`
  with provenance (source task, failure fingerprint, trace) and a hit count.
  Equivalent lessons deduplicate by identity — a re-occurrence increments
  `hit_count` instead of appending a duplicate.
- **Promoted**: a rule enters a real standard only via
  `ace-framework curate promote <RULE-id> --to <standard.md>` (or
  `update_harness.sh --from-staging`). Promotion is append-only in the
  established Distilled Rule format, carries provenance, and is
  human-confirmed by default. Eligibility threshold: `hit_count >= 2`.
  Auto-promotion (`--auto`) is opt-in and always refuses the reserved
  categories Security, Data-Loss, and Compliance.
- **Expired**: staged rules that do not re-fire within 30 days move to
  `.ace/standards/distilled-archive.md` (append-only; nothing is deleted).
  Promoted rules never expire automatically — removing one from a standard
  requires an ADR like any standards change.

This closes the outer loop with evidence: a rule earns permanence by
preventing repeat failures, not by existing.
