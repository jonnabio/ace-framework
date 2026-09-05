# Active Context: Quality Gates — Backlog Closed

## Session Metadata

- **Last Updated:** 2026-08-31
- **Session ID:** quality-gates
- **Active Role:** QA Engineer
- **Mode:** VERIFICATION (complete)

---

## Current Objective

Close `docs/TODO-quality-gates.md`: nine findings, all of them variations on
gates that exist but cannot fail. Done — the document is now a resolved
record, and every CI step either fails on a real defect or declares itself
advisory in its own name.

---

## Current State

### Working

- **Branch**: `TODO_quality-gates`, 11 commits, one per finding.
  Based on `TODO_markdown-lint`, which is unpushed and has no PR yet.
- **CI** (`validate.yml`) runs `scripts/validate.sh` and
  `.ace/scripts/verify.sh` instead of keeping inline copies of what they do.
  The test suite had never run in CI at all.
- **Two new scripts**: `scripts/check-yaml.sh` (parses every YAML document
  including `.aceconfig`, exits non-zero) and `scripts/check-encoding.sh`
  (detects the double-encoded UTF-8 that has reached this repository twice).
- **Verify gate** has a `--fast` profile (lint + typecheck, 1.2s) used by the
  Stop hook; the full profile (4.3s) stays on CI and the loop runner.
- **CLI** takes `--help`, `--version` and `--yes`, and errors on unknown flags
  instead of discarding them.
- **Release changelog** no longer silently falls back to "last 20 commits".
- **Tests**: 112 passing, up from 88.

### In Progress

- None.

### Blocked

- None.

---

## Next Steps (human actions)

1. [ ] Decide the merge order: `TODO_markdown-lint` first, or open this PR
       against that branch. Both are local and unpushed.
2. [ ] Push and open the PRs. Neither branch has been pushed; `git push` was
       not run.
3. [ ] After merge, confirm the scaffold path: `create-ace-framework` clones
       upstream `main`, so `.markdownlint-cli2.jsonc` only reaches new
       projects once the lint branch lands.

---

## Active Constraints

### Standards

- `.ace/standards/harness-engineering.md` v2.7.0 — the verify gate is the
  source of truth for code health, and an unconfigured gate must fail

### Plan / ADRs

- `docs/TODO-quality-gates.md` (resolved), `docs/TODO-markdown-lint.md`
  (resolved)
- ADR-002 (runner interface), ADR-003 (rule promotion) — untouched here

---

## Session Notes

- Every gate was verified to fail, not only to pass: an invalid YAML file, an
  injected mojibake sequence, a deleted required file, a failing `lint_cmd`,
  and a link to a nonexistent document each turn their step non-zero. A gate
  proven only in the green direction is the exact defect this branch existed
  to remove.
- The workflow was executed rather than read: a clean tree via `git archive`,
  its `run:` steps extracted from the YAML and run in `node:22-bookworm`, and
  the link steps run from the `lycheeverse/lychee` image. Job exit 0.
- Finding 3 turned out to be half-done already — the encoding repair had been
  pushed since the audit. Confirmed by scaffolding a project and running the
  new check against it, rather than assuming either way.

---

## Context Links

- **Backlog:** docs/TODO-quality-gates.md (resolved)
- **Prior branch:** docs/TODO-markdown-lint.md (resolved)
- **Spec:** ACE-SPEC.md §13 (Loop Engineering)
