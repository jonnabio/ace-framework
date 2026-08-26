# Architecture Standards

> Design patterns, structural principles, and architectural constraints.
> Changes require an ADR with team approval.

---

## Core Principles

### 1. Separation of Concerns

- Each module has one clear responsibility
- Business logic separated from infrastructure
- UI separated from data management
- Cross-cutting concerns handled via middleware/decorators

### 2. Dependency Direction

```
┌─────────────────────────────────────────┐
│           Presentation Layer            │
│         (UI, API Controllers)           │
└──────────────────┬──────────────────────┘
                   │ depends on
                   ▼
┌─────────────────────────────────────────┐
│           Application Layer             │
│      (Use Cases, Services, DTOs)        │
└──────────────────┬──────────────────────┘
                   │ depends on
                   ▼
┌─────────────────────────────────────────┐
│             Domain Layer                │
│    (Entities, Business Rules, Events)   │
└──────────────────┬──────────────────────┘
                   │ depends on
                   ▼
┌─────────────────────────────────────────┐
│          Infrastructure Layer           │
│   (Database, External APIs, Storage)    │
└─────────────────────────────────────────┘

Dependencies point INWARD (toward domain)
Domain has NO external dependencies
```

### 3. Interface Segregation

- Small, focused interfaces
- Clients depend only on what they use
- Prefer composition over inheritance

### 4. Explicit Dependencies

- No hidden dependencies
- Constructor/parameter injection
- Dependencies declared, not discovered

---

## Directory Structure

### Feature-Based Organization

```
src/
├── features/
│   ├── user/
│   │   ├── api/           # Controllers, routes
│   │   ├── application/   # Use cases, services
│   │   ├── domain/        # Entities, value objects
│   │   ├── infrastructure/# Repositories, external
│   │   └── index.ts       # Public API
│   └── order/
│       └── ...
├── shared/
│   ├── kernel/            # Shared domain primitives
│   ├── infrastructure/    # Shared infra (logging, etc.)
│   └── utils/             # Pure utility functions
└── main.ts                # Composition root
```

### Rules

- Features are independent modules
- Cross-feature communication via events or shared kernel
- No circular dependencies between features
- Shared code must be truly shared (2+ consumers)

---

## API Design

### REST Conventions

```
GET    /resources          # List
GET    /resources/:id      # Get one
POST   /resources          # Create
PUT    /resources/:id      # Full update
PATCH  /resources/:id      # Partial update
DELETE /resources/:id      # Delete

Nested resources:
GET    /users/:userId/orders
```

### Response Format

```json
{
  "data": {},
  "meta": {
    "timestamp": "ISO8601",
    "requestId": "uuid"
  },
  "errors": []
}
```

### Error Response

```json
{
  "errors": [
    {
      "code": "VALIDATION_ERROR",
      "message": "Human readable message",
      "field": "email",
      "details": {}
    }
  ]
}
```

### Versioning

- URL versioning: `/api/v1/resources`
- Major versions only
- Deprecation notices before removal

---

## Data Management

### Repository Pattern

```
┌───────────────┐     ┌───────────────┐     ┌───────────────┐
│   Service     │────▶│  Repository   │────▶│   Database    │
│               │     │  (Interface)  │     │               │
└───────────────┘     └───────────────┘     └───────────────┘
                             ▲
                             │ implements
                      ┌──────┴──────┐
                      │   Concrete  │
                      │   Repository│
                      └─────────────┘
```

### Rules

- Repositories handle persistence only
- Business logic stays in domain/services
- One repository per aggregate root
- Query methods return domain objects

### Database Transactions

- Transaction per use case
- Explicit transaction boundaries
- Rollback on any failure

---

## Error Handling Architecture

### Error Hierarchy

```
BaseError
├── DomainError (business rule violations)
│   ├── ValidationError
│   ├── NotFoundError
│   └── ConflictError
├── ApplicationError (use case failures)
│   ├── AuthenticationError
│   └── AuthorizationError
└── InfrastructureError (external failures)
    ├── DatabaseError
    └── ExternalServiceError
```

### Error Flow

```
Domain Layer → throws DomainError
     ↓
Application Layer → catches, wraps if needed
     ↓
Presentation Layer → maps to HTTP status
     ↓
Client → receives standardized error response
```

---

## Event-Driven Patterns

### When to Use Events

- Cross-feature communication
- Decoupled side effects
- Audit logging
- Async processing

### Event Structure

```typescript
interface DomainEvent {
  eventId: string;
  eventType: string;
  aggregateId: string;
  occurredAt: Date;
  payload: Record<string, unknown>;
}
```

### Rules

- Events are immutable
- Events are past tense (UserCreated, OrderPlaced)
- Handlers are idempotent
- Failed handlers don't block others

---

## Caching Strategy

### Cache Layers

```
Request → Local Cache → Distributed Cache → Database
```

### Cache Rules

- Cache at the highest appropriate level
- Clear invalidation strategy required
- TTL based on data volatility
- Cache keys must be deterministic

### What to Cache

- Expensive computations
- Frequently accessed data
- Rarely changing reference data

### What NOT to Cache

- User-specific sensitive data
- Rapidly changing data
- Data requiring real-time accuracy

---

## Configuration Management

### Configuration Hierarchy

```
1. Default values (code)
2. Configuration files (per environment)
3. Environment variables (runtime override)
4. Feature flags (dynamic)
```

### Rules

- All config externalized
- Secrets via environment variables only
- Feature flags for gradual rollouts
- Config validation at startup

---

## Testing Architecture

### Test Pyramid

```
        ┌───────────┐
        │   E2E     │  Few, critical paths
        ├───────────┤
        │Integration│  More, boundary testing
        ├───────────┤
        │   Unit    │  Many, fast, isolated
        └───────────┘
```

### Test Location

```
src/
├── features/
│   └── user/
│       ├── __tests__/        # Unit tests
│       └── user.service.ts
└── tests/
    ├── integration/          # Integration tests
    └── e2e/                  # End-to-end tests
```

---

## Deployment Architecture

### Requirements

- Containerized applications
- Environment parity (dev ≈ staging ≈ prod)
- Immutable deployments
- Health checks exposed

### Health Endpoints

```
GET /health        # Basic liveness
GET /health/ready  # Readiness (dependencies up)
GET /health/live   # Liveness (app responsive)
```

---

## Anti-Patterns to Avoid

1. **God Services** - Services doing too much
2. **Anemic Domain Model** - Entities without behavior
3. **Shared Mutable State** - Global variables
4. **Tight Coupling** - Direct dependencies on implementations
5. **Circular Dependencies** - A → B → A
6. **Leaky Abstractions** - Implementation details exposed
7. **Big Ball of Mud** - No clear structure
8. **Premature Optimization** - Optimizing before measuring

---

*Last Updated: [DATE]*
*Requires ADR to modify*
