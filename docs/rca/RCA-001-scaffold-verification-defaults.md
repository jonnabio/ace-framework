# RCA-001: Scaffold verification references repository-only tooling

**Date:** 2026-09-23
**Status:** Resolved

## Evidence

This is a new investigation of the current checkout, not a recovered historical RCA.
A fresh temporary directory containing the copied `.aceconfig` and actual verify script
fails its first gate with `cd: cli: No such file or directory` and
`VERIFY_RESULT=fail gate=test` (exit 1).
The clone scaffolder copies `.ace/` and `docs/`, but does not ship `cli/`.

## Five whys

1. First-run verification fails because the configured CLI test directory is absent.
2. The scaffold retains the framework repository's verification commands.
3. Configuration customization previously changed only identity and includes.
4. Bootstrap verification was not separated from repository maintenance verification.
5. No end-to-end test ran the generated gate before adopter customization.

## Repair

A shared fresh-scaffold transformation installs a real structural bootstrap gate.
It clears repository test/typecheck commands and leaves docs_cmd empty.
The CLI and shell initializer use the same transformation.
Existing adopted configurations are refused instead of overwritten.
The framework's active release queue is removed from fresh outputs.

## Regression prevention

The RCA-001 registry entry protects configuration, gate and scaffold paths.
`cli/test/scaffold-config.test.js` checks the fresh gate and deletion failure.
`cli/test/scaffold-verify.test.js` will prove no-pack, PostgreSQL and Supabase
through bundled and offline clone acquisition with no database tools.
The evidence-backed bootstrap lesson was staged as `RULE-f078a328817f` and
promoted through `update_harness.sh --from-staging` in T014.

## Verification

The original reproduction failed before repair.
The complete bundled-template and offline-clone matrix passes for no pack,
PostgreSQL and Supabase in both full and fast profiles. Each mode also fails
after a required core file is deleted, and no mode invokes database tools on
its first run.
