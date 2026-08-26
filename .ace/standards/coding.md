# Coding Standards

> Immutable rules governing code quality across the project.
> Changes require an ADR with team approval.

---

## General Principles

### 1. Readability First

- Code is read more than written
- Prefer explicit over implicit
- Self-documenting code over comments
- Comments explain "why", not "what"

### 2. Consistency

- Follow established patterns in the codebase
- When in doubt, match surrounding code style
- New patterns require ADR approval

### 3. Simplicity

- Solve the problem at hand, nothing more
- Avoid premature optimization
- Avoid premature abstraction
- YAGNI (You Aren't Gonna Need It)

---

## Naming Conventions

### Variables & Functions

```text
- Use descriptive, meaningful names
- Avoid abbreviations unless universally understood
- Boolean variables: use is*, has*, can*, should* prefixes
- Functions: use verb phrases (getUserById, calculateTotal)
```

### Files & Directories

```text
- Use kebab-case for file names: user-service.ts
- Use PascalCase for component files: UserProfile.tsx
- Group by feature, not by type
- Index files only for public API exports
```

### Constants

```text
- SCREAMING_SNAKE_CASE for true constants
- Prefer const objects over multiple exports
- Colocate with usage when single-use
```

---

## Code Structure

### Functions

- Single responsibility
- Maximum 30 lines (soft limit)
- Maximum 4 parameters (use object for more)
- Pure functions preferred
- Early returns over nested conditions

### Classes

- Single responsibility
- Composition over inheritance
- Keep state minimal
- Explicit dependency injection

### Modules

- Clear public API via index exports
- Internal implementation details stay private
- Circular dependencies are forbidden

---

## Error Handling

### Principles

- Fail fast, fail loud
- Never swallow errors silently
- Provide actionable error messages
- Include context in error messages

### Patterns

```text
DO:
- Validate inputs at boundaries
- Use typed errors/exceptions
- Log errors with stack traces
- Return meaningful error responses

DON'T:
- Catch and ignore
- Use generic error messages
- Expose internal details to users
- Use exceptions for control flow
```

---

## Testing Requirements

### Coverage

- New code requires tests
- Bug fixes require regression tests
- Critical paths require integration tests

### Test Quality

- Tests are documentation
- One assertion concept per test
- Descriptive test names
- Arrange-Act-Assert pattern

---

## Documentation

### Required Documentation

- Public API functions
- Complex algorithms
- Non-obvious business logic
- Configuration options

### Format

- JSDoc/docstrings for public APIs
- Inline comments for complex logic
- README for module-level overview

---

## Prohibited Patterns

The following are **never acceptable**:

1. **Magic numbers/strings** - Use named constants
2. **Deeply nested code** - Max 3 levels of nesting
3. **God objects/functions** - Break down responsibilities
4. **Copy-paste code** - Extract and reuse
5. **Commented-out code** - Delete it (git remembers)
6. **Console.log in production** - Use proper logging
7. **Any type (TypeScript)** - Use proper types
8. **Ignoring linter rules** - Fix or discuss in ADR

---

## Language-Specific Addendum

> Add language-specific rules below as needed

### TypeScript

- Strict mode enabled
- No `any` type without ADR justification
- Prefer interfaces over types for objects
- Use enums sparingly, prefer union types

### Python

- Type hints required for public functions
- Follow PEP 8
- Use dataclasses for data structures
- Prefer pathlib over os.path

### Go

- Follow Effective Go guidelines
- Error handling explicit
- Use context for cancellation
- Interfaces at consumer side

---

*Last Updated: [DATE]*
*Requires ADR to modify*
