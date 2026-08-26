# Business Rules

> Core business logic and constraints that must be enforced.
> These rules are immutable without explicit stakeholder approval.

---

## How to Use This Document

1. AI agents must check rules before implementing features
2. Code must enforce all applicable rules
3. Tests must verify rule compliance
4. Violations must be flagged immediately

---

## Rule Categories

### Critical Rules

Must never be violated. System should prevent these at all costs.

### Standard Rules

Normal business constraints. May have edge cases requiring human approval.

### Soft Rules

Guidelines that can be overridden with appropriate authorization.

---

## Rules Registry

### [Category]: [Domain Area]

#### BR-001: [Rule Name]

- **Priority:** [Critical | Standard | Soft]
- **Description:** [Clear description of the rule]
- **Rationale:** [Why this rule exists]
- **Enforcement:** [How/where to enforce]
- **Exceptions:** [Any allowed exceptions]
- **Example:**

  ```
  Valid: [example of valid case]
  Invalid: [example of invalid case]
  ```

---

## Example Rules

### User Management

#### BR-001: Unique Email

- **Priority:** Critical
- **Description:** Each user account must have a unique email address
- **Rationale:** Email is the primary identifier for authentication
- **Enforcement:** Database unique constraint + validation layer
- **Exceptions:** None
- **Example:**

  ```
  Valid: user1@example.com (no existing user with this email)
  Invalid: user1@example.com (email already registered)
  ```

#### BR-002: Password Complexity

- **Priority:** Critical
- **Description:** Passwords must be at least 12 characters with mixed case, numbers, and symbols
- **Rationale:** Security requirement for account protection
- **Enforcement:** Validation on registration and password change
- **Exceptions:** None
- **Example:**

  ```
  Valid: MyP@ssw0rd123!
  Invalid: password123
  ```

---

### Order Processing

#### BR-010: Minimum Order Value

- **Priority:** Standard
- **Description:** Orders must meet minimum value of $10.00 before checkout
- **Rationale:** Cost of processing small orders exceeds margin
- **Enforcement:** Checkout validation
- **Exceptions:** Promotional campaigns may lower minimum
- **Example:**

  ```
  Valid: Cart total $15.00 → proceed to checkout
  Invalid: Cart total $5.00 → show minimum order message
  ```

#### BR-011: Inventory Check

- **Priority:** Critical
- **Description:** Cannot sell more items than available in inventory
- **Rationale:** Prevent overselling and customer disappointment
- **Enforcement:** Real-time inventory check at checkout
- **Exceptions:** Pre-order items with expected restock date
- **Example:**

  ```
  Valid: Order 5 units, 10 in stock → approve
  Invalid: Order 5 units, 3 in stock → reject or partial
  ```

---

## Adding New Rules

1. Propose rule with business stakeholder
2. Document in this file with unique ID
3. Create tests that verify the rule
4. Implement enforcement in code
5. Update ADR if architecturally significant

---

## Rule Validation

When implementing features:

```markdown
Checklist:
- [ ] Identified all applicable business rules
- [ ] Each rule has enforcement in code
- [ ] Each rule has test coverage
- [ ] Edge cases documented
- [ ] Stakeholder approved any exceptions
```

---

## Cross-References

- [See: .ace/standards/security.md] for security-related rules
- [See: docs/adr/] for rule-related architectural decisions
- [See: .ace/knowledge/entities.md] for entity definitions

---

*Last Updated: [DATE]*
*Requires stakeholder approval to modify*
