---
name: state-management
description: Procedural knowledge for managing application state, data flow, and avoiding race conditions.
---

# Skill: State Management

> Procedural knowledge for managing application state, 
> data flow, and avoiding race conditions.

---

## Purpose

Enable the Developer role to architect clean, predictable state transitions in frontend or backend systems, preventing bugs related to mutation and async race conditions.

---

## Prerequisites

- [ ] Application architecture understood
- [ ] Chosen state management paradigm identified (e.g., Redux, Context, stateless APIs)

---

## Procedures

### 1. Frontend State

```markdown
Step 1: State Localization
- Keep state as close to where it is used as possible.
- Avoid polluting global state (Redux/Context) with ephemeral UI state (e.g., modal open/close).

Step 2: Immutability
- Never mutate state directly. Always return a new object/array.
- Use predictable reducers for complex state transitions.

Step 3: Async State
- Explicitly model `loading`, `error`, and `success` states for data fetching.
- Handle race conditions (e.g., ignoring out-of-order network responses).
```

### 2. Backend / Distributed State

```markdown
Step 1: Statelessness
- Design API endpoints to be stateless where possible.
- Store session data in external stores (e.g., Redis), not in server memory.

Step 2: Concurrency Control
- Use Optimistic Concurrency Control (version numbers) or Pessimistic Locking for critical database updates to prevent lost updates.
- Ensure background jobs are idempotent.
```

---

## Invocation

```markdown
"Apply the state-management skill from .ace/skills/state-management/SKILL.md
to refactor the data flow in this React component."
```
