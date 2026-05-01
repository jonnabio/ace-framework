---
name: migration-logic
description: Procedural knowledge for safe data and schema migrations across environments with zero data loss.
---

# Skill: Migration Logic

> Procedural knowledge for safe data and schema migrations
> across environments with zero data loss.

---

## Purpose

Enable safe, reversible migrations that:
- Preserve data integrity
- Minimize downtime
- Support rollback at any stage
- Work across all environments

---

## Prerequisites

- [ ] Current schema/state documented
- [ ] Target schema/state defined
- [ ] Backup strategy confirmed
- [ ] Rollback plan prepared
- [ ] Stakeholder notification sent

---

## Migration Types

### 1. Database Schema Migration
Changes to table structure, columns, indexes, constraints.

### 2. Data Migration
Moving or transforming data between schemas or systems.

### 3. Application Migration
Moving application state, configuration, or dependencies.

### 4. Infrastructure Migration
Moving between servers, clouds, or environments.

---

## Procedures

### 1. Pre-Migration Checklist

```markdown
Before any migration:

â–¡ Backup
  - [ ] Full database backup completed
  - [ ] Backup verified (test restore)
  - [ ] Backup stored in separate location

â–¡ Documentation
  - [ ] Current state documented
  - [ ] Target state documented
  - [ ] Migration steps documented
  - [ ] Rollback steps documented

â–¡ Testing
  - [ ] Migration tested on copy of production data
  - [ ] Rollback tested
  - [ ] Performance impact assessed

â–¡ Communication
  - [ ] Stakeholders notified
  - [ ] Maintenance window scheduled (if needed)
  - [ ] Support team briefed

â–¡ Monitoring
  - [ ] Alerts configured
  - [ ] Health checks ready
  - [ ] Logs accessible
```

### 2. Schema Migration Patterns

#### Adding a Column (Safe)
```sql
-- Step 1: Add column as nullable
ALTER TABLE users ADD COLUMN phone VARCHAR(20) NULL;

-- Step 2: Backfill data (if needed)
UPDATE users SET phone = 'unknown' WHERE phone IS NULL;

-- Step 3: Add constraint (after backfill complete)
ALTER TABLE users ALTER COLUMN phone SET NOT NULL;
```

#### Removing a Column (Safe)
```sql
-- Step 1: Stop writing to column (deploy code change)
-- Step 2: Wait for all reads to stop
-- Step 3: Drop column
ALTER TABLE users DROP COLUMN deprecated_field;
```

#### Renaming a Column (Safe)
```sql
-- Step 1: Add new column
ALTER TABLE users ADD COLUMN full_name VARCHAR(255);

-- Step 2: Dual-write to both columns (deploy code)
-- Step 3: Backfill new column
UPDATE users SET full_name = name WHERE full_name IS NULL;

-- Step 4: Switch reads to new column (deploy code)
-- Step 5: Stop writing to old column (deploy code)
-- Step 6: Drop old column
ALTER TABLE users DROP COLUMN name;
```

#### Changing Column Type (Safe)
```sql
-- Step 1: Add new column with new type
ALTER TABLE orders ADD COLUMN amount_decimal DECIMAL(10,2);

-- Step 2: Dual-write (deploy code)
-- Step 3: Backfill
UPDATE orders SET amount_decimal = CAST(amount_int AS DECIMAL(10,2));

-- Step 4: Switch reads (deploy code)
-- Step 5: Drop old column
ALTER TABLE orders DROP COLUMN amount_int;

-- Step 6: Rename new column (optional)
ALTER TABLE orders RENAME COLUMN amount_decimal TO amount;
```

### 3. Data Migration Pattern

```markdown
Phase 1: PREPARE
â”œâ”€â”€ Document source schema
â”œâ”€â”€ Document target schema
â”œâ”€â”€ Create mapping specification
â”œâ”€â”€ Write transformation logic
â””â”€â”€ Create validation queries

Phase 2: EXTRACT
â”œâ”€â”€ Create extraction query/script
â”œâ”€â”€ Test on subset of data
â”œâ”€â”€ Validate extracted data
â””â”€â”€ Store in staging area

Phase 3: TRANSFORM
â”œâ”€â”€ Apply transformation logic
â”œâ”€â”€ Handle edge cases
â”œâ”€â”€ Validate transformed data
â””â”€â”€ Log transformation errors

Phase 4: LOAD
â”œâ”€â”€ Load to target in batches
â”œâ”€â”€ Verify row counts
â”œâ”€â”€ Validate data integrity
â””â”€â”€ Run consistency checks

Phase 5: VERIFY
â”œâ”€â”€ Compare source vs target counts
â”œâ”€â”€ Spot-check random records
â”œâ”€â”€ Run business logic validation
â””â”€â”€ Get stakeholder sign-off

Phase 6: CUTOVER
â”œâ”€â”€ Stop writes to source
â”œâ”€â”€ Final sync (if applicable)
â”œâ”€â”€ Switch application to target
â”œâ”€â”€ Monitor for issues
â””â”€â”€ Keep source available for rollback
```

### 4. Zero-Downtime Migration

```markdown
Strategy: Expand-Contract Pattern

EXPAND PHASE:
1. Deploy new schema alongside old
2. Deploy code that writes to both
3. Backfill new schema from old
4. Verify data consistency

CONTRACT PHASE:
5. Switch reads to new schema
6. Stop writes to old schema
7. Remove old schema
8. Clean up dual-write code
```

### 5. Rollback Procedures

```markdown
Immediate Rollback (< 5 minutes):
- Revert schema changes
- Restore from pre-migration backup
- Redeploy previous application version

Staged Rollback (> 5 minutes):
- Stop migration process
- Assess current state
- Determine partial rollback vs full
- Execute rollback scripts
- Verify system health
- Document what happened
```

---

## Migration Script Template

```sql
-- Migration: [DESCRIPTION]
-- Author: [NAME]
-- Date: [YYYY-MM-DD]
-- Ticket: [TICKET-ID]

-- ============================================
-- PRE-MIGRATION CHECKS
-- ============================================
-- Verify preconditions before proceeding

SELECT COUNT(*) as row_count FROM target_table;
-- Expected: [NUMBER]

-- ============================================
-- UP MIGRATION
-- ============================================

BEGIN TRANSACTION;

-- Step 1: [Description]
[SQL STATEMENT];

-- Step 2: [Description]
[SQL STATEMENT];

-- Verify migration success
SELECT COUNT(*) as new_count FROM target_table;
-- Expected: [NUMBER]

COMMIT;

-- ============================================
-- DOWN MIGRATION (ROLLBACK)
-- ============================================

-- BEGIN TRANSACTION;
--
-- -- Reverse Step 2
-- [ROLLBACK SQL];
--
-- -- Reverse Step 1
-- [ROLLBACK SQL];
--
-- COMMIT;

-- ============================================
-- POST-MIGRATION VERIFICATION
-- ============================================

-- Verify data integrity
[VERIFICATION QUERIES];
```

---

## Validation Checklist

After migration:

- [ ] Row counts match expectations
- [ ] No orphaned records
- [ ] Foreign keys valid
- [ ] Indexes present and used
- [ ] Constraints enforced
- [ ] Application functioning
- [ ] Performance acceptable
- [ ] No error logs
- [ ] Stakeholder verification

---

## Common Pitfalls

1. **No backup** - Always backup before migration
2. **No rollback plan** - Test rollback before you need it
3. **Big bang migration** - Prefer incremental changes
4. **Untested on prod data** - Use production-like data for testing
5. **No monitoring** - Watch for issues during migration
6. **Lock contention** - Large tables need special handling
7. **Timezone issues** - Be explicit about timestamps
8. **Character encoding** - Verify encoding compatibility
9. **Sequence gaps** - Reset sequences after data migration
10. **Missing indexes** - Recreate indexes post-migration

---

## Environment-Specific Notes

### Development
- Can be destructive
- Fast iteration
- Use seed data

### Staging
- Must mirror production process
- Test with production-like data
- Verify timing estimates

### Production
- Zero tolerance for data loss
- Minimize downtime
- Full rollback capability
- Stakeholder communication

---

## Invocation

```markdown
"Apply the migration logic skill from .ace/skills/migration-logic/SKILL.md
for this [schema | data | application] migration. Follow the
pre-migration checklist and create a complete migration plan with
rollback procedures."
```

---

*Skill Version: 1.0*


