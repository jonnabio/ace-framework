# RCA-002: Generated export bundles entered source-document lint

**Date:** 2026-09-23
**Status:** Resolved

## Evidence

Pre-flight `bash .ace/scripts/verify.sh` passed CLI tests and failed with
`VERIFY_RESULT=fail gate=lint` on generated NotebookLM export bundles.
`export_for_notebooklm.ps1` concatenates full Markdown files, including vendored packs.
This reproduction precedes the v2.8 changes.

## Five whys

1. Lint failed because bundles contain multiple complete document structures.
2. Complete structures repeat headings and contain upstream formatting.
3. The exporter concatenates source Markdown without rewriting it.
4. The global Markdown glob also selects its generated output.
5. The lint scope did not distinguish generated transport bundles from authored source documents.

## Fix and prevention

Exclude only `ace_notebooklm_export_part*.md` from source-document lint.
Continue linting their maintained source files; retain only the named third-party pack exclusions.
New first-party PostgreSQL and Supabase packs remain linted.
The documentation-as-code rule in ADR-004 establishes generated versus authored ownership.
The regression guard and configuration test prevent a return to blanket pack exclusion.

## Verification

Run the full verification gate and `cli/test/lint-scope.test.js`.
The scope test confirms generated exports are excluded while authored documents and first-party packs are included.
