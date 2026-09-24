---
name: database-documentation
description: Maintain database documentation as code using catalog comments, generated schema reference, authored intent, classification and completeness/drift gates. Use for schema-docs and data-dictionary tasks.
---

# Database Documentation

## Prerequisites

Read the applicable ADR, migration tooling and database pack guidance.
Identify owned and exposed scope explicitly; supply credentials only through the environment.
Use a local or approved preview database rebuilt from versioned migrations.
Install the selected pack tools before activating its gate.

## Procedure

1. Write descriptions with schema changes in migration-managed catalog comments.
   Comments are the source of truth for physical schema reference.
   Describe every scoped object, including policies and routine overloads.
2. Classify columns using `classification: public|internal|confidential|restricted`
   and `pii: none|personal|sensitive` tags in their comments.
   Classify the data, never include actual personal records, keys or credentials.
   Comments are metadata visible to database users; classification is not access control.
3. Keep authored intent in `docs/database/README.md` and security/runbook narratives.
   Explain domain invariants, role boundaries, grants, exposed surfaces, RLS policy intent,
   privileged routine execution and recovery decisions.
   Link to generated facts rather than maintaining duplicate column inventories.
4. Generate physical reference under `docs/database/reference/` from the catalog.
   Mark all generated artifacts as generated, with provenance and a regeneration command.
   Never edit generated reference manually; fix the source and regenerate.
   The engine pack must account for all scoped object classes in a coverage manifest.
5. Run completeness checks, regenerate deterministically and check drift against Git.
   Detect changed, added and removed artifacts, including untracked output.
   Commit reviewed migrations, comments and generated reference together.
6. Activate the full verification profile's optional `docs_cmd` after configuration
   and the first reference baseline are committed.
   Installing a pack leaves this command empty; an inactive docs gate proves no database compliance.

## Migration recovery

Reversible tools retain tested UP/DOWN migrations.
Forward-only tools require a documented, tested compensating migration; do not rewrite applied history.
Describe irreversible data loss and recovery limits explicitly.
Regenerate schema reference and pass the docs gate after either migration path.

## Engine routing

- PostgreSQL: `.ace/packs/postgres/postgres-documentation/SKILL.md` when installed.
- Supabase: `.ace/packs/supabase/supabase-documentation/SKILL.md` when installed; depends on PostgreSQL.
- Other engines: apply this contract with an engine-specific catalog adapter and equivalent gate.

## Validation

- Every scoped object has required comments and columns have classification/PII tags.
- Catalog coverage and generator scope agree; missing scope or tooling fails clearly.
- Security narrative explains privilege boundaries and the limits of mechanical checks.
- Repeated generation is stable; the gate fails on missing or stale artifacts.
- Authored documentation explains intent only, with links to generated reference.
- No production data, secrets or connection values appear in committed artifacts.
