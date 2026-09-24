---
name: supabase-documentation
description: Maintain Supabase database documentation, role and RLS intent, platform inventory, local generated types and forward-only migration recovery using the PostgreSQL pack.
---

# Supabase Documentation

## Prerequisites and safety

Install the PostgreSQL dependency and apply the core database-documentation skill.
Agents run only against a local stack or an explicitly attested preview branch.
Production is forbidden, including read-only documentation runs and operational runbooks.
A preview label or hostname pattern is insufficient: require an exact host/database attestation
with human approver, evidence reference and expiry, held outside the repository.
Type drift always runs against the local stack; reproduce preview changes locally through migrations.
Never automatically link a remote project or accept remote flags from task input.

## Role and exposure model

- `anon`: unauthenticated requests still require deliberate grants and RLS policy intent.
- `authenticated`: identity alone grants no business permission; explain policy predicates and trust assumptions.
- `service_role`: privileged server-side access can bypass RLS; never expose service credentials to a client.

Document schema exposure separately from ownership.
RLS being enabled does not prove policies or grants are correct; review access paths, functions and views.
Every new owned table must have RLS, even if it is not exposed; every table/policy has a catalog comment.
Document intentional default-deny where no policy exists.
SECURITY DEFINER routines require pinned search_path and review of executable privileges and trusted namespaces.

## Platform ownership and inventory

Exclude platform-owned `auth`, `storage`, `realtime`, `extensions`, `vault`,
`supabase_functions`, `graphql_public` and migration metadata from owned-object comment requirements.
Do not hide application objects behind these exclusions.
Inventory platform usage separately with the template: pg_cron schedules, pg_net integration,
Realtime publication/subscription intent and Storage bucket/policy intent.
Record ownership, failure handling and classification, not job bodies, headers, keys or stored rows.
Application-authored policies on platform tables require narrative review even where owned-object lint excludes the table.

## Migration and documentation workflow

1. Write forward-only migrations with comments, column classification and RLS.
2. Document and test a compensating migration; never edit applied history or assume DOWN is supported.
3. Regenerate PostgreSQL reference from the migrated local database; update authored intent only.
4. Generate local TypeScript types, review and commit the baseline.
5. Run the composed Supabase documentation gate; resolve comment, RLS, reference and type drift.
6. Maintain backup/PITR and key-rotation runbooks as human-owned intent, with local/preview rehearsals only for agents.

## Acceptance

The dependency is installed, owned scope excludes platform schemas, generated reference and types match,
all new tables/policies satisfy the migration guard, and no agent command targets production.
Missing tools, failed local services and absent committed baselines fail clearly.
