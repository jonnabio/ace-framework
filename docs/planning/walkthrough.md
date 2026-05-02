# Verification Walkthrough: [Feature/Task Name]

> **Status:** [Draft | Verified | Failed]
> **QA Engineer:** [Name/Session]
> **Date:** [YYYY-MM-DD]
> **Plan Reference:** [docs/planning/implementation_plan.md]

---

## Overview

[Brief description of what was verified and the approach taken]

---

## Test Environment

| Component | Version/Configuration |
|-----------|----------------------|
| OS | [Operating system] |
| Runtime | [Node/Python/etc version] |
| Database | [Database version] |
| Browser | [If applicable] |

---

## Verification Results

### Functional Testing

#### Test Case 1: [Name]
- **Requirement:** [FR-XXX from spec]
- **Steps:**
  1. [Step 1]
  2. [Step 2]
  3. [Step 3]
- **Expected:** [Expected result]
- **Actual:** [Actual result]
- **Status:** [PASS | FAIL]
- **Evidence:** [Screenshot/log reference]

#### Test Case 2: [Name]
- **Requirement:** [FR-XXX]
- **Steps:**
  1. [Step 1]
  2. [Step 2]
- **Expected:** [Expected result]
- **Actual:** [Actual result]
- **Status:** [PASS | FAIL]
- **Evidence:** [Screenshot/log reference]

---

### Edge Cases

#### Edge Case 1: [Description]
- **Scenario:** [What was tested]
- **Expected:** [Expected behavior]
- **Actual:** [Actual behavior]
- **Status:** [PASS | FAIL]

#### Edge Case 2: [Description]
- **Scenario:** [What was tested]
- **Expected:** [Expected behavior]
- **Actual:** [Actual behavior]
- **Status:** [PASS | FAIL]

---

### Error Handling

| Error Scenario | Expected Response | Actual Response | Status |
|----------------|-------------------|-----------------|--------|
| [Invalid input] | [Error message] | [Actual] | [PASS/FAIL] |
| [Network failure] | [Graceful handling] | [Actual] | [PASS/FAIL] |

---

### Performance

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Response time | < 200ms | [Value] | [PASS/FAIL] |
| Memory usage | < 100MB | [Value] | [PASS/FAIL] |

---

### Security Checklist

- [ ] Input validation tested
- [ ] Authentication verified
- [ ] Authorization verified
- [ ] No sensitive data exposed
- [ ] Error messages don't leak info

---

## Test Results Summary

| Category | Passed | Failed | Blocked |
|----------|--------|--------|---------|
| Functional | 0 | 0 | 0 |
| Edge Cases | 0 | 0 | 0 |
| Error Handling | 0 | 0 | 0 |
| Performance | 0 | 0 | 0 |
| Security | 0 | 0 | 0 |
| **Total** | **0** | **0** | **0** |

---

## Issues Found

### Issue 1: [Title]
- **Severity:** [Critical | High | Medium | Low]
- **Description:** [What's wrong]
- **Steps to Reproduce:**
  1. [Step 1]
  2. [Step 2]
- **Expected:** [Expected behavior]
- **Actual:** [Actual behavior]
- **Evidence:** [Screenshot/log]
- **Status:** [Open | Fixed | Won't Fix]

---

## Evidence

### Screenshots
- [Screenshot 1 description]: [link/path]
- [Screenshot 2 description]: [link/path]

### Logs
```
[Relevant log output]
```

---

## Conclusion

**Overall Status:** [VERIFIED | FAILED | BLOCKED]

**Summary:**
[Brief summary of verification results]

**Recommendation:**
- [ ] Ready for release
- [ ] Requires fixes (see Issues)
- [ ] Requires re-verification after fixes

---

## Sign-off

| Role | Name | Date | Approval |
|------|------|------|----------|
| QA Engineer | | | |
| Developer | | | |
| Product Owner | | | |

---

*Verification Walkthrough - ACE-Framework v2.3*
