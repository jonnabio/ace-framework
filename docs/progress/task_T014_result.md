# T014: Prove first-run scaffold invariant

**Date:** 2026-09-23
**Status:** Verified

## Actions and observations

Verified six real fresh-scaffold paths across no pack, PostgreSQL and Supabase. First-run full/fast gates pass without database tools, missing core files fail, RCA-001 is resolved, and RULE-f078a328817f was promoted through the approved updater. Corrected the promotion formatter so its provenance footer follows repository Markdown style.

## Verification

Task acceptance and the full verify gate exited zero.
Final gate result: `VERIFY_RESULT=pass gate=all`.
