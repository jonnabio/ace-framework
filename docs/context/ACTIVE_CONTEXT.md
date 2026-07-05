# Active Context: v2.7 Loop Engineering — M1 Complete

## Session Metadata

- **Last Updated:** 2026-07-05
- **Session ID:** v2.7-loop-engineering-m1
- **Active Role:** Developer
- **Mode:** EXECUTION

---

## Current Objective

Execute the approved v2.7 Loop Engineering implementation plan
(docs/planning/implementation_plan_v2.7_loop_engineering.md), turning the
v2.6 Triad theory into an executable, bounded loop.

---

## Current State

### Working

- **Branch**: `feature/v2.7-loop-engineering-m1` (branched from main after
  committing the pre-existing v2.6.2 version-sync WIP found in the tree).
- **T001 (done)**: `.ace/schemas/tasks.schema.json` (JSON Schema 2020-12) +
  `docs/progress/` (README, tasks.example.json) + zero-dependency validator
  `cli/lib/validate-tasks.js` enforcing schema and cross-field loop
  invariants; wired into `scripts/validate.sh`, CLI scaffold, and init.sh.
- **T002 (done)**: `.ace/scripts/verify.sh` is a real gate — runs commands
  from `.aceconfig`'s new `verify:` block, exits non-zero on failure,
  fails when unconfigured, emits `VERIFY_RESULT=pass|fail gate=<name>`.
- **T003 (done)**: `cli/lib/loop-guards.js` — pure retry/block decisions
  (budget exhaustion + consecutive-fingerprint stall detection) with
  normalized failure fingerprinting.
- **Tests**: 31 passing via `npm test` in cli/ (also the configured verify
  gate). `scripts/validate.sh` passes.

### In Progress

- None — M1 milestone complete.

### Blocked

- None.

---

## Completed This Session

- [x] Analyzed v2.6.2 gaps (placeholder verify, simulated hooks, missing progress tooling, unbounded appends).
- [x] Drafted and approved v2.7 Loop Engineering implementation plan (10 tasks, 4 milestones).
- [x] T001: task queue schema, progress directory, validator (16 tests).
- [x] T002: honest verification gate (pass/fail/unconfigured paths proven).
- [x] T003: loop guards — retry budgets, stall detection, fingerprinting (15 tests).
- [x] Fixed latent `((ERRORS++))`/`set -e` bug in scripts/validate.sh.
- [x] Committed pre-existing v2.6.2 version-sync WIP as its own commit on main.

---

## Next Steps

1. [ ] **ADR for the runner adapter interface** (required before T005; see plan Open Items).
2. [ ] **T004**: `ace loop` orchestrator — state machine over tasks.json (depends on T001–T003, all done).
3. [ ] **T005/T006**: runner adapters (claude-code, manual) + enforced Claude Code hooks adapter.

---

## Active Constraints

### Standards
- .ace/standards/harness-engineering.md (loop semantics; section 5 extended in T008)
- .ace/standards/coding.md

### Plan
- docs/planning/implementation_plan_v2.7_loop_engineering.md (Approved 2026-07-04)

### Guards
- docs/rca/regression-guards.yaml (no guarded files touched this session)

---

## Session Notes

- Loop invariants that JSON Schema cannot express (single in_progress,
  dependency gating/cycles, attempt ceiling) are enforced by
  `cli/lib/validate-tasks.js`, not just documented — the schema file remains
  the source-of-truth spec.
- `verify:` block in `.aceconfig` is constrained to flat `key: "value"`
  lines so bash can parse it without a YAML parser (plan risk mitigation).
- Loop-guard decisions are pure functions; T004's orchestrator owns all I/O.
- M4 (T010) must sync versions across `.aceconfig`, cli/package.json,
  ACE-SPEC.md, README.md in one commit set to avoid repeating v2.6.x drift.

---

## Context Links

- **Plan:** docs/planning/implementation_plan_v2.7_loop_engineering.md
- **Schema:** .ace/schemas/tasks.schema.json
- **Example queue:** docs/progress/tasks.example.json
