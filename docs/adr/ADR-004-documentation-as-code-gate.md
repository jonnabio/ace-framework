# ADR-004: Documentation-as-code gate

## Status

Accepted

## Date

2026-09-23

## Context

ACE currently asks migration authors to maintain entity documentation manually and assumes every migration tool supports a DOWN step.
This duplicates database facts and does not prove reference completeness or absence of drift.
The framework needs an engine-agnostic contract with optional engine/platform tooling.
The sed-parsed verification configuration must remain flat and freshly scaffolded projects must pass their initial structural gate without database tools or credentials.
Standards changes must respect anti-collapse and the ADR-003 governance boundary.

## Decision

Adopt database documentation as code for v2.8.0.

1. Catalog metadata and comments, maintained through migrations, are the source of truth for physical schema reference.
   Comments explain objects and classify data without containing personal records, credentials or secrets.
2. Generated reference artifacts are marked generated and never hand-edited.
   Correct catalog sources or generator configuration and regenerate.
   Authored documentation covers domain intent, security-model intent and operational decisions; it links to generated facts rather than duplicating column inventories.
3. A documentation gate proves completeness within an explicit catalog scope and absence of reference drift.
   It checks nonblank required comments, classification tags, specified security invariants, coverage and deterministic regeneration against version control.
   Untracked additions and removed objects must be detected, not only modifications to tracked files.
4. Add optional flat `docs_cmd: ""` to `verify:`.
   It runs after the existing commands in the full profile only, with the existing failure semantics and `VERIFY_RESULT` contract.
   Empty documentation configuration does not waive the rule that an otherwise unconfigured gate fails.
5. Scaffolds install capability without activating database checks.
   Their docs_cmd remains empty with no pack, PostgreSQL or Supabase.
   A real shipped structural check makes the first verification meaningful and independent of database tooling.
   Adopters explicitly activate the docs gate after configuring scope, runtime credentials and a committed generated baseline.
6. Core owns the generic skill, documentation routing, conditional migration recovery and narrative-only entity guidance.
   PostgreSQL owns catalog lint, tbls generation with a catalog supplement and Git drift checking.
   Supabase depends on PostgreSQL and supplies platform safety guidance, local type drift and runbook templates.
7. Reversible migration tools retain tested DOWN migrations.
   Forward-only tools require documented, tested compensating migrations, including explicit limits on data recovery.
8. All connection values and application schema selections are provided at runtime/configuration boundaries.
   Framework additions contain no project-specific configuration, sample secrets or real connection strings.
   Scripts fail clearly when required tools/configuration are absent or generation fails.
9. Supabase agent operations target only local stacks or explicitly verified preview branches.
   Type drift uses the local stack; production restore and key rotation remain human-owned runbook activities.
10. Append the generated-artifact rule through `update_harness.sh` after approval.
    Insertion of one database-documentation row into the existing standard table was explicitly approved by the user on 2026-09-23 because the updater is append-only.
    This architectural change does not change ADR-003's staging/promotion rules for incident lessons.

The user also approved repair of the missing scaffold baseline on this checkout and the proposed catalog coverage/classification and mandatory local integration.
The repair will create RCA-001 from reproduced evidence, register its guard and promote the scaffold prevention rule through ADR-003 staging and `update_harness.sh --from-staging`.
The user authorized execution with "Proceed" on 2026-09-23.

## Alternatives Considered

### Hand-maintained physical schema reference

Simple initially, but duplicates facts and makes drift a review guess.
Rejected because the gate cannot establish deterministic agreement with the catalog.

### Enable database checks whenever a pack is installed

Would catch configuration needs early but makes a fresh scaffold fail without a running database and tools.
Rejected in favor of explicit activation with an empty scaffolded docs_cmd.

### Put PostgreSQL and Supabase specifics in core

Would simplify cross-links but introduces engine assumptions and tool prerequisites for every adopter.
Rejected in favor of dependency-aware expansion packs.

### Use only tbls output and ordinary Git diff

Provides relation reference quickly but does not establish all policy/routine coverage or detect untracked generated files.
Rejected in favor of an explicit coverage manifest, catalog supplement and complete scoped drift checks.

## Consequences

### Positive

- Migrations, catalog comments and generated reference have one reproducible provenance chain.
- Generic core remains useful without either expansion pack.
- Completeness and drift failures become observable gate failures.
- Initial scaffolding remains usable without a configured database.

### Negative

- Catalog coverage and generation need real database integration tests and maintained tool compatibility.
- Adopters must configure explicit scope, classifications and a committed baseline before activation.
- Pinned search_path and RLS-enabled checks are limited invariants, not proof of complete access-control safety.
- Standards table insertion uses the narrow exception already approved by the user.

### Neutral

- The task queue schema remains version 1.0 and the CLI gains no runtime packages.
- Existing standards retain their independent version metadata.
- Current literal-path guard hooks do not gain glob support from a migration guard example.

## Compliance

The implementation plan defines the object coverage matrix and file-by-file work.
Zero-dependency CLI tests prove gate profiles, script error handling, dependency installation and actual first-run scaffold verification in all three modes.
Disposable local integration proves comment/RLS/function findings, deterministic tbls reference and Supabase type drift with both failing and repaired fixtures.
The release requires successful full verification, new pack Markdown lint and recorded integration evidence.
A missing tool in an activated pack gate fails clearly; no skip may masquerade as database compliance.
Review verifies that the standard change uses the updater and the separately approved one-row insertion only.

## References

- [Implementation plan](../planning/implementation_plan_v2.8_db_docs_as_code.md).
- [Task queue](../progress/tasks.json).
- [ADR-003: Distilled Rule Promotion Policy](ADR-003-rule-promotion-policy.md).
- [Harness Engineering Standard](../../.ace/standards/harness-engineering.md).
