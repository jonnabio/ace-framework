# Golden Prompt: Verify Implementation

> Version: 1.0
> Success Rate: [Track after use]
> Last Updated: [DATE]

---

## Purpose

Use this prompt in BMAD Phase 4 (Verify) after each task completion
to ensure code meets all standards and requirements.

---

## The Prompt

```markdown
Verify the implementation just completed against project standards.

## Verification Steps

1. **Check against coding standards** (.ace/standards/coding.md):
   - [ ] Naming conventions followed
   - [ ] Code structure appropriate
   - [ ] Error handling present
   - [ ] No prohibited patterns used

2. **Check against security standards** (.ace/standards/security.md):
   - [ ] No hardcoded secrets
   - [ ] Input validation present
   - [ ] Output encoding correct
   - [ ] Authentication/authorization checked

3. **Check against architecture standards** (.ace/standards/architecture.md):
   - [ ] Correct layer placement
   - [ ] Dependency direction correct
   - [ ] No circular dependencies
   - [ ] Patterns match existing code

4. **Check against ADRs** (docs/adr/*):
   - [ ] No conflicting patterns introduced
   - [ ] Decisions respected
   - [ ] New decisions documented if made

5. **Check against business rules** (.ace/knowledge/business-rules.md):
   - [ ] Applicable rules enforced
   - [ ] Edge cases handled

6. **Check tests**:
   - [ ] Tests written for new code
   - [ ] Tests pass
   - [ ] Edge cases covered
   - [ ] Coverage acceptable

## Report Format

```

# Verification Report: [Task Name]

## Standards Compliance

### Coding Standards

- Status: [PASS/FAIL]
- Issues: [None or list]

### Security Standards

- Status: [PASS/FAIL]
- Issues: [None or list]

### Architecture Standards

- Status: [PASS/FAIL]
- Issues: [None or list]

### ADR Compliance

- Status: [PASS/FAIL]
- Issues: [None or list]

### Business Rules

- Status: [PASS/FAIL]
- Issues: [None or list]

### Test Coverage

- Status: [PASS/FAIL]
- Coverage: [X%]
- Issues: [None or list]

## Overall Status

[APPROVED / NEEDS REVISION]

## Required Actions

- [Action if any issues found]

```

If any issues are found, do not proceed to the next task.
Fix issues first and re-verify.
```

---

## When to Use

- After completing each task in the implementation plan
- Before marking a task as complete
- Before committing code
- During code review

---

## Expected Output

A verification report that:

- Shows pass/fail for each category
- Lists specific issues found
- Provides overall approval status
- Lists required remediation actions

---

## Failure Handling

If verification fails:

```markdown
"Verification found issues that must be resolved:

1. [Issue]: [How to fix]
2. [Issue]: [How to fix]

Please fix these issues and request re-verification."
```

After fixes:

```markdown
"Issues have been addressed. Re-run verification for:
[List of categories that had failures]"
```

---

## Follow-up Prompts

After successful verification:

```markdown
"Verification passed.
- Commit changes with appropriate message
- Update ACTIVE_CONTEXT.md
- Proceed to next task in IMPLEMENTATION_PLAN.md"
```

If verification reveals need for ADR:

```markdown
"The implementation introduces a new pattern that should be documented.
Create ADR-[###]-[description].md to record this decision."
```

---

## Changelog

- v1.0: Initial version

---

*Track usage and update success rate*
