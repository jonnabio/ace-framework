# Implementation Plan: v2.8.0 Database Documentation as Code

**Date:** 2026-09-23
**Role:** Architect / PLANNING
**Status:** Approved for execution on 2026-09-23.

Approval recorded: yes

## Overview and scope

Add permanent engine-agnostic documentation-as-code policy and workflow to core ACE.
Deliver PostgreSQL tooling and Supabase specialization as optional expansion packs.
Catalog metadata and comments produce committed reference artifacts; authored documents explain intent, trust boundaries and operations.
The full verification profile can enforce completeness and drift after deliberate activation.
No connection values, application schema names, project names or client content belong in framework additions.
Platform schema identifiers explicitly required by the objective are reserved exclusions, not application defaults.

This planning session changes only this plan, `docs/progress/tasks.json` and proposed ADR-004.
It does not update ACTIVE_CONTEXT, execute queued tasks, modify standards, commit or run database commands.
The task queue is deliberately blocked at T001 because its schema assumes an approved plan.
All later tasks depend transitively on that approval gate.

## Analysis of the inspected baseline

The mandatory specification, repository instructions, standards, scripts, skills, knowledge template, existing scientific pack, both CLI entry points, argument parser, every CLI test, ADR template/ADR-003, guard registry, task schema and example were read.
The scientific pack uses `.aceconfig-ext` with `triggers` and `roles_augmented`, plus named skill directories with frontmatter and adjacent scripts/references.
New packs mirror this convention; dependency resolution belongs in the CLI, not a new general YAML parser.

Observed gaps in this checkout:

- The working branch is `main`; ACTIVE_CONTEXT describes completed work on an earlier branch and is historical evidence, not verified branch state.
- `cli/lib/scaffold-config.js` does not exist; configuration and single-pack pruning are inline in `create-ace-framework.js`.
- `docs/rca/regression-guards.yaml` has `guards: []`; no RCA-001 document was found. Its commented example describes an unrelated incident. The requested first-run invariant remains binding because the user explicitly supplied it.
- The scaffold clone path copies `.ace/` and `docs/`, but not `cli/`. It retains the repository's `cd cli && npm test` command. Empty docs_cmd alone cannot fix first-run verification.
- `scripts/init.sh` is a separate scaffold path and also retains repository commands. Both paths need the same bootstrap contract; the user selected repair on this checkout.
- The CLI currently keeps one requested pack and deletes all others. Supabase needs dependency closure before pruning.
- The current guard hook matches literal suffix paths, not recursive globs. An example containing `supabase/migrations/**` must not claim that the current hook mechanically enforces it.
- Markdownlint ignores all `.ace/packs/**`; new first-party pack docs must be included explicitly without reformatting third-party packs.
- Repository-wide Markdown lint currently reports pre-existing errors in the notebook export files. Resolve this baseline separately before implementation pre-flight; do not weaken the final gate or silently include unrelated cleanup.
- No active tasks.json existed at session start. Scaffolding must not copy this framework release queue as an adopter's active work queue.

## Discuss: recorded decisions

The user answered Q1–Q3 on 2026-09-23.
These decisions are settled and must not be requested again during execution.
The revised repair work below remains part of the plan; no implementation has started.

### Q1 — Repair the current checkout

User decision: "Plan its repair here".
Create the missing scaffold configuration helper and repair fresh-project verification here, rather than waiting for another branch.
T005 reproduces the observed defect, writes an evidence-backed RCA-001 with five whys, registers the first-run guard and implements the bootstrap fix.
T014 proves the complete pack matrix and closes the RCA only after regression prevention is recorded.
The RCA must explicitly describe this new investigation, not pretend the absent historical document was recovered.
The unrelated commented example in the registry is not evidence for this incident.

The existing repository-wide notebook-export lint failures remain a separate pre-flight blocker.
Their cleanup is not silently included in this scaffold repair; resolve the baseline before feature execution or explicitly amend its scope.
The final full gate remains mandatory.

### Q2 — Single-row standards exception approved

User decision: "Approved".
The approved insertion in `.ace/standards/documentation.md` is exactly:

```text
| Database documentation | `docs/database/` | Generated reference + authored Markdown | Catalog reference, intent and security model |
```

Append the generated-artifact rule using `update_harness.sh`, citing accepted ADR-004.
Do not rewrite the standard or seek repeat approval for this row.
The scaffold incident prevention lesson follows ADR-003: stage actual evidence, then explicitly promote through `update_harness.sh --from-staging` with provenance.
No recurrence count may be invented; manual promotion may justify a single observed incident.

### Q3 — Coverage and integration approved

User decision: "Approved".
Use the catalog object matrix below, require column classification tags and comments on every scoped policy, and require real local PostgreSQL/tbls/Supabase integration before release.
Unit tests remain offline and dependency-free.
The operator supplies disposable local tooling and runtime values outside version control.
Record supported versions from passing integration runs.

## Design decisions

### Core documentation contract

The new core skill has AgentSkills `name` and `description` frontmatter, prerequisites, procedure, validation and linked pack guidance.
Register `schema-docs` and `data-dictionary` in core `skill_triggers`.
Route the Schema documentation branch immediately after context aggregation so it does not require the Scientific Editor or scientific pack.

Migrations carry catalog comments alongside DDL.
Reversible migration tools retain a tested DOWN path; forward-only tools require a documented and tested compensating migration, with data-loss limitations explicit.
Update every unconditional rollback instruction, not only the numbered procedure.
After schema changes, regenerate reference and pass the docs gate.
Entities guidance keeps conceptual responsibilities, invariants and lifecycle narrative with links to the generated reference; remove duplicated physical-column tables from its template/examples.

Authored `docs/database/README.md`, security narrative and runbooks explain purpose, access expectations and operational intent.
Generated `docs/database/reference/` holds physical schema facts and a coverage manifest.
Use a stable generated marker in Markdown and a generated manifest for formats without comments.
Never hand-edit generated output; correct migrations/catalog comments or generator configuration, then regenerate.

Comments contain descriptions and classification metadata only, never real personal data or secrets.
Approved column tags: `classification: public|internal|confidential|restricted` and `pii: none|personal|sensitive`.
These are data classification labels, not access controls.
Security narrative covers grants, RLS policy intent, privilege bypass, routine execution and exposed surfaces without duplicating generated facts.

### Optional verification hook

Add `docs_cmd: ""` as a flat double-quoted line under `verify:`.
Keep sed-based parsing and existing command/output semantics.
Full execution order: test, lint, typecheck, docs; success ends `VERIFY_RESULT=pass gate=all`.
A docs failure ends `VERIFY_RESULT=fail gate=docs` and exits nonzero.
Fast discards both test and docs commands before checking whether anything is configured.
Empty/missing docs_cmd skips only that gate; an entirely unconfigured active profile still fails.
A docs-only configuration passes full when its command passes and fails fast as unconfigured.
Do not nest pack settings in `verify:` or embed credentials in gate commands.

### First-run scaffold behavior

Installation and activation are distinct.
Every fresh scaffold has empty docs_cmd, even with either pack installed.
The framework repository retains its own CLI test and Markdown gates.
Fresh adopter configs receive a real shipped structural bootstrap check through lint_cmd; it checks required core files, selected includes and referenced skills and fails when they are missing.
It requires Bash and ordinary shell tools, not database tools, npm installation or Git history.
Document its limited structural coverage; users replace/extend it with application gates.
Do not install unconditional `true` commands or weaken unconfigured-gate detection.

Create `cli/lib/scaffold-config.js` for fresh-config transformation as the approved local repair.
Ensure the shell initializer uses the same shipped default contract, tested for parity.
Remove the copied framework release tasks.json from fresh outputs while retaining generic examples.
Do not silently rewrite an existing adopter's verification configuration.
Tests exercise actual CLI acquisition paths using isolated bundled templates and an offline clone fixture.
They run the generated gate immediately with no post-scaffold config editing.

### PostgreSQL pack configuration and lint coverage

Use a non-secret JSON config template with explicit `owned_schemas`, `exposed_schemas`, `excluded_schemas`, output path and connection environment-variable name.
Use a zero-dependency Node config helper alongside Bash scripts; Node is already the CLI prerequisite and is declared as a pack requirement.
Runtime environment overrides are documented and validated; never source config as shell code or use eval.
Owned schemas must be explicit and nonempty; exposed schemas must be explicitly specified and may be an empty list.
No application schema defaults or literal connection examples are supplied.
Validate schema existence and catalog visibility so a misspelled scope cannot pass vacuously.
Reject platform-owned/excluded schemas in owned scope rather than silently producing incomplete output.

Initial completeness matrix:

| Object class | Comment requirement | Additional check |
| --- | --- | --- |
| Owned schemas | Nonblank description | Explicit scope exists |
| Tables, partitioned tables, views, materialized views, foreign tables | Nonblank description | RLS on exposed ordinary/partitioned tables |
| Non-dropped user columns | Nonblank description | Valid classification and PII tags |
| Explicit sequences, indexes, constraints | Nonblank description | Exclude implicit/system/extension objects by catalog identity |
| Functions and procedures, including overloads | Nonblank description | SECURITY DEFINER functions have function-level pinned search_path |
| User-defined enum/domain/composite types | Nonblank description | Exclude automatically created array and relation row types |
| Policies and non-internal triggers | Nonblank description | Policy parent table has RLS enabled |

Exclusions are catalog-derived for extension members and implicit objects, documented and tested; they are not broad name filters that hide owned objects.
RLS-disabled findings inspect configured exposed tables even if exposure extends beyond owned scope, excluding only explicitly documented platform scope.
Supabase's migration guard is stricter: every new owned table requires RLS, including non-exposed tables.
Absence of a policy on an RLS-enabled table is not automatically a completeness failure; default-deny may be intentional and is explained in narrative.

Use PostgreSQL catalogs for comments and visibility, not a permission-filtered view that can silently omit objects.
Run psql with startup files disabled and stop-on-error; bind schema arrays as quoted values, never interpolated identifiers.
SQL emits stable finding codes and object identities; wrapper distinguishes findings from query failure and returns nonzero for both.
Empty/whitespace comments fail.
Check function-level proconfig for pinned search_path, recognizing an explicitly empty path as pinned.
Pinning is a minimum check, not proof that a chosen path is safe; narrative and review must address writable namespaces and temporary-object shadowing.

### Generation and drift

Use tbls for supported relation/column/index reference output and a deterministic catalog supplement for uncovered policies, routines and types.
A coverage manifest maps each linted object identity to generated output; generation fails if a required object is omitted.
Do not use tbls comment overrides as a second source of truth.
Generate in a temporary directory, scrub sensitive connection metadata, validate complete output, then replace only the designated generated subtree.
Do not include timestamps, machine paths, row data, function bodies or volatile identifiers that destabilize output or leak secrets.
Pin generator versions in adopter CI and record tested versions in pack docs.

The drift gate first rejects pre-existing dirty generated artifacts, then regenerates from the migration-built database and runs scoped `git diff --exit-code HEAD -- <output>`.
Also detect untracked and ignored output, because ordinary git diff misses additions.
A fresh generation directory prevents removed database objects leaving stale pages.
Missing Git history or an untracked baseline fails with instructions to generate, review and commit the reference.
Do not stage files, reset user work, stash changes or touch authored documents.
Tool/config/database failures never count as an empty, successful reference.

### Supabase specialization

Supabase declares PostgreSQL as a dependency; the CLI resolves it before pruning and writes PostgreSQL then Supabase includes once each.
Extensions use existing `triggers`/`roles_augmented`; avoid an undocumented dependency key that existing consumers would ignore.
Core stays engine-agnostic.

The skill explains `anon`, `authenticated` and `service_role`, exposed schemas, grants, RLS and privilege bypass.
Exclude platform-owned schemas from owned-object comment lint: auth, storage, realtime, extensions, vault, supabase_functions and graphql_public.
Treat this as a minimum platform exclusion list, reconcile additional platform-managed objects using extension ownership and the tested stack version.
Inventory platform usage separately: pg_cron schedules, pg_net integration, Realtime publications/subscriptions and Storage bucket/policy intent.
Inventory templates record ownership, purpose, failure handling and data classification without job bodies, secret headers or row contents.

Agents run only against local stacks or explicitly identified preview branches; production targets are forbidden.
Default executable flow is local-only.
A preview PostgreSQL target requires explicit preview provenance and an exact target allowlist in non-secret configuration; a hostname pattern or `environment=preview` alone is not proof.
No automatic remote linking or production discovery is performed.
Type drift always uses `supabase gen types --local`, explicit configured schemas and a temporary file followed by comparison with the tracked target.
Preview schema changes must be reproduced through migrations locally for type validation.

Backup/PITR and key-rotation templates describe human-owned preparation, evidence, restore/rotation rehearsal, verification and recovery decisions.
They do not initiate restores or rotate credentials.
Forward-only compensation preserves migration history and documents irreversible data changes.

## Standards preservation and release boundaries

Documentation.md receives the approved table row and one deterministic appended rule.
The scaffold repair also requires a prevention-rule append to harness-engineering.md through the ADR-003 staging/promotion workflow; preserve all existing text.
Keep architecture.md and ADR-003 intact; independent standard version numbers are not release version surfaces.
No blanket search-and-replace of historical versions.
No new CLI runtime dependencies.
No source changes to the loop, task schema, rule updater or generic guard hook are planned.
The migration glob example is procedural plus docs-gate enforcement; generalized hook glob support is a separate proposal.

## Test strategy and acceptance

Use the existing Node assert/test harness and auto-discovered `*.test.js` files, without adding packages to cli/.
Task-specific commands invoke exported test runners and propagate their returned failure counts; simply running an exported test file is insufficient.
New test commands below are implementation deliverables, not commands claimed to exist or pass in this planning session.
Every implementation task also requires the full pre-flight/post-flight gate under the existing harness standard; acceptance commands do not waive it.

Tests must prove failure as well as success:

- Verify profiles: docs pass/fail/empty/missing, docs-only configuration, fast skipping and unconfigured rejection.
- Scaffolds: three requested modes through both acquisition paths, no database tools, empty docs_cmd, real first-run full/fast pass, negative missing-file check, no copied active release queue.
- Packs: dependency closure, missing pack/dependency failure, includes idempotence, no-pack pruning and compatibility with existing packs.
- Config/scripts: hostile or malformed schema input, missing executables, inaccessible catalog, SQL errors, failed generators, cleanup and secret redaction.
- Drift: matching output, modification, addition, deletion, staged and unstaged changes, untracked/ignored artifacts, absent baseline and stable repeated generation.
- Catalog integration: every object class, each missing comment/tag, RLS and search_path failure plus repaired counterpart, exclusions and incomplete-scope detection.
- Supabase integration: local types match/change, absent stack failure and forbidden remote invocation.
- Markdown: repository rules cover the new first-party packs; generic task examples validate against the task schema and cross-field validator.

The integration runner is separate from default npm test, requires explicit disposable local setup and exits nonzero when missing prerequisites.
T017 is mandatory before release, not a best-effort skip.
The final task ends with the full `.ace/scripts/verify.sh`.

## Risks and mitigations

| Risk | Mitigation |
| --- | --- |
| Intended RCA baseline is absent | Approved local repair: reproduce the defect, create RCA-001 with current evidence, register and test the guard |
| A bootstrap pass is mistaken for database compliance | Empty docs_cmd is visible and documented; activation requires configuration, tools and committed baseline |
| Catalog/tbls coverage mismatch | Explicit object matrix, supplement and manifest; actual integration fixtures |
| Comment or generated metadata leaks sensitive material | Metadata-only queries, no sample rows/DSNs, redaction tests and review |
| Drift gate misses new files or preserves stale files | Fresh output tree, HEAD diff plus untracked/ignored checks |
| Schema selection is unsafe or silently empty | Typed config, safe binding, scope existence and privilege checks |
| RLS/search_path checks are mistaken for a full security audit | Document their exact limits; authored threat/access narrative remains required |
| Standards edit violates anti-collapse | Accepted ADR, updater append and narrowly approved one-row exception |
| Tests accidentally contact production | Disposable local-only integration, no ambient remote flags, preview provenance requirement |
| Version/tool output instability | Record tested versions, deterministic normalization and repeat-generation tests |
| Glob guard appears mechanically enforced | Explicitly disclose literal-hook limitation; enforce catalog invariants in the docs gate |

## Ordered tasks and file-by-file changes

The following task records are the file-by-file execution inventory.
No file outside these lists is implicitly authorized; the inventory now includes the approved local scaffold-repair design.
All tasks are S/M, and dependencies point to earlier tasks.

### T001 — Record final plan approval

**Complexity:** S | **Role:** Architect | **Depends on:** None

Record final approval of the revised plan and accept ADR-004 before implementation. Q1-Q3 are resolved: repair the current checkout, permit the single standards table row, and require the agreed catalog coverage and local integration.

**Create:** None.

**Modify:** `docs/planning/implementation_plan_v2.8_db_docs_as_code.md`, `docs/adr/ADR-004-documentation-as-code-gate.md`.

**Tests and acceptance criteria:** Design decisions Q1-Q3 were approved by the user. The revised plan includes scaffold repair in T005 and regression closure in T014. Do not ask again for those decisions or fabricate historical RCA evidence. Start implementation only after the planning-only boundary is lifted and the existing lint baseline blocker is addressed.

```bash
node -e "const fs=require('fs'),a=fs.readFileSync('docs/adr/ADR-004-documentation-as-code-gate.md','utf8'),p=fs.readFileSync('docs/planning/implementation_plan_v2.8_db_docs_as_code.md','utf8'); if(!/## Status\s+Accepted/.test(a)||!p.includes('Approval recorded: yes')) process.exit(1);"
```

### T002 — Define core documentation workflow

**Complexity:** M | **Role:** Developer | **Depends on:** T001

Add the engine-agnostic database-documentation skill, two triggers, schema pipeline routing, conditional migration recovery, and narrative-only entities guidance.

**Create:** `.ace/skills/database-documentation/SKILL.md`, `cli/test/database-docs-contract.test.js`.

**Modify:** `.aceconfig`, `.ace/skills/database-operations/SKILL.md`, `.ace/skills/documentation-generation/SKILL.md`, `.ace/knowledge/entities.md`.

**Tests and acceptance criteria:** Test frontmatter, trigger resolution, pipeline routing, both recovery branches and reference links. Review every rollback mention, including checklist, validation and pitfalls; no remaining unconditional DOWN requirement.

```bash
node -e "Promise.resolve(require('./cli/test/database-docs-contract.test.js')('database-docs-contract')).then(n => process.exit(n ? 1 : 0)).catch(e => { console.error(e); process.exit(1); })"
```

### T003 — Extend documentation standard safely

**Complexity:** S | **Role:** Developer | **Depends on:** T001, T002

Append the generated-artifact rule with update_harness.sh under accepted ADR-004; insert exactly the approved database document-types row.

**Create:** `cli/test/documentation-standard.test.js`.

**Modify:** `.ace/standards/documentation.md`.

**Tests and acceptance criteria:** Assert the original file is preserved except the approved single row and appended rule. Rule names catalog provenance, generated marker, no manual edits and docs/database/. No bulk rewrite; retain evidence of updater invocation.

```bash
node -e "Promise.resolve(require('./cli/test/documentation-standard.test.js')('documentation-standard')).then(n => process.exit(n ? 1 : 0)).catch(e => { console.error(e); process.exit(1); })"
```

### T004 — Add optional full-profile docs gate

**Complexity:** S | **Role:** Developer | **Depends on:** T001

Add flat docs_cmd parsing and execution to verify.sh; root configuration ships empty docs_cmd and existing gates retain behavior.

**Create:** None.

**Modify:** `.ace/scripts/verify.sh`, `.aceconfig`, `cli/test/adapter.test.js`.

**Tests and acceptance criteria:** Full docs-only success passes; docs failure ends VERIFY_RESULT=fail gate=docs. Empty/missing docs skips. Fast discards docs before empty-gate check, never invokes it. All-empty still fails. Cover LF/CRLF and alternate config path.

```bash
node -e "Promise.resolve(require('./cli/test/adapter.test.js')('adapter')).then(n => process.exit(n ? 1 : 0)).catch(e => { console.error(e); process.exit(1); })"
```

### T005 — Provide scaffold-safe verification defaults

**Complexity:** M | **Role:** Developer | **Depends on:** T001, T004

Repair scaffold verification on this checkout: create scaffold-config.js and a shipped structural check, use it for fresh lint_cmd, clear repository-only test_cmd/typecheck_cmd, and keep docs_cmd empty. Reproduce and document the defect as RCA-001, register its guard, and exclude the framework release tasks.json from fresh adopter queues.

**Create:** `cli/lib/scaffold-config.js`, `.ace/scripts/verify-scaffold.sh`, `cli/test/scaffold-config.test.js`, `docs/rca/RCA-001-scaffold-verification-defaults.md`.

**Modify:** `cli/bin/create-ace-framework.js`, `scripts/init.sh`, `docs/rca/regression-guards.yaml`.

**Tests and acceptance criteria:** Capture a failing fresh-scaffold reproduction before fixing, with commands, actual output, five whys and dated evidence; RCA-001 records this investigation, not a recovered historical incident. Register exact guarded paths for .aceconfig, verify.sh, verify-scaffold.sh, both scaffold entry points, scaffold-config.js and pack-registry.js; reference scaffold-config.test.js and the planned scaffold-verify.test.js. Fresh full and fast gates then pass without cli/, npm installs, network, Git initialization or database tools; deleting a required core file fails. Preserve repository gates and existing adopters' configured commands. Keep RCA open until T014 proves all three modes and promotes the prevention rule.

```bash
node -e "Promise.resolve(require('./cli/test/scaffold-config.test.js')('scaffold-config')).then(n => process.exit(n ? 1 : 0)).catch(e => { console.error(e); process.exit(1); })"
```

### T006 — Define PostgreSQL pack contract

**Complexity:** M | **Role:** Developer | **Depends on:** T002

Add PostgreSQL pack extension, skill, README, non-secret config template and shared validated configuration loader.

**Create:** `.ace/packs/postgres/.aceconfig-ext`, `.ace/packs/postgres/postgres-documentation/SKILL.md`, `.ace/packs/postgres/README.md`, `.ace/packs/postgres/config.example.json`, `.ace/packs/postgres/scripts/config.js`, `cli/test/postgres-config.test.js`.

**Modify:** None.

**Tests and acceptance criteria:** Explicit owned/exposed arrays; owned nonempty, exposed explicitly allowed empty. Runtime-only connection environment variable; malformed/missing configuration fails before tool invocation. Reject unsafe output paths and conflicting exclusions. No default application schemas or connection literals.

```bash
node -e "Promise.resolve(require('./cli/test/postgres-config.test.js')('postgres-config')).then(n => process.exit(n ? 1 : 0)).catch(e => { console.error(e); process.exit(1); })"
```

### T007 — Implement PostgreSQL catalog lint

**Complexity:** M | **Role:** Developer | **Depends on:** T006

Add read-only SQL and wrapper for comment completeness, column classification, exposed-table RLS and pinned SECURITY DEFINER search_path.

**Create:** `.ace/packs/postgres/sql/doc-lint.sql`, `.ace/packs/postgres/scripts/doc-lint.sh`, `cli/test/postgres-lint.test.js`.

**Modify:** None.

**Tests and acceptance criteria:** Mock wrapper errors/findings/missing psql, safe schema parameter binding and redaction. SQL covers the documented object matrix, whitespace comments, dropped columns and extension exclusions. Findings and SQL/connection failures return nonzero. Real catalog validation is mandatory in T017.

```bash
node -e "Promise.resolve(require('./cli/test/postgres-lint.test.js')('postgres-lint')).then(n => process.exit(n ? 1 : 0)).catch(e => { console.error(e); process.exit(1); })"
```

### T008 — Generate complete schema reference

**Complexity:** M | **Role:** Developer | **Depends on:** T006, T007

Generate deterministic tbls relation documentation plus catalog supplement for policies, routines and other covered objects; mark all outputs generated.

**Create:** `.ace/packs/postgres/scripts/generate-reference.sh`, `.ace/packs/postgres/sql/reference.sql`, `cli/test/postgres-reference.test.js`.

**Modify:** None.

**Tests and acceptance criteria:** Use a fresh temporary output tree, scoped metadata-only reads and canonical ordering. No tbls comment overrides, DSNs, timestamps, data rows or secret-bearing function bodies in output. Supplement closes tbls coverage gaps. Missing/failing tools do not replace existing output. Real tbls validation follows in T017.

```bash
node -e "Promise.resolve(require('./cli/test/postgres-reference.test.js')('postgres-reference')).then(n => process.exit(n ? 1 : 0)).catch(e => { console.error(e); process.exit(1); })"
```

### T009 — Enforce reference drift gate

**Complexity:** M | **Role:** Developer | **Depends on:** T007, T008

Compose lint and regeneration with scoped git diff --exit-code against HEAD and explicit untracked/ignored artifact detection.

**Create:** `.ace/packs/postgres/scripts/check-docs.sh`, `cli/test/postgres-drift.test.js`.

**Modify:** None.

**Tests and acceptance criteria:** Temporary Git tests prove additions, removals, staged edits, unstaged edits, untracked outputs and stale files fail; identical regeneration passes. Missing Git/HEAD and ignored output fail clearly. Do not stage, reset, stash or alter authored docs; preserve dirty generated work by failing before replacement.

```bash
node -e "Promise.resolve(require('./cli/test/postgres-drift.test.js')('postgres-drift')).then(n => process.exit(n ? 1 : 0)).catch(e => { console.error(e); process.exit(1); })"
```

### T010 — Document Supabase specialization and runbooks

**Complexity:** M | **Role:** Developer | **Depends on:** T002, T006

Add dependent Supabase pack, skill, README, security-model and inventory templates, backup/PITR and key-rotation runbooks.

**Create:** `.ace/packs/supabase/.aceconfig-ext`, `.ace/packs/supabase/supabase-documentation/SKILL.md`, `.ace/packs/supabase/README.md`, `.ace/packs/supabase/templates/security-model.md`, `.ace/packs/supabase/templates/inventory.md`, `.ace/packs/supabase/templates/backup-pitr.md`, `.ace/packs/supabase/templates/key-rotation.md`, `cli/test/supabase-contract.test.js`.

**Modify:** None.

**Tests and acceptance criteria:** Cover roles, exclusions, forward-only compensation, inventory, local/preview safety and human-owned operational runbooks. No production execution instructions for agents, embedded credentials or project-specific values. Distinguish database recovery from Storage object recovery and key types without assuming a platform plan.

```bash
node -e "Promise.resolve(require('./cli/test/supabase-contract.test.js')('supabase-contract')).then(n => process.exit(n ? 1 : 0)).catch(e => { console.error(e); process.exit(1); })"
```

### T011 — Check Supabase local type drift

**Complexity:** M | **Role:** Developer | **Depends on:** T009, T010

Generate types with supabase gen types --local to a temporary file, compare configured tracked artifact, and compose the Supabase docs gate with PostgreSQL checks.

**Create:** `.ace/packs/supabase/scripts/check-types.sh`, `.ace/packs/supabase/scripts/check-docs.sh`, `cli/test/supabase-types.test.js`.

**Modify:** None.

**Tests and acceptance criteria:** Assert --local is mandatory, explicit schemas are forwarded safely, production/linked flags are rejected, partial output cannot overwrite baseline, missing tool/stack/target fails, matching types pass and changed types fail. PostgreSQL checks enforce local target or explicitly attested preview target; type drift remains local-only.

```bash
node -e "Promise.resolve(require('./cli/test/supabase-types.test.js')('supabase-types')).then(n => process.exit(n ? 1 : 0)).catch(e => { console.error(e); process.exit(1); })"
```

### T012 — Supply reusable guard and task examples

**Complexity:** S | **Role:** Developer | **Depends on:** T009, T011

Add an inactive migration guard example and schema-valid database documentation task example with explicit dependencies and real pack commands.

**Create:** `docs/rca/regression-guards.supabase.example.yaml`, `docs/progress/tasks.database-docs.example.json`, `cli/test/database-docs-examples.test.js`.

**Modify:** None.

**Tests and acceptance criteria:** Invariant: every new table and policy has a catalog comment; each new table and each policy's parent table has RLS enabled. The example guards supabase/migrations/**, stays inactive until adopted, and distinguishes procedural glob review from current hook capabilities. Generic workflow points to an adopter-created plan, never the framework release queue.

```bash
node -e "Promise.resolve(require('./cli/test/database-docs-examples.test.js')('database-docs-examples')).then(n => process.exit(n ? 1 : 0)).catch(e => { console.error(e); process.exit(1); })" && node cli/lib/validate-tasks.js docs/progress/tasks.database-docs.example.json
```

### T013 — Resolve and install pack dependencies

**Complexity:** M | **Role:** Developer | **Depends on:** T005, T006, T010

Support postgres and supabase using a deterministic dependency closure; Supabase retains PostgreSQL and writes both includes exactly once.

**Create:** `cli/lib/pack-registry.js`, `cli/test/packs.test.js`.

**Modify:** `cli/bin/create-ace-framework.js`, `cli/lib/scaffold-config.js`, `cli/lib/parse-args.js`, `cli/test/parse-args.test.js`.

**Tests and acceptance criteria:** Keep scientific/ai-research/no-pack behavior. Reject unknown packs and missing dependencies before pruning. Cover case normalization, LF/CRLF, includes: [], repeated reconciliation, dependency ordering and path traversal. CLI runtime dependency count remains zero.

```bash
node -e "Promise.resolve(require('./cli/test/packs.test.js')('packs')).then(n => process.exit(n ? 1 : 0)).catch(e => { console.error(e); process.exit(1); })" && node -e "Promise.resolve(require('./cli/test/parse-args.test.js')('parse-args')).then(n => process.exit(n ? 1 : 0)).catch(e => { console.error(e); process.exit(1); })"
```

### T014 — Prove first-run scaffold invariant

**Complexity:** M | **Role:** Developer | **Depends on:** T004, T005, T012, T013

Add offline end-to-end fresh scaffold matrix for no pack, postgres and supabase through bundled and clone acquisition paths. Close RCA-001 only after the matrix passes and its prevention rule is staged and explicitly promoted through update_harness.sh.

**Create:** `cli/test/scaffold-verify.test.js`.

**Modify:** `docs/rca/RCA-001-scaffold-verification-defaults.md`, `docs/rca/regression-guards.yaml`, `.ace/standards/distilled-staging.md`, `.ace/standards/harness-engineering.md`.

**Tests and acceptance criteria:** Use isolated CLI copies and a local source fixture for clone transport. Run the actual scaffolded full/fast gates without editing generated config; assert docs_cmd empty and no database tool called. Verify includes and pack files. Delete a required file and require failure. Assert framework release tasks.json is not installed as an active adopter queue. Assert the active RCA-001 guard names the protected paths and actual regression tests. Stage the evidence-backed rule that scaffolds may reference only shipped tools and must pass real first-run verification. Promote with update_harness.sh --from-staging using human-confirmed approval under ADR-003; do not fabricate recurrence counts or use auto-promotion. Preserve the original harness standard byte-for-byte as a prefix, record promotion provenance in the RCA, and test that the appended rule is present before closure.

```bash
node -e "Promise.resolve(require('./cli/test/scaffold-verify.test.js')('scaffold-verify')).then(n => process.exit(n ? 1 : 0)).catch(e => { console.error(e); process.exit(1); })"
```

### T015 — Publish generic usage and routing guidance

**Complexity:** M | **Role:** Developer | **Depends on:** T003, T011, T012, T013

Update skills/user/CLI guides, specification and IDE routing for opt-in database docs, setup, recovery, generated/authored ownership and both new packs.

**Create:** `cli/test/database-docs-guides.test.js`.

**Modify:** `SKILLS_GUIDE.md`, `USER_GUIDE.md`, `ACE-SPEC.md`, `README.md`, `cli/README.md`, `.aiconfig`, `.cursorrules`, `AGENTS.md`, `CLAUDE.md`, `.markdownlint-cli2.jsonc`.

**Tests and acceptance criteria:** New first-party pack Markdown must be linted using repository rules; narrow the current blanket pack ignore while retaining third-party exclusions. Document first-run structural coverage versus activated database coverage. Examples use variable names and placeholders only; include correct full-only docs_cmd activation. Contract tests assert guide coverage, trigger paths, dependency instructions, activation commands and local-only examples; verify referenced shipped scripts exist.

```bash
node -e "Promise.resolve(require('./cli/test/database-docs-guides.test.js')('database-docs-guides')).then(n => process.exit(n ? 1 : 0)).catch(e => { console.error(e); process.exit(1); })" && npx --no-install markdownlint-cli2
```

### T016 — Synchronize v2.8.0 release metadata

**Complexity:** S | **Role:** Developer | **Depends on:** T015

Bump active release version/config/banner references and add an accurate changelog entry without rewriting historical release records or immutable standards.

**Create:** `cli/test/release-version.test.js`.

**Modify:** `cli/package.json`, `.aceconfig`, `.aiconfig`, `.cursorrules`, `cli/bin/create-ace-framework.js`, `scripts/init.sh`, `ACE-SPEC.md`, `README.md`, `USER_GUIDE.md`, `AGENTS.md`, `CLAUDE.md`, `CHANGELOG.md`.

**Tests and acceptance criteria:** Assert all listed active version surfaces agree on 2.8.0 and CLI --version matches. Keep task schema version 1.0, historical changelog versions and independently versioned standards unchanged. No new CLI dependencies or lockfile churn.

```bash
node -e "Promise.resolve(require('./cli/test/release-version.test.js')('release-version')).then(n => process.exit(n ? 1 : 0)).catch(e => { console.error(e); process.exit(1); })"
```

### T017 — Validate actual database and generator behavior

**Complexity:** M | **Role:** QA Engineer | **Depends on:** T007, T008, T009, T011, T014

Run integration fixtures against a disposable local PostgreSQL database and local Supabase stack with installed psql, tbls and Supabase CLI.

**Create:** `cli/test/integration/database-docs.js`.

**Modify:** None.

**Tests and acceptance criteria:** Runner fails clearly if tools/environment are missing; never silently skips. Create randomized parameterized fixture identifiers at runtime, apply comments/RLS/functions/policies, prove each violation fails and repairs pass. Verify tbls coverage, stable second generation, type drift and no connection-value leakage. No remote production access. Record versions and evidence.

```bash
node cli/test/integration/database-docs.js
```

### T018 — Run final verification and write handoff

**Complexity:** S | **Role:** QA Engineer | **Depends on:** T014, T016, T017

Verify all acceptance results, full repository gate, structure and new pack Markdown; write walkthrough and session handoff after successful checks.

**Create:** `docs/planning/walkthrough_v2.8_db_docs_as_code.md`.

**Modify:** `docs/context/ACTIVE_CONTEXT.md`.

**Tests and acceptance criteria:** Full verify is the final command and must end VERIFY_RESULT=pass gate=all. Walkthrough includes actual integration evidence and three fresh-scaffold results; no assertion of database validation based only on mocks. Publication, deployment and remote pushes remain outside scope.

```bash
bash scripts/validate.sh && node cli/lib/validate-tasks.js docs/progress/tasks.json && bash .ace/scripts/verify.sh
```

## References and technical evidence

- [ADR-004 proposal](../adr/ADR-004-documentation-as-code-gate.md) and [task queue](../progress/tasks.json).
- [ADR-003 promotion policy](../adr/ADR-003-rule-promotion-policy.md).
- [PostgreSQL COMMENT](https://www.postgresql.org/docs/17/sql-comment.html): catalog comments are metadata and are visible to connected users; do not put secrets in them.
- [PostgreSQL CREATE FUNCTION](https://www.postgresql.org/docs/current/sql-createfunction.html): function-level configuration and SECURITY DEFINER safety inform the pinned-path check and its limits.
- [tbls documentation](https://github.com/k1LoW/tbls/blob/main/README.md): relation filtering, generated documentation and optional comment overrides; the proposal disallows overrides to preserve catalog authority.
- [Supabase local workflow](https://supabase.com/docs/guides/local-development/cli-workflows): local migration workflow and local type generation.

## Planning-session verification and handoff

The queue passed both the repository validator and JSON Schema draft 2020-12 validation, including date formats.
Lint only the two Markdown deliverables using the repository rules and inspect the changed-file list.
These checks validate planning artifacts, not the proposed implementation.
Next: approve the revised plan/ADR and record that approval in T001; resolve the existing lint baseline before a fresh Developer session.
Q1–Q3 are already resolved; no repeat decision is required.

## Execution amendment: baseline lint

Pre-flight confirmed generated NotebookLM bundles fail document-level Markdown rules.
Exclude only generated export bundles and existing third-party packs; continue linting source documents and new first-party packs.
RCA-002 records the reproduction and prevention. This prerequisite repair does not hand-edit generated bundles or disable source-document rules.
Execution was authorized by the user with "Proceed".
