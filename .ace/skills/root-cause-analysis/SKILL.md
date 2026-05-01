---
name: root-cause-analysis
description: Procedural knowledge for investigating issues, identifying root causes, and implementing prevention measures.
---

# Skill: Root Cause Analysis

> Procedural knowledge for investigating issues, identifying
> root causes, and implementing prevention measures.

---

## Purpose

Enable systematic issue investigation that:
- Identifies true root causes, not just symptoms
- Implements permanent fixes
- Prevents regressions through guards and tests
- Improves the codebase over time

---

## Prerequisites

- [ ] Issue symptoms documented
- [ ] Access to logs and error messages
- [ ] Ability to reproduce the issue (if possible)
- [ ] Understanding of affected components

---

## Procedures

### 1. Issue Documentation

```markdown
Step 1: Capture symptoms
- What was observed?
- When did it occur?
- Who/what was affected?
- What was the impact?

Step 2: Gather evidence
- Error messages and stack traces
- Relevant logs
- Screenshots if applicable
- Steps to reproduce

Step 3: Create RCA document
- Use template: docs/rca/RCA-000-template.md
- Assign RCA number: RCA-[next number]
- Set initial status: "Open"
```

### 2. The 5 Whys Analysis

```markdown
Purpose: Drill down from symptom to root cause

Example:
1. Why did the user see an error?
   â†’ The API returned a 500 status

2. Why did the API return 500?
   â†’ An unhandled exception in the service layer

3. Why was the exception unhandled?
   â†’ No try-catch around the database call

4. Why was there no try-catch?
   â†’ The error handling pattern wasn't followed

5. Why wasn't the pattern followed?
   â†’ ROOT CAUSE: No automated check enforcing error handling

Continue asking "Why?" until you reach a systemic cause
that can be fixed with process/tooling changes.
```

### 3. Contributing Factor Analysis

```markdown
Identify factors that made the issue possible:

Technical Factors:
- Missing validation
- Inadequate error handling
- Race conditions
- Resource constraints

Process Factors:
- Missing tests
- Incomplete code review
- Unclear requirements
- Time pressure

Knowledge Factors:
- Undocumented behavior
- Missing domain knowledge
- Outdated documentation
```

### 4. Fix Implementation

```markdown
Immediate Fix (stop the bleeding):
- Minimum change to resolve immediate issue
- May be temporary or partial
- Document as "Immediate Fix" in RCA

Permanent Fix (prevent recurrence):
- Address root cause, not symptoms
- May require refactoring
- Must include tests
- Document as "Permanent Fix" in RCA
```

### 5. Regression Prevention

```markdown
Step 1: Add tests
- Unit test for the specific fix
- Integration test for the workflow
- Consider property-based tests for edge cases

Step 2: Update standards
- Add rule to .ace/standards/ if pattern was missing
- Reference RCA in the rule

Step 3: Create regression guard
- Add entry to docs/rca/regression-guards.yaml
- List all guarded files
- Define invariants that must remain true
- Link to tests that verify the fix

Step 4: Update knowledge base
- Add to glossary if new terms
- Update entities if domain model affected
- Document in business rules if logic changed
```

---

## 5 Whys Template

```markdown
## Issue: [Description]

### Why 1
**Question:** Why did [symptom] occur?
**Answer:** [Direct cause]

### Why 2
**Question:** Why did [answer 1] happen?
**Answer:** [Deeper cause]

### Why 3
**Question:** Why did [answer 2] happen?
**Answer:** [Deeper cause]

### Why 4
**Question:** Why did [answer 3] happen?
**Answer:** [Deeper cause]

### Why 5
**Question:** Why did [answer 4] happen?
**Answer:** [Root cause - systemic issue]

### Root Cause Statement
[Clear statement of the fundamental cause]
```

---

## Regression Guard Template

```yaml
- id: RCA-XXX
  title: "[Brief description]"
  severity: [critical|high|medium|low]
  created: YYYY-MM-DD
  rca_file: docs/rca/RCA-XXX-description.md

  guarded_files:
    - path/to/file1.ts
    - path/to/file2.ts

  invariants:
    - "Condition that must always be true"
    - "Another condition"

  tests:
    - tests/path/to/test.ts

  standard_rule: "RULE-ID in .ace/standards/xxx.md"

  review_triggers:
    - "Description of change type requiring review"
```

---

## Validation Checklist

After completing RCA:

- [ ] Root cause identified (not just symptoms)
- [ ] Immediate fix applied and tested
- [ ] Permanent fix applied and tested
- [ ] Regression tests added
- [ ] Standards updated if applicable
- [ ] Regression guard created
- [ ] RCA document complete
- [ ] Team notified of new constraints

---

## Common Pitfalls

1. **Stopping at symptoms** - Keep asking "Why?" until systemic cause
2. **Blame over systems** - Focus on process, not people
3. **No tests added** - Every fix needs a test
4. **No guard created** - Future changes may regress
5. **Incomplete documentation** - Future investigators need context
6. **Not updating standards** - Pattern violations will recur

---

## Severity Guidelines

| Severity | Criteria | Response Time |
|----------|----------|---------------|
| Critical | Data loss, security breach, system down | Immediate |
| High | Major feature broken, significant impact | < 24 hours |
| Medium | Feature degraded, workaround exists | < 1 week |
| Low | Minor issue, cosmetic, edge case | Next sprint |

---

## Invocation

```markdown
"Apply the root cause analysis skill from .ace/skills/root-cause-analysis/SKILL.md
for this issue. Perform 5 Whys analysis, identify the root cause,
and create a complete RCA document with regression prevention."
```

---

*Skill Version: 1.0*


