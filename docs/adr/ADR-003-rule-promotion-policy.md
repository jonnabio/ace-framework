# ADR-003: Distilled Rule Promotion Policy

## Status

Accepted

## Date

2026-07-05

## Context

v2.6 lets the Curator append Reflector-distilled lessons to standards via
`update_harness.sh`. Unbounded, this recreates the context bloat the update
was meant to solve: every transient failure becomes a permanent playbook line
that agents load forever. v2.7 (T008) introduces a staging area with a rule
lifecycle; this ADR fixes the policy questions the implementation plan left
open: when may a rule be promoted into a real standard, when does it expire,
and whether promotion may ever be automatic.

Constraints:

- **White-box auditing** (v2.6 pillar): humans must be able to review what
  enters the playbook.
- **Anti-collapse appends**: standards files are never rewritten, only
  appended to.
- **Evidence over accumulation**: a rule earns permanence by preventing
  repeat failures, not by existing.

## Decision

1. **All lessons land in staging first** —
   `.ace/standards/distilled-staging.md`. No path writes directly into a
   real standard.
2. **Deduplication by identity, evidence by hit count.** A lesson's identity
   is the fingerprint of its normalized text plus category. Re-distilling an
   equivalent lesson increments `hit_count` and updates `last_seen` instead
   of duplicating.
3. **Promotion is human-confirmed by default.** `ace-framework curate promote
   <rule-id> --to <standard-file>` shows the rule and requires explicit
   confirmation. Promotion appends via the `update_harness.sh` format with
   provenance (rule id, hit count, source task).
4. **Promotion eligibility threshold: `hit_count >= 2`.** A rule seen once
   is an anecdote; twice is a pattern. `curate list` marks eligible rules.
   The threshold is advisory for humans (they may promote earlier with
   justification) and binding for auto-promotion.
5. **Auto-promotion is opt-in and category-restricted.**
   `curate promote --auto` promotes all eligible staged rules *except* those
   in the reserved categories `Security`, `Data-Loss`, and `Compliance`,
   which always require human confirmation. Auto-promotion exists for
   high-velocity teams; the default workflow never uses it.
6. **Expiry window: 30 days without re-fire.** `curate expire` moves staged
   rules whose `last_seen` is older than 30 days (configurable via
   `--days N`) to `.ace/standards/distilled-archive.md`. Archived rules keep
   their provenance and can be re-staged; nothing is deleted. Promoted rules
   never expire automatically — removing a promoted rule from a standard
   requires an ADR, like any standards change.

## Alternatives Considered

- **Auto-promotion by default with a high threshold (hit_count >= 5):**
  rejected — it silently converts the playbook from human-audited to
  model-audited, abandoning the white-box pillar for modest convenience.
- **No expiry (staging grows forever):** rejected — staging becomes a
  second unbounded append file; the Reflector's noise must decay.
- **Hard deletion on expiry:** rejected — destroys evidence; archive is
  append-only and cheap.
- **Per-project configurable thresholds in `.aceconfig`:** deferred — start
  with fixed, documented numbers; add configuration when real projects
  demonstrate the need (avoid speculative knobs).

## Consequences

### Positive

- The playbook only grows with evidence-backed, human-approved rules.
- Reflector noise self-cleans after 30 days.
- Full provenance chain: failure → trace → lesson → staged rule → promoted
  standard line.

### Negative

- Human confirmation is a bottleneck on high-failure projects (mitigated by
  the opt-in `--auto` path).
- Fixed thresholds will not fit every team (accepted until proven).

### Neutral

- The staging file is itself loaded by agents only on demand (Tier 2), so
  staged-but-unpromoted rules still influence work when relevant.

## Compliance

- `cli/test/curator.test.js` asserts: dedup increments instead of appending;
  promotion writes the append-only format with provenance; expiry moves to
  archive without deletion; reserved categories refuse `--auto`.
- Code review: any code path writing to `.ace/standards/*.md` other than the
  staging/archive files must go through the promotion routine.
