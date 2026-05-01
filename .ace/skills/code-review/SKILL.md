---
name: code-review
description: Procedural knowledge for conducting thorough, constructive code reviews that improve quality and share knowledge.
---

# Skill: Code Review

> Procedural knowledge for conducting thorough, constructive
> code reviews that improve quality and share knowledge.

---

## Purpose

Enable effective code reviews that:
- Catch bugs and issues before merge
- Ensure standards compliance
- Share knowledge across the team
- Improve code quality over time
- Verify regression guard compliance

---

## Prerequisites

- [ ] Code is complete and tests pass
- [ ] Self-review performed by author
- [ ] PR/MR description is complete
- [ ] Relevant context (spec, ADR) available
- [ ] Regression guards checked

---

## Review Process

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                   CODE REVIEW FLOW                      â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚                                                         â”‚
â”‚   â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”         â”‚
â”‚   â”‚ CONTEXT  â”‚â”€â”€â”€â–¶â”‚  REVIEW  â”‚â”€â”€â”€â–¶â”‚ FEEDBACK â”‚         â”‚
â”‚   â”‚  GATHER  â”‚    â”‚   CODE   â”‚    â”‚  SUBMIT  â”‚         â”‚
â”‚   â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜    â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜    â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜         â”‚
â”‚                         â”‚                               â”‚
â”‚                         â–¼                               â”‚
â”‚                   â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”                          â”‚
â”‚                   â”‚  VERIFY  â”‚                          â”‚
â”‚                   â”‚  FIXES   â”‚                          â”‚
â”‚                   â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜                          â”‚
â”‚                                                         â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### Phase 1: Context Gathering

```markdown
Before reviewing code:

1. Read the PR/MR description
   - What problem does this solve?
   - What approach was taken?
   - Are there known limitations?

2. Check related documents
   - Specification (docs/specs/)
   - Implementation plan (docs/planning/)
   - Related ADRs (docs/adr/)

3. Check regression guards
   - Are any guarded files modified?
   - What invariants must be maintained?
   - What regression tests should pass?

4. Understand the scope
   - How many files changed?
   - What's the risk level?
   - Is this a refactor or new feature?
```

### Phase 2: Code Review

#### Review Order

```markdown
1. Architecture (big picture)
   - Does the design fit the system?
   - Are responsibilities correctly placed?
   - Any circular dependencies?

2. Logic (correctness)
   - Does the code do what it's supposed to?
   - Are edge cases handled?
   - Is error handling appropriate?

3. Standards (compliance)
   - .ace/standards/coding.md
   - .ace/standards/security.md
   - .ace/standards/architecture.md

4. Tests (coverage)
   - Are tests adequate?
   - Do tests cover edge cases?
   - Are tests maintainable?

5. Documentation (clarity)
   - Is complex logic explained?
   - Are public APIs documented?
   - Is the PR description complete?

6. Guards (regression prevention)
   - Are invariants maintained?
   - Do regression tests pass?
   - Any new guards needed?
```

### Phase 3: Feedback

#### Comment Types

| Type | Prefix | Meaning |
|------|--------|---------|
| Blocking | `[BLOCKING]` | Must fix before merge |
| Suggestion | `[SUGGESTION]` | Consider this improvement |
| Question | `[QUESTION]` | Need clarification |
| Nitpick | `[NIT]` | Minor style preference |
| Praise | `[PRAISE]` | Good work, worth noting |

#### Feedback Guidelines

```markdown
DO:
- Be specific about what and why
- Suggest alternatives, not just problems
- Reference standards when applicable
- Acknowledge good work
- Ask questions to understand intent

DON'T:
- Be vague ("this is wrong")
- Attack the person ("you always...")
- Bikeshed minor style issues
- Block on personal preferences
- Leave comments without context
```

### Phase 4: Verification

```markdown
After author addresses feedback:

1. Verify blocking issues resolved
2. Run tests locally if significant changes
3. Check regression tests pass
4. Confirm guard compliance
5. Approve or request more changes
```

---

## Review Checklists

### Security Review

```markdown
- [ ] No hardcoded secrets or credentials
- [ ] Input validation on all external data
- [ ] Output encoding for user-facing content
- [ ] SQL queries use parameterization
- [ ] Authentication/authorization checked
- [ ] Sensitive data not logged
- [ ] Error messages don't leak info
- [ ] Dependencies are current/secure
```

### Performance Review

```markdown
- [ ] No N+1 query patterns
- [ ] Appropriate caching used
- [ ] Large operations are paginated
- [ ] Async operations where appropriate
- [ ] No memory leaks (cleanup handlers)
- [ ] Database indexes considered
```

### Maintainability Review

```markdown
- [ ] Code is readable without comments
- [ ] Functions are single-purpose
- [ ] No excessive nesting
- [ ] No magic numbers/strings
- [ ] Consistent naming conventions
- [ ] DRY principle followed
- [ ] No dead code
```

### Test Review

```markdown
- [ ] Happy path tested
- [ ] Error cases tested
- [ ] Edge cases tested
- [ ] Tests are independent
- [ ] Test names describe behavior
- [ ] No flaky tests
- [ ] Mocks are minimal
```

### Regression Guard Review

```markdown
- [ ] Modified files checked against guards
- [ ] Invariants verified maintained
- [ ] Regression tests included and passing
- [ ] New guards added if needed
- [ ] RCA referenced if applicable
```

---

## PR/MR Description Template

```markdown
## Summary
[Brief description of changes]

## Type
- [ ] Feature
- [ ] Bug fix
- [ ] Refactor
- [ ] Documentation
- [ ] Other: ___

## Related
- Spec: [link]
- ADR: [link]
- Issue: [link]

## Changes
- [Change 1]
- [Change 2]

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing performed

## Regression Guards
- [ ] Checked modified files against guards
- [ ] Invariants maintained: [list]
- [ ] Regression tests: [list]

## Screenshots
[If UI changes]

## Checklist
- [ ] Self-review completed
- [ ] Tests pass
- [ ] Documentation updated
- [ ] No security issues
```

---

## Review Response Template

```markdown
## Review Summary

**Verdict:** [Approve | Request Changes | Comment]

### Blocking Issues
- [ ] [File:line] - [Issue description]

### Suggestions
- [File:line] - [Suggestion]

### Questions
- [Question needing clarification]

### Positives
- [What was done well]

### Regression Guards
- [ ] Guard compliance verified
- [ ] Invariants maintained
```

---

## Time Guidelines

| PR Size | Review Time |
|---------|-------------|
| XS (< 50 lines) | 15-30 min |
| S (50-200 lines) | 30-60 min |
| M (200-500 lines) | 1-2 hours |
| L (500-1000 lines) | 2-4 hours |
| XL (> 1000 lines) | Consider splitting |

---

## Common Issues to Watch

1. **Silent failures** - Catching and ignoring errors
2. **Missing validation** - Trusting external input
3. **Race conditions** - Concurrent access issues
4. **Resource leaks** - Unclosed connections/handles
5. **Hardcoded values** - Config that should be external
6. **Breaking changes** - API changes without versioning
7. **Missing tests** - New code without coverage
8. **Guard violations** - Changes that break invariants

---

## Invocation

```markdown
"Apply the code review skill from .ace/skills/code-review/SKILL.md
for this PR/code change. Follow the review checklist and provide
structured feedback. Check regression guards for modified files."
```

---

*Skill Version: 1.0*


