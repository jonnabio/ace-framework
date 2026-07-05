# docs/progress/ — File-Based Task State

This directory is the working memory of the ACE loop (Harness Engineering
Standard, `.ace/standards/harness-engineering.md` §2). Agents read state from
here instead of relying on conversation history, which is what makes context
flushing between sessions safe.

## Files

| File | Written by | Purpose |
| ---- | ---------- | ------- |
| `tasks.json` | Architect (created), orchestrator (updated) | The task queue and state machine. Single source of truth for work state. |
| `task_<ID>_result.md` | Generator | Progress log written when a task completes — the memory handed to the next agent. |
| `task_<ID>_attempt<N>_trace.md` | Orchestrator/runner | Full execution + verify trace for a failed attempt; input to the Reflector. |
| `tasks.example.json` | Framework | Reference queue demonstrating the format, including a blocked (stalled) task. |

## tasks.json

- **Schema (source of truth):** `.ace/schemas/tasks.schema.json` (JSON Schema draft 2020-12)
- **Validator:** `node cli/lib/validate-tasks.js docs/progress/tasks.json` — zero dependencies; also enforces the cross-field loop invariants below. Run automatically by `scripts/validate.sh`.

### Task states

`pending → in_progress → verified` is the happy path. A failed verify gate
moves the task to `failed` (retry budget remaining) or `blocked` (budget
exhausted, or stall detected). `skipped` marks tasks descoped by the Architect.

### Loop invariants

1. At most one task is `in_progress` at any time.
2. A task is eligible only when every id in `depends_on` is `verified`; no
   self- or cyclic dependencies.
3. `attempts` never exceeds `max_attempts` (task-level, else
   `defaults.max_attempts`). When the budget is exhausted — or the same
   failure `fingerprint` occurs twice consecutively — the orchestrator
   transitions the task to `blocked` with a human-actionable
   `blocked_reason` and halts.

## Telemetry

Loop telemetry lands in `.ace/feedback/loop-metrics.jsonl` (one JSON line per
attempt). The format is defined in v2.7 task T009 and documented here once it
ships.
