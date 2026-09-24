# Active Context: v2.8 Database Documentation as Code

## Session Metadata

- **Last Updated:** 2026-09-23
- **Session ID:** v2.8-db-docs-as-code
- **Active Role:** QA Engineer
- **Mode:** VERIFICATION (complete)

---

## Current Objective

Deliver generic database documentation-as-code support for ACE 2.8.0, with
PostgreSQL and Supabase expansion packs and a first-run-safe verification gate.

---

## Current State

### Working

- Core documentation ownership, skill routing, migration recovery guidance,
  and the optional full-profile `docs_cmd` gate are implemented.
- PostgreSQL catalog lint, reference generation, and drift checks are complete.
- Supabase documentation, safety rules, local type drift, inventory, and
  runbook templates are complete.
- CLI pack dependency resolution installs PostgreSQL with Supabase.
- Six fresh-scaffold combinations pass both full and fast verification.
- Live local PostgreSQL and Supabase integration passes with actual `psql`,
  `tbls`, and Supabase CLI tools.

### In Progress

- None.

### Blocked

- Atomic commits require a Git author name and email; this checkout has neither.

---

## Next Steps

1. [ ] Configure the repository-local Git author identity supplied by the user.
2. [ ] Create the planned atomic commits.
3. [ ] Review or open the release PR.

---

## Active Constraints

- Generated database reference and type artifacts are never hand-edited.
- Database pack settings and examples remain generic and secret-free.
- A fresh scaffold passes verification before any database setup.
- Supabase agents may target only a local stack or attested preview branch.
- Standards changes use the harness updater and preserve anti-collapse history.

---

## Context Links

- **Plan:** `docs/planning/implementation_plan_v2.8_db_docs_as_code.md`
- **Walkthrough:** `docs/planning/walkthrough_v2.8_db_docs_as_code.md`
- **Decision:** `docs/adr/ADR-004-documentation-as-code-gate.md`
- **Tasks:** `docs/progress/tasks.json`
- **Regression guards:** `docs/rca/regression-guards.yaml`
