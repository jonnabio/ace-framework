# Harness Engineering Standard

**Status**: Active
**Version**: 2.6.1
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
- **The Developer (Subagent)** is spun up specifically to pick up a single task from `tasks.json`. Once the task is completed and verified, the Developer's session is terminated.
- **The QA Engineer / Reviewer (Subagent)** acts as an independent verifier. 
- **The Reflector (Distillation)** is a mandatory step when failures occur. Before attempting a fix, the agent must distill the raw failure into a *generalizable natural language lesson* rather than a hyper-specific code patch.

## 4. Pre-Flight & Post-Flight Validation

An AI's assertion that "the code works" is insufficient. The harness must prove it mathematically or programmatically.

**Standard:**
- Before any implementation begins, agents must run the validation script (`.ace/scripts/verify.sh`) to guarantee a stable starting state.
- Before marking a task as `done`, the agent must run `verify.sh` again. If the script fails, the task fails.
- The `verify.sh` script acts as the absolute source of truth for code health.

## 5. Self-Improving Harness

The `.ace/` directory and its contents are just code, which means the AI can improve its own operating system.

**Standard:**
- If an agent identifies a recurring failure pattern, it must first distill the failure into a generalizable rule (Reflector step).
- To prevent **Context Collapse** and **Brevity Bias**, agents are **strictly forbidden** from rewriting entire prompt or standard files. 
- Updates to the harness must be applied using a deterministic append operation (e.g., executing `.ace/scripts/update_harness.sh`) which safely concatenates the new rule to the bottom of the target file.
- The framework evolves dynamically and permanently via cumulative learning, without losing previously distilled domain knowledge.
