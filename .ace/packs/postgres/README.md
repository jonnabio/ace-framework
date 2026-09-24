# PostgreSQL Documentation Pack

Requires Node.js 16+, Bash, Git, `psql` and `tbls` on PATH.
Commands fail clearly if a required executable, configuration or baseline is missing.
Install with `--pack postgres`; installation leaves `docs_cmd` empty.

## Configuration

Copy `config.example.json` to `docs/database/config.json` and supply owned schemas explicitly.
The empty owned list is intentionally invalid until configured; there is no application schema default.
Supply the connection only in the named runtime environment variable.
Do not commit credentials or connection values, including in examples.

- `owned_schemas`: nonempty unique simple SQL identifiers; all must exist and be accessible.
- `exposed_schemas`: explicit list, possibly empty; RLS is checked even outside owned scope.
- `excluded_schemas`: explicit exclusions; overlapping owned scope is rejected.
- `output`: generated subtree below `docs/database/`, never a symlink.
- `types_output`: separate generated TypeScript file for Supabase, outside the reference subtree.
- `connection_env`: environment-variable name holding a PostgreSQL URL at runtime.
- `target`: local by default; used by the Supabase safety checks.

`ACE_DB_DOCS_CONFIG` selects the config file; `ACE_DB_OWNED_SCHEMAS` and
`ACE_DB_EXPOSED_SCHEMAS` override scope with JSON arrays.
Never source config files as shell scripts.

## Workflow

Run commands from the repository root, optionally passing the config path as the sole argument:

```bash
bash .ace/packs/postgres/scripts/doc-lint.sh
bash .ace/packs/postgres/scripts/generate-reference.sh
```

Review and commit the generated baseline, then enable the flat full-profile hook:

```yaml
verify:
  docs_cmd: "bash .ace/packs/postgres/scripts/check-docs.sh"
```

Retain the other existing verify keys; the fragment above is only the docs key example.
Run `bash .ace/scripts/verify.sh` to check documentation with the other configured gates.
The fast profile deliberately does not run database checks.

## Coverage and safety

The catalog supplement covers every linted object, including policies and overloaded routines.
The coverage manifest maps stable identities to generated pages; tbls supplies relation details.
Implicit relation row/array types, constraint-backed indexes, owned sequences and extension members are excluded by catalog identity.
Column descriptions require `classification: public|internal|confidential|restricted` and
`pii: none|personal|sensitive`; whitespace-only comments are missing.
Checks run read-only and never query application rows.
RLS checks apply to exposed ordinary/partitioned tables and policy parent tables.
Pinned search_path includes an explicitly empty setting; review namespace trust separately.

Generation uses a fresh temporary tree and replaces only its designated output after success.
A generated marker and manifest record provenance without DSNs, row data, function bodies or timestamps.
Run generation only with a clean reference baseline when checking drift.
The drift gate compares against HEAD and detects untracked/ignored outputs, additions and deletions.
It never stages, stashes or resets changes.
Pin tool versions in CI; use the release walkthrough's actual integration evidence as the tested baseline.
