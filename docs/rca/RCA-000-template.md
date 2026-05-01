# RCA-000: [Issue Title]

> **Status:** [Open | In Analysis | Resolved | Verified]
> **Severity:** [Critical | High | Medium | Low]
> **Created:** [YYYY-MM-DD]
> **Resolved:** [YYYY-MM-DD]
> **Owner:** [Name/Role]

---

## Issue Summary

**One-line description:** [Brief description of what went wrong]

**Impact:** [Who/what was affected and how severely]

**Detection:** [How was the issue discovered - testing, production, user report]

---

## Timeline

| Time | Event |
|------|-------|
| [YYYY-MM-DD HH:MM] | Issue first observed |
| [YYYY-MM-DD HH:MM] | Issue reported/escalated |
| [YYYY-MM-DD HH:MM] | Investigation started |
| [YYYY-MM-DD HH:MM] | Root cause identified |
| [YYYY-MM-DD HH:MM] | Fix implemented |
| [YYYY-MM-DD HH:MM] | Fix verified |

---

## Symptoms

[Describe what was observed - error messages, unexpected behavior, etc.]

```
[Include relevant error messages, logs, or stack traces]
```

---

## Root Cause Analysis

### The 5 Whys

1. **Why did the issue occur?**
   → [Answer]

2. **Why did [Answer 1] happen?**
   → [Answer]

3. **Why did [Answer 2] happen?**
   → [Answer]

4. **Why did [Answer 3] happen?**
   → [Answer]

5. **Why did [Answer 4] happen?**
   → [Root Cause]

### Root Cause Statement

[Clear, concise statement of the fundamental cause]

### Contributing Factors

- [Factor 1 that contributed to the issue]
- [Factor 2 that contributed to the issue]

---

## Resolution

### Immediate Fix

[What was done to resolve the immediate issue]

**Files Changed:**
- [file path]: [what changed]

**Commit:** [commit hash or PR link]

### Permanent Fix

[Long-term solution to prevent recurrence]

**Files Changed:**
- [file path]: [what changed]

**Commit:** [commit hash or PR link]

---

## Regression Prevention

### Tests Added

| Test Type | Description | File |
|-----------|-------------|------|
| Unit | [What it tests] | [path/to/test] |
| Integration | [What it tests] | [path/to/test] |
| E2E | [What it tests] | [path/to/test] |

### Standards Updated

- [ ] `.ace/standards/[file].md` updated with new rule
- [ ] Rule ID: [STD-XXX]

### Knowledge Base Updated

- [ ] `.ace/knowledge/` updated if domain logic involved
- [ ] Glossary updated if new terms introduced

### Regression Guard

```yaml
# Add to .ace/rca/regression-guards.yaml
- id: RCA-000
  description: [Brief description]
  check: [What to verify]
  files: [Files that should trigger review if changed]
  test: [Test that validates the fix]
```

---

## Verification

### Fix Verification

- [ ] Immediate fix tested and working
- [ ] Permanent fix tested and working
- [ ] Regression tests pass
- [ ] No new issues introduced

### Prevention Verification

- [ ] Tests added to CI/CD pipeline
- [ ] Standards updated and communicated
- [ ] Team aware of new constraints

---

## Lessons Learned

### What went well
- [Positive aspect of the response]

### What could improve
- [Area for improvement]

### Action items
- [ ] [Action to improve process]
- [ ] [Action to prevent similar issues]

---

## References

- **Related ADR:** [docs/adr/ADR-XXX.md]
- **Related RCA:** [docs/rca/RCA-XXX.md]
- **Specification:** [docs/requirements/XXX.md]
- **External:** [links to relevant documentation]

---

## Sign-off

| Role | Name | Date |
|------|------|------|
| Investigator | | |
| Reviewer | | |
| Approver | | |

---

*RCA Template - ACE-Framework v2.0*
