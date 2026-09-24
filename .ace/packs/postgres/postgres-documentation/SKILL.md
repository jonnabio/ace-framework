---
name: postgres-documentation
description: Generate PostgreSQL reference from catalog comments and enforce completeness, classification, exposed-table RLS, pinned privileged routine search paths and Git drift.
---

# PostgreSQL Documentation

Apply `.ace/skills/database-documentation/SKILL.md` first.
Read this pack's README for configuration and executable gates.

## Procedure

1. Configure explicit owned and exposed schema lists and a connection environment-variable name.
   Use migration-built local or approved preview state, with synthetic data only.
2. Add catalog comments for schemas, relations, columns, explicit indexes/sequences/constraints,
   routines, policies, non-internal triggers and user-defined types.
   Exclude extension-owned and implicit objects by catalog identity.
3. Add column `classification:` and `pii:` tags using the core vocabulary.
4. Explain grants, exposure, policy intent and SECURITY DEFINER privilege boundaries in authored narrative.
   A pinned `search_path` is necessary but does not prove that its namespaces are trusted.
5. Run `scripts/doc-lint.sh`, generate reference, review it and commit the baseline.
6. Run `scripts/check-docs.sh` through full-profile docs_cmd.
   Never hand-edit generated artifacts or substitute tbls comment overrides.

## Acceptance

Every scoped object has a reference/coverage entry, missing comments and classifications fail,
exposed ordinary/partitioned tables have RLS, and privileged functions pin search_path.
Untracked, ignored, changed and deleted reference artifacts fail the drift check.
Tool/configuration/query failures return nonzero and never erase the previous reference.
