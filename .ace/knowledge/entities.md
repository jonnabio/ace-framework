# Domain Entities

> Authored domain intent: responsibilities, invariants and relationships.
> Physical schema facts belong in the generated database reference.

## How to use

Explain what entities mean and why their invariants matter.
Link to `docs/database/reference/README.md` after reference generation is configured.
Do not duplicate columns, storage types, indexes or policies here.
Changes to the physical schema require migration-managed comments, regeneration and the docs gate.
Significant domain changes require an ADR.

## Entity narrative template

### Purpose

Describe the domain responsibility and ownership boundary.

### Relationships and lifecycle

Explain meaningful relationships and permitted state transitions.

### Invariants

Describe rules that must remain true, linking to business rules and relevant ADRs.

### Generated reference

Link the entity to its generated reference page after the documentation baseline is created.
The reference is generated and never hand-edited.

## Cross-references

- `.ace/knowledge/business-rules.md`: domain rules.
- `.ace/skills/database-documentation/SKILL.md`: documentation workflow.
- `docs/database/`: authored security intent and generated reference, once configured.
