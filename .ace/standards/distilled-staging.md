# Distilled Rules — Staging (Curator)

> **Status**: Active (v2.7 Loop Engineering)
> **Lifecycle**: staged → promoted | expired (ADR-003)
>
> Reflector lessons land here with provenance and hit counts. Nothing in
> this file is a standard yet. Rules become standards only through
> `ace-framework curate promote` (human-confirmed by default; eligible at
> hit_count >= 2). Rules that do not re-fire within 30 days are moved to
> `distilled-archive.md` by `ace-framework curate expire`.
>
> This file is managed by the Curator tooling. Humans may edit rule WORDING
> in place (white-box auditing) but should not add or remove entries by
> hand — use the tooling so identity and provenance stay consistent.

<!-- BEGIN STAGED RULES -->

## RULE-f078a328817f [promoted 2026-09-23 → harness-engineering.md]

- **category:** Scaffolding
- **hit_count:** 1
- **first_seen:** 2026-09-23
- **last_seen:** 2026-09-23
- **source:** T014 fp:4ddbc590d3e0a1f2 trace:docs/rca/RCA-001-scaffold-verification-defaults.md

> Fresh scaffolds must reference only shipped verification tools and must pass their real full and fast gates before adopter customization.

<!-- END STAGED RULES -->
