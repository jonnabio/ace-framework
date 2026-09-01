# Domain Entities

> Canonical definitions of domain entities and their relationships.
> This is the source of truth for domain modeling.

---

## How to Use This Document

1. Reference when designing database schemas
2. Reference when creating DTOs and interfaces
3. Ensure code entities match these definitions
4. Update when domain model changes (with ADR)

---

## Entity Definitions

### Template

```markdown
## [Entity Name]

### Description
[What this entity represents in the domain]

### Type
[Aggregate Root | Entity | Value Object]

### Attributes
| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| id | UUID | Yes | Unique identifier |
| ... | ... | ... | ... |

### Relationships
- [relationship type] [related entity]: [description]

### Invariants
- [Rule that must always be true]

### Lifecycle
[Created when] → [States/transitions] → [Terminated when]

### Business Rules
- [BR-XXX]: [Reference to business rule]
```

---

## Core Entities

### User

#### Description

A person who interacts with the system. Can have various roles and permissions.

#### Type

Aggregate Root

#### Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| id | UUID | Yes | Unique identifier |
| email | String | Yes | Login identifier (unique) |
| passwordHash | String | Yes | Hashed password |
| name | String | Yes | Display name |
| role | Enum | Yes | User role (admin, user, guest) |
| status | Enum | Yes | Account status (active, suspended, deleted) |
| createdAt | DateTime | Yes | Account creation timestamp |
| updatedAt | DateTime | Yes | Last modification timestamp |
| lastLoginAt | DateTime | No | Last successful login |

#### Relationships

- Has many **Sessions**: Active login sessions
- Has many **Orders**: Orders placed by user
- Has one **Profile**: Extended user information

#### Invariants

- Email must be unique across all users
- Password must meet complexity requirements
- Cannot delete user with pending orders

#### Lifecycle

Created (registration) → Active → Suspended (violation) → Active (reinstated) OR Deleted (request)

#### Business Rules

- [BR-001]: Unique Email
- [BR-002]: Password Complexity

---

## Value Objects

### Address

#### Description

A physical or mailing address. Immutable.

#### Type

Value Object

#### Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| street | String | Yes | Street address |
| city | String | Yes | City name |
| state | String | Yes | State/province |
| postalCode | String | Yes | Postal/ZIP code |
| country | String | Yes | Country code (ISO) |

#### Validation Rules

- Postal code format must match country
- Country must be valid ISO code

---

### Money

#### Description

A monetary value with currency. Immutable.

#### Type

Value Object

#### Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| amount | Decimal | Yes | Numeric value |
| currency | String | Yes | Currency code (ISO 4217) |

#### Validation Rules

- Amount cannot be negative (use separate type for debits)
- Currency must be valid ISO 4217 code
- Operations between different currencies forbidden

---

## Entity Relationships Diagram

```text
┌──────────────────────────────────────────────────────────────┐
│                     ENTITY RELATIONSHIPS                     │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│   ┌──────────┐         ┌──────────┐         ┌──────────┐    │
│   │   User   │────────▶│  Order   │────────▶│OrderItem │    │
│   │          │ 1    *  │          │ 1    *  │          │    │
│   └──────────┘         └──────────┘         └──────────┘    │
│        │                    │                     │          │
│        │ 1                  │ 1                   │ *        │
│        ▼                    ▼                     ▼          │
│   ┌──────────┐         ┌──────────┐         ┌──────────┐    │
│   │ Profile  │         │ Payment  │         │ Product  │    │
│   │          │         │          │         │          │    │
│   └──────────┘         └──────────┘         └──────────┘    │
│                                                              │
│   Legend:                                                    │
│   ─────▶  Has relationship                                   │
│   1    *  One to many                                        │
│   1    1  One to one                                         │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## Aggregates

### User Aggregate

- Root: User
- Contains: Profile, Sessions
- Boundary: User data and authentication

### Order Aggregate

- Root: Order
- Contains: OrderItems, Payment
- Boundary: Single order transaction

---

## Adding/Modifying Entities

1. Propose change with domain expert
2. Update this document
3. Create ADR if significant
4. Update database migrations
5. Update code models
6. Update tests

---

## Cross-References

- [See: .ace/knowledge/glossary.md] for term definitions
- [See: .ace/knowledge/business-rules.md] for entity rules
- [See: .ace/standards/architecture.md] for modeling patterns

---

*Last Updated: [DATE]*
*Requires ADR for significant changes*
