# Implementation Plan: v2.7 — The Loop Engineering Update

> **Status:** Approved
> **Created:** 2026-07-04
> **Author:** Role: Architect
> **PRD Reference:** N/A (framework release; motivating analysis in this document's Overview)

---

## Overview

v2.6 introduced the theory of a self-improving harness: the Generator/Reflector/Curator
triad, context flushing, file-based state, and anti-collapse appends. v2.7 makes that
loop *executable*. Today, nothing enforces the cycle: `verify.sh` is a placeholder that
always exits 0, hooks are "simulated" by the model reciting checklists, the mandated
`docs/progress/tasks.json` has no schema or tooling, and no orchestrator drives the
triad. The playbook also grows append-only with no rule lifecycle, recreating the
context bloat the update was meant to solve.

v2.7 delivers three nested, *bounded* loops:

1. **Inner loop (task convergence):** generate → verify → retry, gated by a real
   `verify.sh` and capped by retry budgets and stall detection.
2. **Middle loop (queue driver):** an `ace loop` CLI command that pops tasks from
   `tasks.json`, spawns a fresh agent session per attempt (mechanical context
   flushing), and updates state atomically.
3. **Outer loop (playbook evolution):** automatic Reflector invocation on failure,
   Curator rule staging with hit-counters, and promotion/expiry — closing the
   learning loop with evidence.

Design constraint: the orchestrator stays a *thin state machine* over `tasks.json`
with a pluggable runner interface. The intelligence remains in the `.ace/` playbook;
ACE governs agent harnesses, it does not become one.

---

## Prerequisites

- [ ] v2.6.2 analysis reviewed (gaps: placeholder verify, simulated hooks, missing progress tooling, unbounded appends)
- [ ] `.ace/schemas/tasks.schema.json` draft reviewed (ships alongside this plan; validated against `docs/progress/tasks.example.json` with ajv strict mode, JSON Schema draft 2020-12)
- [ ] ADR required: runner adapter interface (see Open Items)
- [ ] Node.js ≥ 18 remains the only hard CLI dependency
- [ ] Plan approved by stakeholder

---

## Milestones

| Milestone | Tasks | Theme |
| --------- | ----- | ----- |
| M1: The Honest Gate | T001–T003 | Real verification; schema-validated state; bounded retries |
| M2: The Loop Runner | T004–T006 | `ace loop` orchestrator; runner adapters; enforced hooks |
| M3: The Learning Loop | T007–T009 | Reflector automation; Curator rule lifecycle; telemetry |
| M4: Release | T010 | Docs, spec, validation, version sync |

---

## Tasks

<task id="T001">
  <name>Task queue schema and progress directory</name>
  <objective>docs/progress/ exists as a first-class framework directory with a machine-validatable state file format. The schema drafted with this plan is finalized and registered.</objective>
  <files>
    <create>docs/progress/README.md</create>
    <modify>.ace/schemas/tasks.schema.json (finalize draft)</modify>
    <modify>.ace/schemas/validation.md (add Task Queue section referencing the JSON Schema as source of truth)</modify>
    <modify>scripts/validate.sh, cli/bin/create-ace-framework.js, scripts/init.sh (scaffold docs/progress/, ship schema + example)</modify>
  </files>
  <tests>
    <test>tasks.example.json validates against tasks.schema.json (ajv strict, draft 2020-12)</test>
    <test>Negative fixtures rejected: blocked without blocked_reason; verified without result_file; in_progress with attempts=0</test>
    <test>Scaffolded project contains docs/progress/ with README and example</test>
  </tests>
  <acceptance_criteria>
    <criterion>Schema documents all loop invariants not expressible in JSON Schema (single in_progress, dependency gating, attempt ceiling, stall rule, no cycles)</criterion>
    <criterion>validate.sh fails if tasks.json exists but does not validate</criterion>
  </acceptance_criteria>
  <complexity>S</complexity>
  <dependencies>None</dependencies>
</task>

<task id="T002">
  <name>Make verify.sh real</name>
  <objective>verify.sh executes actual project commands and exits non-zero on failure, becoming the honest gate every loop depends on. Placeholder echoes removed.</objective>
  <files>
    <modify>.ace/scripts/verify.sh</modify>
    <modify>.aceconfig (new `verify:` block: test_cmd, lint_cmd, typecheck_cmd — flat keys, greppable from bash without a YAML parser)</modify>
  </files>
  <tests>
    <test>verify.sh exits 0 when all configured commands pass</test>
    <test>verify.sh exits non-zero when any configured command fails, printing which gate failed and its output tail</test>
    <test>verify.sh exits non-zero with a clear message when `verify:` block is missing or empty (unconfigured gate must not silently pass)</test>
  </tests>
  <acceptance_criteria>
    <criterion>No code path prints "passed (placeholder)"</criterion>
    <criterion>verify.sh output ends with a single machine-parseable line: VERIFY_RESULT=pass|fail gate=&lt;name&gt;</criterion>
  </acceptance_criteria>
  <complexity>S</complexity>
  <dependencies>None</dependencies>
</task>

<task id="T003">
  <name>Loop guards: retry budgets, stall detection, escalation</name>
  <objective>A reusable guard module (cli/lib/loop-guards.js) decides after every attempt: retry, or transition to blocked. Bounded iteration is enforced by code, not convention.</objective>
  <files>
    <create>cli/lib/loop-guards.js</create>
    <create>cli/test/loop-guards.test.js</create>
  </files>
  <tests>
    <test>attempts == max_attempts (task-level, else defaults) → blocked with budget-exhausted reason</test>
    <test>Two consecutive identical failure fingerprints → blocked with stall reason, even with budget remaining</test>
    <test>Distinct fingerprints under budget → retry permitted</test>
    <test>Fingerprint function is deterministic and path/timestamp-invariant for the same logical failure</test>
  </tests>
  <acceptance_criteria>
    <criterion>Guard decisions are pure functions of task state (no I/O), unit-testable in isolation</criterion>
    <criterion>Every blocked transition writes a human-actionable blocked_reason</criterion>
  </acceptance_criteria>
  <complexity>M</complexity>
  <dependencies>T001</dependencies>
</task>

<task id="T004">
  <name>The `ace loop` orchestrator</name>
  <objective>`create-ace-framework loop` (alias: `ace loop`) drives the middle loop: validate tasks.json against the schema, pick the next eligible task, mark in_progress, spawn a fresh runner session with a minimal assembled prompt, run the verify gate, record the outcome via loop-guards, write the result file, repeat until the queue is done or a task blocks.</objective>
  <files>
    <create>cli/lib/loop.js</create>
    <create>cli/lib/prompt-assembler.js (role + objective + acceptance criteria + relevant standards/guards only — Tier 1/2 loading, never the whole repo)</create>
    <create>cli/test/loop.test.js (mock runner)</create>
    <modify>cli/bin/create-ace-framework.js (subcommand routing)</modify>
  </files>
  <tests>
    <test>Happy path: two-task queue with dependency completes in order; both verified; result files written</test>
    <test>Failure path: verify fails → failure entry appended with fingerprint and trace_ref; retry spawns a NEW runner session (no state carryover)</test>
    <test>Blocked path: guard says blocked → loop halts, exits non-zero, prints escalation summary</test>
    <test>Crash safety: tasks.json updated via write-temp-then-rename; a killed loop leaves a valid file; restart resumes from in_progress task</test>
    <test>Queue with unmet dependencies only → clean exit reporting nothing eligible</test>
  </tests>
  <acceptance_criteria>
    <criterion>At most one task in_progress at any time; state transitions atomic</criterion>
    <criterion>Every state change also updates the `updated` timestamp and appends one line to the telemetry log (see T009)</criterion>
    <criterion>Loop never modifies files outside docs/progress/, tasks.json, and telemetry — implementation work belongs to the spawned agent</criterion>
  </acceptance_criteria>
  <complexity>L</complexity>
  <dependencies>T001, T002, T003</dependencies>
</task>

<task id="T005">
  <name>Runner adapters: claude-code and manual</name>
  <objective>A pluggable runner interface (run(prompt, opts) → {output, exitCode, traceRef}) with two implementations: `claude-code` invoking headless `claude -p` per attempt, and `manual` printing the assembled prompt and waiting for the human to run the session and press enter — preserving IDE-agnosticism.</objective>
  <files>
    <create>cli/lib/runners/index.js (interface + registry)</create>
    <create>cli/lib/runners/claude-code.js</create>
    <create>cli/lib/runners/manual.js</create>
    <create>cli/test/runners.test.js</create>
  </files>
  <tests>
    <test>Registry resolves runner by name from defaults.runner; unknown name → clear error listing available runners</test>
    <test>claude-code adapter builds correct CLI invocation (headless, task-scoped) and captures the trace to docs/progress/task_[ID]_attempt[N]_trace.md</test>
    <test>manual adapter round-trips: prints prompt, waits, then proceeds to verify gate</test>
  </tests>
  <acceptance_criteria>
    <criterion>Adding a new runner requires only a new file in cli/lib/runners/ — zero changes to loop.js</criterion>
    <criterion>claude-code adapter degrades gracefully (actionable error) when the CLI binary is absent</criterion>
  </acceptance_criteria>
  <complexity>M</complexity>
  <dependencies>T004</dependencies>
</task>

<task id="T006">
  <name>Enforced hooks adapter for Claude Code</name>
  <objective>Replace "AI agents should simulate hooks" with real enforcement where the platform supports it: a shipped .claude/settings.json template wiring PreToolUse (block edits to files guarded in regression-guards.yaml without acknowledgment) and Stop (run verify.sh) hooks. hooks.md repositioned: enforced adapters first, simulation as fallback for platforms without hook support.</objective>
  <files>
    <create>.ace/adapters/claude-code/settings-template.json</create>
    <create>.ace/adapters/claude-code/guard-check.sh (PreToolUse: match tool file path against regression-guards.yaml)</create>
    <modify>.ace/workflows/hooks.md</modify>
    <modify>cli/bin/create-ace-framework.js (--adapter claude-code flag installs the template)</modify>
  </files>
  <tests>
    <test>guard-check.sh exits blocking status for a guarded path, 0 for unguarded</test>
    <test>Scaffold with --adapter claude-code produces valid settings.json (hooks schema)</test>
    <test>Stop hook invokes verify.sh and surfaces failure</test>
  </tests>
  <acceptance_criteria>
    <criterion>Hook scripts are POSIX sh, no dependencies beyond grep/sed</criterion>
    <criterion>hooks.md explicitly labels which hooks are enforced vs. simulated per platform</criterion>
  </acceptance_criteria>
  <complexity>M</complexity>
  <dependencies>T002</dependencies>
</task>

<task id="T007">
  <name>Automatic Reflector invocation</name>
  <objective>When an attempt fails (and on final verification of a previously-failed task), the loop spawns a Reflector session with the failure trace(s) and the golden prompt, producing a distilled lesson written to the Curator staging file — the outer loop's input, generated without human hand-cranking.</objective>
  <files>
    <create>.ace/prompts/reflect-on-trace.md (golden prompt: trace in, generalizable lesson out, strict output format)</create>
    <modify>cli/lib/loop.js (reflect step after failure recording)</modify>
    <create>cli/test/reflector.test.js (mock runner returning canned lesson)</create>
  </files>
  <tests>
    <test>Failed attempt → Reflector invoked with trace_ref content; well-formed lesson appended to staging</test>
    <test>Malformed Reflector output → rejected and logged, staging file untouched (no garbage ingestion)</test>
    <test>--no-reflect flag skips the step</test>
  </tests>
  <acceptance_criteria>
    <criterion>Lessons carry provenance: task id, fingerprint, date, source trace</criterion>
    <criterion>Reflector runs in its own flushed session via the same runner interface</criterion>
  </acceptance_criteria>
  <complexity>M</complexity>
  <dependencies>T004, T005</dependencies>
</task>

<task id="T008">
  <name>Curator rule lifecycle: staging, promotion, expiry</name>
  <objective>Distilled rules stop accumulating unboundedly. Lessons land in .ace/standards/distilled-staging.md with metadata (category, provenance, hit count). `ace curate` reports staged rules; promotion into a real standard still uses append-only update_harness.sh (anti-collapse preserved); rules that never re-fire within a configurable window are expired to an archive.</objective>
  <files>
    <create>cli/lib/curator.js</create>
    <create>.ace/standards/distilled-staging.md (structured template)</create>
    <modify>.ace/scripts/update_harness.sh (accept --from-staging <rule-id>; stamp provenance)</modify>
    <modify>.ace/standards/harness-engineering.md (section 5 extended with the lifecycle: staged → promoted | expired)</modify>
    <create>cli/test/curator.test.js</create>
  </files>
  <tests>
    <test>New lesson matching an existing staged rule's fingerprint category increments hit count instead of duplicating</test>
    <test>Promotion appends to the target standard via update_harness.sh and marks the staged rule promoted (never deletes from a standard)</test>
    <test>Expiry moves rules to .ace/standards/distilled-archive.md; standards files themselves are never rewritten</test>
  </tests>
  <acceptance_criteria>
    <criterion>Promotion requires explicit human confirmation by default (white-box auditing preserved); --auto-promote threshold opt-in</criterion>
    <criterion>Staging file remains valid markdown, reviewable by domain experts</criterion>
  </acceptance_criteria>
  <complexity>L</complexity>
  <dependencies>T007</dependencies>
</task>

<task id="T009">
  <name>Loop telemetry</name>
  <objective>Every loop iteration appends one JSON line to .ace/feedback/loop-metrics.jsonl (task id, attempt, outcome, gate, fingerprint, duration, rule ids in prompt context). `ace loop --report` summarizes: first-pass rate, attempts per task, blocked count, repeat-failure rate before/after each promoted rule — the evidence that the harness actually self-improves.</objective>
  <files>
    <create>cli/lib/telemetry.js</create>
    <create>cli/test/telemetry.test.js</create>
    <modify>cli/lib/loop.js (emit events)</modify>
  </files>
  <tests>
    <test>Each attempt emits exactly one valid JSON line; file is append-only</test>
    <test>--report on a fixture log computes first-pass rate and per-task attempt counts correctly</test>
    <test>Telemetry write failure warns but never aborts the loop</test>
  </tests>
  <acceptance_criteria>
    <criterion>JSONL format documented in docs/progress/README.md</criterion>
    <criterion>No payload contents (code, prompts) in telemetry — metadata only</criterion>
  </acceptance_criteria>
  <complexity>S</complexity>
  <dependencies>T004</dependencies>
</task>

<task id="T010">
  <name>Release: spec, docs, validation, version sync</name>
  <objective>All framework surfaces reflect v2.7 in one release commit set — avoiding a repeat of the v2.6.x version drift (CHANGELOG v2.6.2 note).</objective>
  <files>
    <modify>ACE-SPEC.md (new section: Loop Engineering — three nested loops, guards, runner interface; directory blueprint gains docs/progress/ and .ace/adapters/)</modify>
    <modify>README.md, USER_GUIDE.md (ace loop walkthrough), CHANGELOG.md</modify>
    <modify>.aceconfig, cli/package.json (2.7.0 together)</modify>
    <modify>scripts/validate.sh (check schema, adapters, staging file presence)</modify>
  </files>
  <tests>
    <test>validate.sh passes on the repo</test>
    <test>Scaffold smoke test: npx create-ace-framework tmp && cd tmp && ace loop --dry-run exits 0</test>
    <test>grep confirms no surface still reports 2.6.x</test>
  </tests>
  <acceptance_criteria>
    <criterion>Version identical in .aceconfig, cli/package.json, ACE-SPEC.md, README.md</criterion>
    <criterion>ACE-SPEC.md marks Reflector/Curator automation (T007–T008) as Experimental for this release</criterion>
  </acceptance_criteria>
  <complexity>M</complexity>
  <dependencies>T001, T002, T003, T004, T005, T006, T007, T008, T009</dependencies>
</task>

---

## Verification Plan

After all tasks complete:

- [ ] Full CLI test suite passes (loop, guards, runners, curator, telemetry)
- [ ] End-to-end dogfood: run `ace loop` with the manual runner on a 3-task queue in a scaffolded sample project; observe verified, failed→retry, and blocked paths
- [ ] verify.sh proven to fail: introduce a deliberate test failure, confirm loop records failure and refuses to mark verified
- [ ] Stall drill: force the same failure twice, confirm blocked transition with actionable reason
- [ ] scripts/validate.sh passes; markdownlint passes
- [ ] ACTIVE_CONTEXT.md updated
- [ ] CHANGELOG v2.7.0 entry complete

---

## Risks

| Risk | Likelihood | Impact | Mitigation |
| ---- | ---------- | ------ | ---------- |
| Orchestrator scope creep toward a full agent runtime | M | H | Thin-state-machine constraint in ADR; loop.js may not contain prompt intelligence beyond the assembler; runner interface is the hard boundary |
| `claude -p` CLI flags change across Claude Code versions | M | M | Version check in adapter with actionable error; manual runner is the always-works fallback |
| Auto-reflected lessons pollute the playbook with noise | M | H | Staging + hit counts + human-confirmed promotion by default (T008); strict Reflector output format rejected on mismatch (T007) |
| Real verify.sh breaks adopters whose projects lack test commands | H | M | Explicit-failure-with-guidance on missing `verify:` block; migration note in CHANGELOG and USER_GUIDE |
| Bash-parsing YAML for verify config is fragile | M | M | Constrain `verify:` block to flat `key: "value"` lines; document the constraint in .aceconfig comments; validate in validate.sh |
| Windows contributors: .sh scripts assume a POSIX shell | M | L | Document Git Bash/WSL requirement; keep all loop logic in Node, shell scripts limited to gates and hooks |

---

## Open Items

- [ ] **ADR-XXX (required before T005): Runner adapter interface.** Contract, error semantics, and whether the orchestrator or the adapter owns trace capture.
- [ ] **ADR-XXX (required before T008): Rule promotion policy.** Default hit-count threshold, expiry window, and whether auto-promotion is ever allowed for `critical`-severity categories.
- [ ] Decide `ace loop` concurrency stance for v2.7: single-task-at-a-time only (recommended — parallel Generators reopen the lock-awareness problem in ACE-SPEC §10; defer to v2.8).
- [ ] Should telemetry ship opt-in or opt-out? (Local-only JSONL, so opt-out proposed.)

---

## Approval

| Role        | Name | Date | Status |
| ----------- | ---- | ---- | ------ |
| Architect   | Claude (Fable 5) | 2026-07-04 | Drafted |
| Stakeholder | jonnabio | 2026-07-04 | Approved |

---

_Implementation Plan — ACE-Framework v2.7 (Approved 2026-07-04)_
