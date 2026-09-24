# Supabase Documentation Pack

Install with `--pack supabase`; the CLI also installs PostgreSQL and registers both includes.
Installation leaves docs_cmd empty until configured.
Requires the PostgreSQL pack tools plus the Supabase CLI and its running local stack.

## Setup

Use the PostgreSQL `config.example.json`, with runtime connection values supplied through the environment.
Set `target.kind` to `local`; the configured connection must point to that local stack.
The local type checker compares its endpoint to `supabase status` before generating types.
An explicitly attested preview target may be used for PostgreSQL reference checks, but type drift remains local-only.
For preview attestation, provide `target.attestation_file` outside the repository containing
`kind`, `host`, `database`, `approved_by`, `evidence_ref` and a future ISO `expires` date.
No remote production target is permitted.

## Types and gate

Generate a baseline using explicit configured schemas:

```bash
bash .ace/packs/supabase/scripts/generate-types.sh
```

The generator reads configured scope, invokes `supabase gen types --local`, marks the output generated and replaces it only after success.
No schema names, credentials or project identifiers are supplied by the framework.
Review and commit the types and generated reference before activating:

```yaml
verify:
  docs_cmd: "bash .ace/packs/supabase/scripts/check-docs.sh"
```

Retain the other existing flat verify keys.
The composed gate lints and regenerates PostgreSQL reference, requires RLS on all owned tables,
and compares `supabase gen types --local` output against the committed type file.
It fails on any drift, missing tool, failed local stack or untracked baseline.
Run only the type check with `bash .ace/packs/supabase/scripts/check-types.sh`.
Scripts accept an optional config path only, never forwarded CLI flags.

## Authored templates

Copy and adapt the templates under `templates/` into `docs/database/` when activating the workflow.
They contain intent prompts only; do not duplicate generated physical schema facts.
Backup/PITR and key rotation are human-owned operations, not agent production actions.
Use local or approved preview rehearsals with synthetic data.
See the skill for platform exclusions, roles, forward-only migrations and platform inventory.
