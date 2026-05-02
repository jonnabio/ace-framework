---
name: documentation-generation
description: Procedural knowledge for generating and maintaining code documentation, API specs, and architecture diagrams.
---

# Skill: Documentation Generation

> Procedural knowledge for generating and maintaining 
> code documentation, API specs, and architecture diagrams.

---

## Purpose

Enable the Developer and Scientific Editor roles to keep documentation synchronized with code, leveraging automated generation tools where possible.

---

## Prerequisites

- [ ] Target documentation format identified (Markdown, OpenAPI, JSDoc)
- [ ] Understanding of the ACE Framework documentation standards (`.ace/standards/documentation.md`)

---

## Procedures

### 1. Code-Level Documentation

```markdown
Step 1: Inline Documentation
- Write docstrings/JSDoc for all public functions, classes, and complex logic.
- Explain *why* the code does something, not *what* it does (unless the what is highly complex).
- Document function parameters, return types, and potential exceptions.

Step 2: README Maintenance
- Ensure `README.md` is updated when new features or setup steps are introduced.
- Include usage examples and environment variable requirements.
```

### 2. System-Level Documentation

```markdown
Step 1: API Specifications
- Maintain OpenAPI/Swagger specifications for REST endpoints.
- Ensure schemas, parameters, and error codes are accurately described.

Step 2: Architectural Diagrams
- Use Mermaid.js within Markdown files to visualize complex flows, state machines, or data pipelines.
- Keep ADRs (Architecture Decision Records) updated for major changes.
```

---

## Invocation

```markdown
"Apply the documentation-generation skill from .ace/skills/documentation-generation/SKILL.md
to add JSDoc comments and generate a Mermaid diagram for this module."
```
