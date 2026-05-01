---
name: testing-strategy
description: Procedural knowledge for designing and implementing comprehensive test suites at all levels.
---

# Skill: Testing Strategy

> Procedural knowledge for designing and implementing
> comprehensive test suites at all levels.

---

## Purpose

Create reliable, maintainable test suites that provide confidence
in code correctness without slowing down development.

---

## Prerequisites

- [ ] Understanding of testing framework in use
- [ ] Review .ace/standards/coding.md for test requirements
- [ ] Knowledge of what's being tested
- [ ] Access to test environment/fixtures

---

## Procedures

### 1. Test Planning

```markdown
Step 1: Identify test scope
- What component/feature is being tested?
- What are the critical paths?
- What are the edge cases?

Step 2: Determine test levels
- Unit tests for isolated logic
- Integration tests for boundaries
- E2E tests for critical journeys

Step 3: Define test cases
- Happy path scenarios
- Error/failure scenarios
- Edge cases and boundaries
- Security-relevant cases

Step 4: Prioritize
- Critical business logic first
- High-risk areas
- Frequently changing code
```

### 2. Writing Unit Tests

```markdown
Structure: Arrange-Act-Assert

describe('[Unit Under Test]', () => {
  describe('[method/scenario]', () => {
    it('should [expected behavior] when [condition]', () => {
      // Arrange - set up test data
      const input = createTestInput();

      // Act - execute the unit
      const result = unitUnderTest(input);

      // Assert - verify expectations
      expect(result).toEqual(expectedOutput);
    });
  });
});

Naming Convention:
- Describe the unit being tested
- Describe the scenario/method
- State expected behavior and condition
```

### 3. Writing Integration Tests

```markdown
Focus areas:
- API endpoints (request â†’ response)
- Database operations (CRUD)
- External service interactions
- Message queue handling

Structure:
1. Set up test database/state
2. Execute operation through real layers
3. Verify final state
4. Clean up

describe('POST /api/users', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  it('creates user and returns 201', async () => {
    const response = await request(app)
      .post('/api/users')
      .send({ email: 'test@example.com', name: 'Test' });

    expect(response.status).toBe(201);
    expect(response.body.data.id).toBeDefined();

    // Verify database state
    const user = await db.users.findById(response.body.data.id);
    expect(user.email).toBe('test@example.com');
  });
});
```

### 4. Writing E2E Tests

```markdown
Focus on critical user journeys:
- User registration â†’ login â†’ main action
- Complete purchase flow
- Core business workflows

Keep E2E tests:
- Minimal (only critical paths)
- Stable (avoid flaky selectors)
- Fast (parallel when possible)
- Independent (no shared state)

describe('User Registration Flow', () => {
  it('allows new user to register and login', async () => {
    await page.goto('/register');
    await page.fill('[data-testid="email"]', 'new@example.com');
    await page.fill('[data-testid="password"]', 'SecureP@ss123');
    await page.click('[data-testid="submit"]');

    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('[data-testid="welcome"]'))
      .toContainText('Welcome');
  });
});
```

---

## Test Patterns

### Test Data Builders
```typescript
// Create flexible test data
const createUser = (overrides = {}) => ({
  id: 'user-123',
  email: 'test@example.com',
  name: 'Test User',
  status: 'active',
  ...overrides
});

// Usage
const adminUser = createUser({ role: 'admin' });
const inactiveUser = createUser({ status: 'inactive' });
```

### Test Fixtures
```typescript
// Reusable setup
const fixtures = {
  validUser: { email: 'valid@example.com', password: 'Valid123!' },
  invalidEmail: { email: 'not-an-email', password: 'Valid123!' },
  weakPassword: { email: 'test@example.com', password: '123' }
};
```

### Mocking Strategy
```markdown
Mock:
- External services (APIs, payment processors)
- Time-dependent operations
- Random/non-deterministic behavior
- Expensive operations in unit tests

Don't Mock:
- The unit under test
- Simple value objects
- Anything in integration tests (use real)
```

---

## Coverage Guidelines

```markdown
| Metric     | Minimum | Target |
|------------|---------|--------|
| Statements | 80%     | 90%    |
| Branches   | 75%     | 85%    |
| Functions  | 90%     | 95%    |
| Lines      | 80%     | 90%    |

Focus coverage on:
- Business logic
- Error handling
- Edge cases

Don't obsess over:
- Simple getters/setters
- Configuration code
- Framework boilerplate
```

---

## Test Organization

```
src/
â”œâ”€â”€ features/
â”‚   â””â”€â”€ user/
â”‚       â”œâ”€â”€ user.service.ts
â”‚       â””â”€â”€ __tests__/
â”‚           â”œâ”€â”€ user.service.test.ts    # Unit tests
â”‚           â””â”€â”€ user.fixtures.ts        # Test data
â””â”€â”€ tests/
    â”œâ”€â”€ integration/
    â”‚   â””â”€â”€ api/
    â”‚       â””â”€â”€ users.test.ts           # API tests
    â”œâ”€â”€ e2e/
    â”‚   â””â”€â”€ user-journey.test.ts        # E2E tests
    â””â”€â”€ helpers/
        â”œâ”€â”€ database.ts                 # Test DB helpers
        â””â”€â”€ factories.ts                # Data factories
```

---

## Validation

After writing tests:

- [ ] All tests pass consistently
- [ ] No flaky tests
- [ ] Coverage thresholds met
- [ ] Tests are readable/maintainable
- [ ] Test data is realistic
- [ ] Edge cases covered
- [ ] Error scenarios tested
- [ ] Tests run fast enough

---

## Common Pitfalls

1. **Testing implementation** - Test behavior, not internals
2. **Flaky tests** - Avoid timing dependencies
3. **Shared state** - Tests should be independent
4. **Over-mocking** - Don't mock what you're testing
5. **Missing edge cases** - Boundaries are where bugs hide
6. **Slow tests** - Optimize or parallelize
7. **Brittle assertions** - Don't over-specify
8. **No negative tests** - Test what should fail

---

## Invocation

```markdown
"Apply the testing strategy skill from .ace/skills/testing-strategy/SKILL.md
for this [feature | bug fix | refactor]. Design appropriate test
coverage at unit, integration, and E2E levels as needed."
```

---

*Skill Version: 1.0*


