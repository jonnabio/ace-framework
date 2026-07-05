# ADR-002: Runner Adapter Interface for the ACE Loop

## Status

Accepted

## Date

2026-07-05

## Context

v2.7's `ace-framework loop` orchestrator must spawn a fresh agent session per
task attempt (mechanical context flushing, Harness Engineering Standard §1)
while remaining IDE-agnostic — ACE governs agent harnesses, it does not become
one. The orchestrator therefore cannot hard-code any particular agent CLI.
We need a boundary that:

- keeps `loop.js` a thin state machine over `tasks.json`;
- lets any agent tool (Claude Code today, others later) execute a task;
- always preserves a human-driven path so no proprietary tool is required;
- defines who captures execution traces, since traces feed the Reflector.

## Decision

A **runner adapter** is a Node module in `cli/lib/runners/` exporting:

```js
module.exports = {
  name: 'claude-code',           // registry key, matches defaults.runner
  isAvailable() -> { ok: boolean, reason?: string },
  async run(request) -> RunResult,
};
```

**RunRequest** (built by the orchestrator):

```js
{
  prompt: string,      // fully assembled, self-contained task prompt
  taskId: 'T001',
  attempt: 2,          // 1-based
  cwd: string,         // project root the agent works in
  traceFile: string,   // absolute path the runner MUST write the session trace to
}
```

**RunResult**:

```js
{
  ok: boolean,         // false only for RUNNER failures (spawn error, tool missing)
  output: string,      // agent-visible output (may be empty for manual runner)
}
```

Contract rules:

1. **Verification is not the runner's job.** `ok: false` means the runner
   itself failed to execute a session. Whether the *task* succeeded is decided
   solely by the verify gate that the orchestrator runs afterwards. Runners
   never run `verify.sh`.
2. **Trace capture is the runner's job.** The orchestrator allocates the
   trace path (`docs/progress/task_<ID>_attempt<N>_trace.md`); the runner
   writes whatever record of the session it can produce (full transcript for
   headless tools, a note for manual sessions). A missing trace file after
   `run()` is a runner bug; the orchestrator writes a stub and warns.
3. **Errors are values.** Runners must not throw for anticipated failures
   (binary missing, non-zero agent exit); they return `ok: false` with a
   human-actionable `output`. The orchestrator treats a runner failure as an
   infrastructure halt (exit non-zero), NOT as a task failure — it must not
   burn the task's retry budget.
4. **Statelessness.** Each `run()` call is an independent session. Runners
   must not carry state between calls; that would silently defeat context
   flushing.
5. **Registration is file-drop.** `cli/lib/runners/index.js` discovers
   adapters in its own directory. Adding a runner requires zero changes to
   `loop.js`.

Two adapters ship in v2.7: `claude-code` (headless `claude -p`) and `manual`
(prints the prompt, human runs the session in any tool, presses Enter when
done).

## Alternatives Considered

- **Shell-command runner configured in `.aceconfig`** (e.g.
  `runner_cmd: "claude -p {prompt}"`): simplest, but prompt escaping across
  shells/OSes is fragile, and there is nowhere to put availability checks or
  trace handling. Rejected.
- **Runner owns verification too** (returns pass/fail): rejected — it would
  let an agent tool assert its own success, exactly the "AI says it works"
  failure mode the honest gate exists to prevent.
- **Orchestrator captures traces by wrapping stdout**: rejected — headless
  tools expose richer transcripts than stdout (tool calls, thinking); only
  the adapter knows how to get them.
- **Plugin packages (npm) instead of file-drop**: overkill for a
  zero-dependency CLI; revisit if third-party runners appear.

## Consequences

### Positive

- `loop.js` stays testable with a trivial mock runner.
- New agent tools integrate without touching orchestrator logic.
- The manual runner guarantees the framework works with zero vendor lock-in.
- Runner failures cannot silently consume task retry budgets.

### Negative

- Two-hop indirection (loop → registry → adapter) for what is today one
  real integration.
- The trace-capture contract cannot be enforced at compile time; the
  orchestrator compensates with a stub-and-warn fallback.

### Neutral

- Adapter granularity is per-tool, not per-model; model selection is the
  adapter's concern (flags/env), not the interface's.

## Compliance

- `cli/test/runners.test.js` asserts every shipped adapter exports
  `name`, `isAvailable`, `run` with the documented shapes.
- `cli/test/loop.test.js` runs the orchestrator only against a mock runner,
  proving the boundary is sufficient.
- Code review: any PR adding runner-specific branches to `loop.js` violates
  this ADR.
