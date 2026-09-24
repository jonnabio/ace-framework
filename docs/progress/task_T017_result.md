# T017: Validate actual database and generator behavior

**Date:** 2026-09-23
**Status:** Verified

## Actions and observations

Ran a runtime-randomized fixture against a disposable local PostgreSQL database
and local Supabase stack. The fixture proved that incomplete catalog comments,
missing column classifications, disabled RLS, and an unpinned `SECURITY DEFINER`
search path fail the catalog gate. Repairs then passed.

Generated the schema reference twice with `tbls`, confirmed byte-stable output
and catalog coverage, and ran the clean Git drift check. Generated Supabase types
changed after an additional fixture column, proving type drift detection. The
test also checked that generated output did not contain the connection value.

## Verification

- Node.js: v20.20.0
- PostgreSQL client: 16.15
- tbls: 1.96.0
- Supabase CLI: 2.117.0
- Result: integration runner exited zero against local disposable services.
