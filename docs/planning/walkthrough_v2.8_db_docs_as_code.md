# Walkthrough: v2.8 Database Documentation as Code

**Date:** 2026-09-23
**Release:** 2.8.0
**ADR:** ADR-004 (Accepted)

## Result

ACE now treats database reference documentation as generated output from
migration-managed catalog comments. Authored documents explain intent,
security, operations, and ownership. The optional full-profile documentation
gate regenerates configured artifacts and fails on incomplete metadata or
drift.

The core remains engine-agnostic. PostgreSQL supplies catalog lint,
`tbls`-based reference generation, and drift checking. Supabase depends on the
PostgreSQL pack and adds platform security guidance, local type drift checking,
inventory templates, operational runbooks, and a local-or-preview safety rule.

## Delivered behavior

- ADR-004 records generated ownership and gate semantics.
- The database operations skill distinguishes reversible migration tools from
  forward-only tools that require compensating migrations.
- The database documentation skill defines comment ownership, classifications,
  authored boundaries, security narrative, and drift checks.
- The documentation pipeline routes schema documentation to the new skill.
- `.aceconfig` includes an empty, flat `docs_cmd` key. The full profile runs it
  when configured; the fast profile does not.
- Fresh scaffolds install no database pack unless requested. PostgreSQL installs
  independently; Supabase installs itself and PostgreSQL in dependency order.
- Pack scripts fail clearly when required tools, configuration, or services are
  unavailable.
- Generic templates contain placeholders only and carry no project-specific
  schemas, credentials, or connection strings.

## Verification evidence

The scaffold matrix created projects through both supported sources for each
selection: no pack, PostgreSQL, and Supabase. All six fresh projects passed the
full and fast verify profiles before database configuration. Negative fixtures
proved that missing required core files fail.

A disposable local PostgreSQL and Supabase stack exercised the actual pack
tools. The integration fixture proved:

- Missing comments, classifications, RLS, and a pinned `SECURITY DEFINER`
  search path produce nonzero lint results.
- Corrected catalog metadata passes lint.
- `tbls` output covers the configured objects, is byte-stable on a second run,
  and contains no connection value.
- Regeneration followed by the scoped Git diff passes for an unchanged catalog.
- Supabase type output changes after a fixture schema change.

The integration run used Node.js 20.20.0, PostgreSQL client 16.15, tbls 1.96.0,
and Supabase CLI 2.117.0. Runtime fixture identifiers were randomized and
removed after the check.

The final repository verification ran structural validation, task-schema
validation, Markdown and repository tests, and the full ACE gate. Its terminal
contract was `VERIFY_RESULT=pass gate=all`.

## Operational notes

Database gates are opt-in because a newly scaffolded project has no database
configuration or generated reference yet. Teams activate the pack command in
`docs_cmd` after supplying environment-based connection configuration and
committing the first generated artifacts. Supabase automation is restricted to
the local stack or an explicitly attested preview target.

Atomic Git commits remain a local handoff action until this checkout has an
author name and email configured.
