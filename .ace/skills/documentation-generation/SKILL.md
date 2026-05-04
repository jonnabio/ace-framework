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

### 3. ACE Standard Documentation Pipeline

When prompted to "Document as per the ACE standard", execute this structured pipeline:

```markdown
Step 1: Context Aggregation
- Read `docs/context/ACTIVE_CONTEXT.md` to understand the completed task.
- Ingest relevant raw outputs, logs, or Jupyter notebooks generated during EXECUTION.

Step 2: Scientific Translation (Requires Scientific Expansion Pack)
- Activate the *Scientific Editor* role.
- Convert raw experimental results into academic-toned, publication-ready text.
- If external citations are needed, invoke `Paper Lookup` and `Citation Management` skills to find and properly format references.

Step 3: Visual & Structural Generation
- Use Mermaid.js to generate architectural, pipeline, or network diagrams.
- If data was analyzed, structure the results visually.

Step 4: Artifact Production
- Write the final output to the appropriate ACE standard artifact:
  - Task completion: `docs/planning/walkthrough.md`
  - Issue resolution: `docs/rca/RCA-XXX.md`
  - Experiment conclusion: `docs/research/experiment_results.md`

Step 5: Session Wrap-Up
- Update `docs/context/ACTIVE_CONTEXT.md` indicating documentation is complete.
- Request the user to review the generated artifact.
```

---

## Invocation

```markdown
"Apply the documentation-generation skill from .ace/skills/documentation-generation/SKILL.md
to add JSDoc comments and generate a Mermaid diagram for this module."
```

Or for the full pipeline:
```markdown
"Document as per the ACE standard."
```
