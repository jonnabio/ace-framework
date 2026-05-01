---
name: database-operations
description: Procedural knowledge for database-related tasks including migrations, schema changes, and data operations.
---

# Skill: Database Operations

> Procedural knowledge for database-related tasks including
> migrations, schema changes, and data operations.

---

## Purpose

Enable safe, consistent database operations that maintain data integrity
and follow established patterns.

---

## Prerequisites

- [ ] Understanding of current database schema
- [ ] Access to database credentials (via environment)
- [ ] Knowledge of ORM/query builder in use
- [ ] Review of relevant ADRs for database decisions

---

## Procedures

### 1. Creating a Migration

```markdown
Step 1: Generate migration file
- Use framework's migration generator
- Name format: YYYYMMDD_HHMMSS_description.sql

Step 2: Write UP migration
- Add new tables/columns/indexes
- Use explicit types, not defaults
- Add comments for non-obvious columns

Step 3: Write DOWN migration
- Reverse all UP changes
- Ensure data preservation where possible
- Test rollback works correctly

Step 4: Test migration
- Run on empty database
- Run on copy of production data
- Verify rollback works

Step 5: Document
- Update .ace/knowledge/entities.md if schema changed
- Create ADR if significant change
```

### 2. Schema Change Checklist

```markdown
Before making schema changes:
- [ ] Impact assessment on existing queries
- [ ] Backup strategy confirmed
- [ ] Rollback plan documented
- [ ] Index analysis for new columns
- [ ] Foreign key implications understood
- [ ] Default values for existing rows

During migration:
- [ ] Lock acquisition strategy (if needed)
- [ ] Transaction boundaries defined
- [ ] Progress monitoring in place

After migration:
- [ ] Verify data integrity
- [ ] Check query performance
- [ ] Update entity documentation
```

### 3. Query Optimization

```markdown
When optimizing queries:

1. IDENTIFY
   - Run EXPLAIN/EXPLAIN ANALYZE
   - Check for full table scans
   - Identify missing indexes

2. ANALYZE
   - Review index usage
   - Check join order
   - Evaluate WHERE clause selectivity

3. OPTIMIZE
   - Add targeted indexes
   - Rewrite inefficient queries
   - Consider denormalization (with ADR)

4. VERIFY
   - Benchmark before/after
   - Test with production-like data
   - Monitor in staging
```

---

## Patterns

### Safe Column Addition
```sql
-- Always provide default for existing rows
ALTER TABLE users
ADD COLUMN status VARCHAR(20) DEFAULT 'active' NOT NULL;

-- Add index separately if table is large
CREATE INDEX CONCURRENTLY idx_users_status ON users(status);
```

### Safe Column Removal
```sql
-- Step 1: Remove from code first (deploy)
-- Step 2: Wait for traffic to clear
-- Step 3: Drop column
ALTER TABLE users DROP COLUMN deprecated_field;
```

### Safe Table Rename
```sql
-- Step 1: Create new table
-- Step 2: Dual-write to both
-- Step 3: Migrate data
-- Step 4: Switch reads to new
-- Step 5: Stop writes to old
-- Step 6: Drop old table
```

---

## Validation

After applying this skill, verify:

- [ ] Migration runs without error
- [ ] Rollback works correctly
- [ ] No data loss occurred
- [ ] Performance is acceptable
- [ ] Related queries still work
- [ ] Documentation updated

---

## Common Pitfalls

1. **No rollback tested** - Always test DOWN migration
2. **Missing indexes** - New columns queried need indexes
3. **Lock contention** - Large tables need careful migration
4. **Default values** - Forgetting defaults for NOT NULL columns
5. **Data type changes** - Can cause data loss or truncation
6. **Foreign keys** - Order of operations matters

---

## Invocation

```markdown
"Apply the database operations skill from .ace/skills/database-operations/SKILL.md
for this [migration | schema change | optimization] task. Follow the
checklist and validation steps."
```

---

*Skill Version: 1.0*


