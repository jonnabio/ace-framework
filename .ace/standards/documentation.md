# Documentation Standards

> AI-optimized documentation guidelines ensuring machine-readability
> and hierarchical information access.

---

## Core Principles

### 1. Machine-Readable First
- Structured formats over prose
- Consistent patterns for parsing
- Explicit over implicit
- Scannable headers and sections

### 2. Hierarchical Access
- Most important information first
- Progressive detail disclosure
- Clear section boundaries
- Cross-reference links

### 3. Single Source of Truth
- One canonical location per topic
- References, not duplicates
- Version-controlled
- Dated updates

---

## Document Types

| Type | Location | Format | Purpose |
|------|----------|--------|---------|
| Specification | `docs/requirements/` | Markdown | Define requirements |
| Decision | `docs/adr/` | Markdown | Record choices |
| Context | `docs/context/` | Markdown | Session state |
| Standard | `.ace/standards/` | Markdown | Enforce rules |
| Skill | `.ace/skills/` | Markdown | Task procedures |
| Knowledge | `.ace/knowledge/` | Markdown | Domain context |

---

## Formatting Rules

### Headers
```markdown
# Document Title (H1 - one per document)

## Major Section (H2 - main topics)

### Subsection (H3 - subtopics)

#### Detail (H4 - specific items)
```

### Lists
```markdown
Prefer:
- Bullet points for unordered items
- Numbered lists for sequences
- Nested lists sparingly (max 2 levels)

Avoid:
- Long paragraphs
- Inline lists in prose
- Deep nesting
```

### Code
````markdown
Inline: Use `backticks` for code references

Blocks with language:
```typescript
const example: string = "typed";
```

Blocks for output:
```
Plain text output
```
````

### Tables
```markdown
| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| Data     | Data     | Data     |

Use tables for:
- Comparisons
- Reference data
- Structured attributes
```

### Cross-References
```markdown
Internal: [See: .ace/standards/security.md]
Section: [See: Architecture > API Design](#api-design)
External: [Documentation](https://example.com)
```

---

## Required Sections by Document Type

### Specification (PRD/Tech Spec)
```markdown
# Feature: [Name]

## Overview
[One paragraph summary]

## Goals
- [Primary goal]
- [Secondary goal]

## Non-Goals
- [Explicitly out of scope]

## Requirements

### Functional
- [FR-001] [Requirement]
- [FR-002] [Requirement]

### Non-Functional
- [NFR-001] [Requirement]

## Technical Design
[Architecture, data flow, etc.]

## Dependencies
- [External system/service]

## Open Questions
- [ ] [Question needing resolution]

## Success Criteria
- [Measurable outcome]
```

### Architecture Decision Record
```markdown
# ADR-###: [Title]

## Status
[Proposed | Accepted | Deprecated | Superseded]

## Date
[YYYY-MM-DD]

## Context
[Problem and constraints]

## Decision
[Specific choice]

## Consequences
### Positive
### Negative
### Neutral
```

### Active Context
```markdown
# Active Context: [Task]

## Session Metadata
- **Last Updated:** [Timestamp]
- **Active Persona:** [Persona file]

## Current Objective
[Specific goal]

## Current State
### Working
### In Progress
### Blocked

## Next Steps
1. [ ] [Task]

## Active Constraints
- [References to standards/ADRs]
```

---

## API Documentation

### Endpoint Documentation
```markdown
## POST /api/v1/users

Create a new user account.

### Request

**Headers:**
| Header | Required | Description |
|--------|----------|-------------|
| Authorization | Yes | Bearer token |
| Content-Type | Yes | application/json |

**Body:**
```json
{
  "email": "string (required)",
  "name": "string (required)",
  "role": "string (optional, default: 'user')"
}
```

### Response

**Success (201):**
```json
{
  "data": {
    "id": "uuid",
    "email": "string",
    "name": "string"
  }
}
```

**Errors:**
| Code | Description |
|------|-------------|
| 400 | Validation error |
| 409 | Email already exists |
```

---

## Code Documentation

### Function/Method
```typescript
/**
 * Brief description of what the function does.
 *
 * @param userId - The unique identifier of the user
 * @param options - Configuration options
 * @returns The user object or null if not found
 * @throws {NotFoundError} When user doesn't exist and strict mode is on
 *
 * @example
 * const user = await getUser('123', { includeDeleted: false });
 */
```

### Module/File Header
```typescript
/**
 * @module UserService
 * @description Handles user lifecycle operations including
 * creation, updates, and soft deletion.
 *
 * @see .ace/knowledge/entities.md#user
 * @see docs/adr/ADR-005-user-soft-delete.md
 */
```

---

## Changelog Format

```markdown
# Changelog

## [Unreleased]

### Added
- New feature description

### Changed
- Modification description

### Deprecated
- Feature to be removed

### Removed
- Deleted feature

### Fixed
- Bug fix description

### Security
- Security improvement

## [1.0.0] - YYYY-MM-DD

### Added
- Initial release features
```

---

## AI-Specific Guidelines

### Do
- Use consistent header hierarchy
- Include explicit cross-references
- Provide code examples
- Use tables for structured data
- Date all documents
- Keep sections focused

### Don't
- Write long prose paragraphs
- Use ambiguous language
- Assume context
- Duplicate information
- Use inconsistent formatting
- Leave sections empty

### Information Density
```
Optimal: One concept per section
Maximum: 500 words per major section
Headers: Every 100-200 words
```

---

## Review Checklist

Before committing documentation:

- [ ] Single H1 title
- [ ] Logical header hierarchy
- [ ] All code blocks have language tags
- [ ] Cross-references are valid
- [ ] Date/timestamp present
- [ ] No broken links
- [ ] Tables properly formatted
- [ ] Lists used instead of prose
- [ ] Consistent terminology
- [ ] Spelling/grammar checked

---

*Last Updated: [DATE]*
*Requires ADR to modify*
