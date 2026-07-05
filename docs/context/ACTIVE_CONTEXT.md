# Active Context: v2.7.0 Loop Engineering — Release Complete

## Session Metadata

- **Last Updated:** 2026-07-05
- **Session ID:** v2.7-loop-engineering
- **Active Role:** QA Engineer
- **Mode:** VERIFICATION (complete)

---

## Current Objective

v2.7.0 "Loop Engineering" executed end to end: all 10 plan tasks (M1–M4),
both ADRs, all documentation, and all verification drills. Ready for push,
merge, tag, and npm publish.

---

## Current State

### Working

- **Branch**: `feature/v2.7-loop-engineering-m1` — one commit per task, all
  gated by the repo's own verify gate (cli test suite, 89 tests passing).
- **M1 Honest Gate**: tasks.json schema + validator, real verify.sh, loop guards.
- **M2 Loop Runner**: `ace-framework loop` orchestrator; claude-code + manual
  runners (ADR-002); enforced Claude Code hooks (`--adapter claude-code`).
- **M3 Learning Loop** *(experimental)*: auto-Reflector with strict output
  contract; Curator staged→promoted|expired lifecycle (ADR-003);
  `ace-framework curate`; JSONL telemetry + `loop --report`.
- **M4 Release**: ACE-SPEC §13, USER_GUIDE §13, README, CHANGELOG, CLAUDE.md,
  version 2.7.0 synced everywhere, validate.sh extended, .gitattributes
  eol=lf for .sh, walkthrough with drill evidence
  (docs/planning/v2.7.0_loop_engineering_walkthrough.md).

### In Progress

- None.

### Blocked

- None.

---

## Next Steps (human actions)

1. [ ] Review the branch; merge to main; tag `v2.7.0`.
2. [ ] Publish `create-ace-framework@2.7.0` to npm.
3. [ ] Post-push smoke test: `npx create-ace-framework tmp --adapter claude-code`
       then `ace-framework loop --dry-run` in it (scaffolder clones GitHub main,
       so this only works after the merge).

## v2.8 Candidates

- Parallel Generators (needs a lock protocol; deferred per plan Open Items).
- Live headless claude-code session in CI.
- Configurable promotion thresholds/expiry in `.aceconfig` (deferred per ADR-003).

---

## Active Constraints

### Standards
- .ace/standards/harness-engineering.md v2.7.0 (§5.1 rule lifecycle)

### Plan / ADRs
- docs/planning/implementation_plan_v2.7_loop_engineering.md (all tasks done)
- ADR-002 (runner interface), ADR-003 (rule promotion)

---

## Session Notes

- The E2E dogfood drill caught a real bug (manual runner hanging on closed
  stdin → silent exit 0 mid-loop) — fixed and regression-tested. The drill
  earned its place in the release checklist.
- The repo now dogfoods its own machinery: verify.sh runs the CLI suite,
  and every release commit passed through it.

---

## Context Links

- **Walkthrough:** docs/planning/v2.7.0_loop_engineering_walkthrough.md
- **Plan:** docs/planning/implementation_plan_v2.7_loop_engineering.md
- **Spec:** ACE-SPEC.md §13 (Loop Engineering)
