# Domain Glossary

> Canonical definitions of domain terminology.
> AI agents should use these terms consistently.

---

## How to Use This Document

1. When encountering domain terms, check here first
2. Use exact terms in code (variable names, comments)
3. Use exact terms in documentation
4. Add new terms as they emerge (with team review)

---

## Terms

### A

**Aggregate**
A cluster of domain objects treated as a single unit for data changes. Has one root entity that controls access.

**Aggregate Root**
The entity that serves as the entry point to an aggregate. External objects can only hold references to the root.

---

### B

**Bounded Context**
A logical boundary within which a particular domain model is defined and applicable. Terms may have different meanings in different contexts.

**Business Rule**
A constraint or requirement that defines or constrains some aspect of the business. Must be enforced by the domain layer.

---

### C

**Command**
An action that changes state. Named imperatively (CreateUser, UpdateOrder). Should be idempotent when possible.

---

### D

**Domain Event**
A record of something significant that happened in the domain. Named in past tense (UserCreated, OrderShipped). Immutable.

**Domain Service**
A stateless operation that doesn't naturally belong to an entity or value object. Encapsulates domain logic that involves multiple aggregates.

**DTO (Data Transfer Object)**
A simple object used to transfer data between layers or systems. No business logic.

---

### E

**Entity**
A domain object with a unique identity that persists over time. Identity matters more than attributes.

**Event Sourcing**
Storing the state of an entity as a sequence of events rather than current state. Enables full audit trail.

---

### I

**Idempotent**
An operation that produces the same result regardless of how many times it's executed. Critical for retry safety.

**Invariant**
A condition that must always be true within an aggregate. Enforced by the aggregate root.

---

### P

**Projection**
A read model built from events. Optimized for queries rather than commands.

---

### Q

**Query**
A request for data that does not change state. Safe to retry. Should not have side effects.

---

### R

**Repository**
An abstraction that provides collection-like access to aggregates. Hides persistence details from the domain.

---

### S

**Saga**
A sequence of transactions that maintains consistency across multiple aggregates or services. Handles compensation on failure.

**Service (Application)**
Orchestrates domain objects to accomplish a use case. Contains no business logic itself.

---

### U

**Ubiquitous Language**
The practice of using the same terms in code, documentation, and conversation. Bridges technical and domain experts.

**Use Case**
A specific way users interact with the system to achieve a goal. Maps to application service methods.

---

### V

**Value Object**
A domain object defined by its attributes rather than identity. Immutable. Two value objects with same attributes are equal.

---

## ACE-Framework Terms

**Confidence Rating**
A classification assigned to each extracted requirement indicating how directly it was stated: EXPLICIT (directly stated), INFERRED (derived from context), or AMBIGUOUS (unclear intent, needs follow-up).

**Golden Prompt**
A tested, versioned prompt template stored in `.ace/prompts/` that produces reliable, structured output for a specific BMAD phase or task. Tracked with success rates.

**Requirements Specification**
A structured document produced by the transcript analysis skill, containing categorized functional requirements, non-functional requirements, constraints, assumptions, and conflicts â€” each with traceability back to source quotes.

**Transcript Analysis**
The process of extracting formal, structured requirements from raw unstructured transcripts (meetings, interviews, brainstorms). Executed by the Architect role using the `.ace/skills/transcript-analysis/SKILL.md` skill.

## Project-Specific Terms

> Add project-specific terminology below

### [Term]
[Definition]

### [Term]
[Definition]

---

## Term Changes

When modifying terms:
1. Update this glossary
2. Update code to match
3. Update documentation
4. Create ADR if significant

---

*Last Updated: [DATE]*

