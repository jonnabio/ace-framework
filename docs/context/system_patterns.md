# System Patterns

> Established patterns and conventions used in this codebase.
> AI agents should follow these patterns for consistency.

---

## Purpose

This document captures:

- Patterns already established in the codebase
- Conventions that should be followed
- Anti-patterns to avoid
- References to relevant ADRs

---

## Architecture Patterns

### Layer Structure

```
┌─────────────────────────────────────────┐
│           Presentation Layer            │
│      (Controllers, API Handlers)        │
│  - Input validation                     │
│  - Response formatting                  │
│  - Error transformation                 │
└──────────────────┬──────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────┐
│           Application Layer             │
│         (Services, Use Cases)           │
│  - Business workflow orchestration      │
│  - Transaction management               │
│  - Cross-cutting concerns               │
└──────────────────┬──────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────┐
│             Domain Layer                │
│     (Entities, Value Objects, Rules)    │
│  - Business logic                       │
│  - Domain events                        │
│  - Invariant enforcement                │
└──────────────────┬──────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────┐
│          Infrastructure Layer           │
│    (Repositories, External Services)    │
│  - Database access                      │
│  - External API calls                   │
│  - File system operations               │
└─────────────────────────────────────────┘
```

### Dependency Direction

Dependencies flow **inward** toward the domain layer:

- Presentation depends on Application
- Application depends on Domain
- Infrastructure depends on Domain
- Domain has **no external dependencies**

---

## Code Patterns

### Error Handling Pattern

```typescript
// Pattern: Custom Error Classes
class DomainError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly context?: Record<string, unknown>
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

class ValidationError extends DomainError {
  constructor(field: string, message: string) {
    super(message, 'VALIDATION_ERROR', { field });
  }
}

class NotFoundError extends DomainError {
  constructor(entity: string, id: string) {
    super(`${entity} not found: ${id}`, 'NOT_FOUND', { entity, id });
  }
}

// Usage
throw new NotFoundError('User', userId);
```

### Repository Pattern

```typescript
// Pattern: Interface in Domain, Implementation in Infrastructure
// Domain layer
interface UserRepository {
  findById(id: string): Promise<User | null>;
  save(user: User): Promise<void>;
  delete(id: string): Promise<void>;
}

// Infrastructure layer
class PostgresUserRepository implements UserRepository {
  constructor(private readonly db: Database) {}

  async findById(id: string): Promise<User | null> {
    const row = await this.db.query('SELECT * FROM users WHERE id = $1', [id]);
    return row ? this.toDomain(row) : null;
  }

  // ...
}
```

### Service Pattern

```typescript
// Pattern: Application Services orchestrate domain logic
class UserService {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly emailService: EmailService,
    private readonly eventBus: EventBus
  ) {}

  async registerUser(command: RegisterUserCommand): Promise<User> {
    // Validate
    await this.validateEmail(command.email);

    // Execute domain logic
    const user = User.create(command);

    // Persist
    await this.userRepo.save(user);

    // Side effects
    await this.emailService.sendWelcome(user.email);
    await this.eventBus.publish(new UserRegisteredEvent(user));

    return user;
  }
}
```

### Factory Pattern

```typescript
// Pattern: Factories for complex object creation
class UserFactory {
  static create(props: UserProps): User {
    // Validation
    if (!isValidEmail(props.email)) {
      throw new ValidationError('email', 'Invalid email format');
    }

    // Default values
    const user = new User({
      ...props,
      id: props.id ?? generateId(),
      status: props.status ?? 'pending',
      createdAt: props.createdAt ?? new Date(),
    });

    return user;
  }

  static reconstitute(data: UserData): User {
    // No validation, trusting stored data
    return new User(data);
  }
}
```

---

## API Patterns

### Request/Response Envelope

```typescript
// Pattern: Consistent API response structure
interface ApiResponse<T> {
  data: T;
  meta: {
    timestamp: string;
    requestId: string;
  };
}

interface ApiError {
  errors: Array<{
    code: string;
    message: string;
    field?: string;
  }>;
  meta: {
    timestamp: string;
    requestId: string;
  };
}

// Usage
res.json({
  data: user,
  meta: {
    timestamp: new Date().toISOString(),
    requestId: req.id,
  },
});
```

### Controller Pattern

```typescript
// Pattern: Thin controllers, delegate to services
class UserController {
  constructor(private readonly userService: UserService) {}

  async register(req: Request, res: Response): Promise<void> {
    try {
      const command = RegisterUserCommand.fromRequest(req.body);
      const user = await this.userService.registerUser(command);
      res.status(201).json({ data: user.toDTO() });
    } catch (error) {
      // Let error middleware handle it
      throw error;
    }
  }
}
```

### Middleware Pattern

```typescript
// Pattern: Middleware for cross-cutting concerns
const authMiddleware = async (req, res, next) => {
  try {
    const token = extractToken(req.headers.authorization);
    const user = await verifyToken(token);
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized' });
  }
};

const errorMiddleware = (error, req, res, next) => {
  if (error instanceof ValidationError) {
    return res.status(400).json({ errors: [error.toDTO()] });
  }
  if (error instanceof NotFoundError) {
    return res.status(404).json({ errors: [error.toDTO()] });
  }
  // Log and return generic error
  logger.error(error);
  res.status(500).json({ error: 'Internal server error' });
};
```

---

## Testing Patterns

### Test Structure

```typescript
// Pattern: Arrange-Act-Assert with descriptive names
describe('UserService', () => {
  describe('registerUser', () => {
    it('should create user with valid email', async () => {
      // Arrange
      const command = new RegisterUserCommand({
        email: 'test@example.com',
        name: 'Test User',
      });
      const userRepo = new InMemoryUserRepository();
      const service = new UserService(userRepo);

      // Act
      const user = await service.registerUser(command);

      // Assert
      expect(user.email).toBe('test@example.com');
      expect(await userRepo.findById(user.id)).toBeDefined();
    });

    it('should reject invalid email', async () => {
      // Arrange
      const command = new RegisterUserCommand({
        email: 'invalid',
        name: 'Test User',
      });

      // Act & Assert
      await expect(service.registerUser(command))
        .rejects
        .toThrow(ValidationError);
    });
  });
});
```

### Test Fixtures

```typescript
// Pattern: Factories for test data
const createTestUser = (overrides: Partial<UserProps> = {}): User => {
  return UserFactory.create({
    email: 'test@example.com',
    name: 'Test User',
    status: 'active',
    ...overrides,
  });
};

// Usage
const user = createTestUser({ status: 'pending' });
```

---

## File Organization

### Feature-Based Structure

```
src/
├── features/
│   ├── user/
│   │   ├── api/
│   │   │   ├── user.controller.ts
│   │   │   ├── user.routes.ts
│   │   │   └── user.middleware.ts
│   │   ├── application/
│   │   │   ├── user.service.ts
│   │   │   └── commands/
│   │   ├── domain/
│   │   │   ├── user.entity.ts
│   │   │   ├── user.repository.ts (interface)
│   │   │   └── user.events.ts
│   │   ├── infrastructure/
│   │   │   └── postgres-user.repository.ts
│   │   ├── __tests__/
│   │   │   ├── user.service.test.ts
│   │   │   └── user.controller.test.ts
│   │   └── index.ts (public API)
│   └── order/
│       └── ...
├── shared/
│   ├── kernel/
│   │   ├── entity.ts
│   │   ├── value-object.ts
│   │   └── domain-event.ts
│   └── infrastructure/
│       ├── database.ts
│       └── logger.ts
└── main.ts
```

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Files | kebab-case | `user-service.ts` |
| Classes | PascalCase | `UserService` |
| Functions | camelCase | `createUser` |
| Constants | SCREAMING_SNAKE | `MAX_RETRY_COUNT` |
| Interfaces | PascalCase (no I prefix) | `UserRepository` |
| Types | PascalCase | `UserProps` |
| Test files | `*.test.ts` or `*.spec.ts` | `user.service.test.ts` |

---

## Anti-Patterns to Avoid

### In This Codebase

1. **God Services** - Services with too many responsibilities
2. **Anemic Domain** - Entities without behavior
3. **Leaky Abstractions** - Infrastructure details in domain
4. **Circular Dependencies** - Modules depending on each other
5. **Magic Strings** - Unexplained string literals
6. **Silent Failures** - Catching and ignoring errors
7. **Direct DB in Controllers** - Bypassing service layer

### How to Fix

| Anti-Pattern | Fix |
|--------------|-----|
| God Service | Extract smaller services |
| Anemic Domain | Move logic into entities |
| Leaky Abstraction | Use interfaces at boundaries |
| Circular Dependency | Extract shared module |
| Magic String | Define as constant |
| Silent Failure | Handle or propagate error |
| DB in Controller | Use service layer |

---

## ADR References

Relevant architectural decisions:

- [ADR-001: ACE Framework Adoption](../adr/ADR-001-ace-framework-adoption.md)
- [ADR-XXX: Add as decisions are made]

---

## Pattern Updates

When introducing a new pattern:

1. Discuss with team
2. Document in this file
3. Create ADR if significant
4. Update existing code gradually
5. Add to code review checklist

---

*Last Updated: [DATE]*
*Update when patterns evolve*
