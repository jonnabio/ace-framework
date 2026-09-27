# Active Context: Session Handoff

**Last Updated:** 2026-09-27
**Session Focus:** v2.8 release status, candidate review, and repository synchronization

## Completed

- Confirmed `create-ace-framework@2.7.0` is the published package; v2.8 is not yet an active implementation or planned release.
- Reviewed the v2.8 candidates: Parallel Generators, a live headless Claude Code CI session, and configurable Curator thresholds/expiry.
- Fast-forwarded local `main` to the fetched `origin/main` tip (`52ef0fe`); it was 54 commits behind and is now synchronized.
- Preserved the existing quality-gates handoff: its backlog is closed, and current CI runs Node 22, `npm ci`, the framework validation and verify gates, encoding/YAML checks, and internal-link validation.
- No application source code or tests were changed in this session.

## Current State

- Published/current release is v2.7.0. No v2.8 plan, acceptance criteria, or implementation work exists yet.
- The current `main` includes the quality-gates work, including CLI tests through `.ace/scripts/verify.sh`; live Claude Code execution remains untested in CI.
- Retain unmerged remote feature branches `feature/azure-devops-skills` and `feature/database-docs-as-code` until their work is integrated or explicitly abandoned.

## Next Steps

1. When v2.8 work begins, choose the release scope and create acceptance criteria plus an implementation plan before implementation.
2. If Parallel Generators are selected, define queue locking, stale-claim recovery, workspace isolation, and merge/conflict behavior in an ADR before coding.
3. If a live Claude Code CI test is selected, define credential handling, fixture isolation, cost/time limits, and trace-retention policy.

## Blockers/Issues

- No immediate blocker; v2.8 remains a set of candidates.
- Parallel execution is incompatible with the current single-`in_progress` queue invariant without a lock/claim protocol and isolated workspaces.
- A live headless runner test needs a protected credential strategy, isolated fixture, explicit time/cost limits, and a trace artifact policy.
- Configurable Curator thresholds were intentionally deferred by ADR-003. Expiry already has a `--days` override; decide whether demand justifies config and define validation/precedence.
- The CLI filters eligible rules for auto-promotion, but `curator.promote(..., { auto: true })` does not enforce the threshold itself. Add a focused regression test and enforce the policy centrally if Curator work resumes.

## Notes

- CI currently runs the CLI tests through the configured verify gate; the earlier observation that tests were absent from CI was made before synchronizing with current `main` and is superseded.
- Relevant references: `.github/workflows/validate.yml`, `docs/adr/ADR-002-runner-adapter-interface.md`, `docs/adr/ADR-003-rule-promotion-policy.md`, `ACE-SPEC.md` sections 10 and 13, and `docs/planning/v2.7.0_loop_engineering_walkthrough.md`.
- Validation: markdown lint passed; with Git Bash on PATH, the CLI suite had 123 passing tests and one failure in the existing CRLF-preservation test for `cli/lib/scaffold-config.js`. The implementation matches `origin/main`; that unrelated behavior was not changed.
- The full `.ace/scripts/verify.sh` entry point could not run directly because `/bin/bash` is unavailable in this Windows environment.
