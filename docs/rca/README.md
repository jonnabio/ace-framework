# Root Cause Analysis (RCA) Directory

> Every issue is an opportunity to permanently improve the system.

---

## Purpose

This directory contains Root Cause Analysis documents that:
1. Document issues when they occur
2. Analyze the fundamental cause (not just symptoms)
3. Track fixes and prevention measures
4. Prevent regressions through guards and tests

---

## When to Create an RCA

Create an RCA for:
- [ ] Any bug that reaches production
- [ ] Any bug that causes data loss or corruption
- [ ] Any security vulnerability
- [ ] Any issue that took > 2 hours to debug
- [ ] Any issue that recurred after being "fixed"
- [ ] Any issue that violated established standards

---

## RCA Process

### 1. Immediate Response
```
Issue Detected → Document symptoms → Apply immediate fix
```

### 2. Root Cause Analysis
```
Use 5 Whys method → Identify root cause → Document contributing factors
```

### 3. Prevention
```
Add tests → Update standards → Create regression guard
```

### 4. Verification
```
Verify fix → Verify tests → Verify guards → Close RCA
```

---

## Files in This Directory

| File | Purpose |
|------|---------|
| `RCA-000-template.md` | Template for new RCAs |
| `regression-guards.yaml` | Registry of all regression guards |
| `RCA-###-*.md` | Individual RCA documents |

---

## Naming Convention

```
RCA-[NUMBER]-[short-description].md

Examples:
- RCA-001-sql-injection-user-search.md
- RCA-002-race-condition-order-processing.md
- RCA-003-memory-leak-image-upload.md
```

---

## Regression Guards

After every RCA, a regression guard MUST be added to `regression-guards.yaml`.

### Guard Components

1. **Guarded Files**: Files that contain the fix
2. **Invariants**: Conditions that must remain true
3. **Tests**: Tests that verify the fix
4. **Standard Rule**: Rule added to `.ace/standards/`
5. **Review Triggers**: Changes that should prompt review

### Using Guards

**Before modifying any file:**
```markdown
"Check docs/rca/regression-guards.yaml for guards on [file].
If guarded, review the associated RCA and ensure changes
do not violate the invariants."
```

**In code review:**
```markdown
"This PR modifies guarded files. Verify:
- [ ] RCA reviewed
- [ ] Invariants maintained
- [ ] Regression tests pass"
```

---

## Integration with Workflow

### Developer Role
- Check regression guards before modifying files
- Run regression tests after changes
- Flag potential guard violations in PRs

### QA Role
- Verify regression tests in walkthrough
- Validate guards are properly configured
- Test edge cases from historical RCAs

### Architect Role
- Review RCAs for architectural implications
- Update standards based on RCA findings
- Create ADRs for significant pattern changes

---

## Metrics

Track RCA effectiveness:

| Metric | Target |
|--------|--------|
| RCA completion time | < 48 hours |
| Regression rate | 0% |
| Test coverage for guards | 100% |
| Standards updated | 100% of RCAs |

---

## Cross-References

- [.ace/standards/](../../.ace/standards/) - Update with new rules
- [docs/adr/](../adr/) - Link related architectural decisions
- [.ace/feedback/log.md](../../.ace/feedback/log.md) - Initial incident log

---

*RCA System - ACE-Framework v2.3*
