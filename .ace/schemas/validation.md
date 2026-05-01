# Validation Schemas

> Schema definitions for validating AI-generated outputs
> and ensuring consistency across the project.

---

## Purpose

Define expected structures for common outputs to:
- Validate AI-generated content
- Ensure consistency across sessions
- Catch errors before they propagate

---

## How to Use

1. Before generating output, reference the relevant schema
2. After generation, validate against schema
3. Report any violations for correction

---

## Schema Definitions

### Implementation Plan Schema

```yaml
implementation_plan:
  required:
    - title: string
    - overview: string
    - prerequisites: array<string>
    - tasks: array<task>
    - verification: array<string>

  task:
    required:
      - number: integer
      - name: string
      - objective: string
      - files: object
      - tests: array<string>
      - acceptance_criteria: array<string>
      - complexity: enum[S, M, L]
      - dependencies: array<integer> | "None"
    optional:
      - notes: string

  constraints:
    - "tasks must be ordered by dependency"
    - "no task can depend on a higher-numbered task"
    - "every task must have at least one test"
    - "every task must have at least one acceptance criterion"
```

### ADR Schema

```yaml
adr:
  required:
    - number: integer (format: ###)
    - title: string
    - status: enum[Proposed, Accepted, Deprecated, Superseded]
    - date: string (format: YYYY-MM-DD)
    - context: string (min: 50 chars)
    - decision: string (min: 50 chars)
    - consequences: object

  consequences:
    required:
      - positive: array<string> (min: 1)
      - negative: array<string> (min: 1)
    optional:
      - neutral: array<string>

  optional:
    - alternatives: array<alternative>
    - compliance: string
    - references: array<string>

  constraints:
    - "number must be unique"
    - "status Superseded requires reference to new ADR"
    - "filename must match: ADR-{number}-{kebab-title}.md"
```

### Active Context Schema

```yaml
active_context:
  required:
    - task_name: string
    - last_updated: datetime
    - current_objective: string
    - current_state: object
    - next_steps: array<string>

  current_state:
    optional:
      - working: array<string>
      - in_progress: array<string>
      - blocked: array<blocked_item>

  blocked_item:
    required:
      - item: string
      - blocker: string

  optional:
    - session_id: string
    - active_persona: string (path to persona file)
    - completed_this_session: array<string>
    - active_constraints: object
    - open_questions: array<string>
    - session_notes: string

  constraints:
    - "next_steps must have 1-3 items"
    - "last_updated must be current session date"
```

### API Endpoint Documentation Schema

```yaml
api_endpoint:
  required:
    - method: enum[GET, POST, PUT, PATCH, DELETE]
    - path: string (format: /api/v{n}/...)
    - description: string
    - authentication: string
    - responses: object

  optional:
    - headers: array<header>
    - path_params: array<param>
    - query_params: array<param>
    - body: object
    - examples: array<example>

  header:
    required:
      - name: string
      - required: boolean
      - description: string

  param:
    required:
      - name: string
      - type: string
      - description: string
    optional:
      - required: boolean (default: true for path, false for query)
      - default: any

  responses:
    required:
      - success: response
    optional:
      - errors: array<error_response>

  constraints:
    - "path must start with /api/v"
    - "success response must include example"
    - "all error responses must have status code"
```

### Test Case Schema

```yaml
test_case:
  required:
    - describe: string (unit under test)
    - tests: array<test>

  test:
    required:
      - it: string (behavior description)
      - given: string | array<string> (preconditions)
      - when: string (action)
      - then: string | array<string> (assertions)
    optional:
      - notes: string

  constraints:
    - "it description must be in format: 'should [behavior] when [condition]'"
    - "describe must name the unit being tested"
```

### Requirements Specification Schema

```yaml
requirements_specification:
  required:
    - title: string
    - metadata: object
    - executive_summary: string
    - functional_requirements: array<requirement>
  optional:
    - stakeholders: array<stakeholder>
    - non_functional_requirements: array<nfr>
    - constraints: array<constraint>
    - assumptions: array<assumption>
    - conflicts: array<conflict>
    - out_of_scope: array<string>
    - open_questions: array<string>

  metadata:
    required:
      - source: string (transcript filename)
      - extraction_date: string (format: YYYY-MM-DD)
    optional:
      - session_date: string
      - participants: array<string>

  requirement:
    required:
      - id: string (format: FR-###)
      - description: string
      - priority: enum[Must, Should, Could]
      - confidence: enum[EXPLICIT, INFERRED, AMBIGUOUS]
    optional:
      - source_quote: string
      - speaker: string

  stakeholder:
    required:
      - name_or_role: string
      - interest: string
      - influence: enum[Decision maker, Contributor, Observer]

  constraint:
    required:
      - id: string (format: CON-###)
      - description: string
      - type: enum[Technical, Business, Timeline, Budget]

  conflict:
    required:
      - id: string (format: AMB-###)
      - issue: string
      - resolution_needed: string

  constraints:
    - "every requirement must have a unique ID"
    - "every requirement must have a confidence rating"
    - "no compound requirements (split into atomic statements)"
    - "EXPLICIT requirements must have a source_quote"
```

---

## Validation Commands

### Validate Implementation Plan
```markdown
"Validate IMPLEMENTATION_PLAN.md against the schema in
.ace/schemas/validation.md#implementation-plan-schema.
Report any violations."
```

### Validate ADR
```markdown
"Validate docs/adr/ADR-###-[name].md against the ADR schema
in .ace/schemas/validation.md. Report any violations."
```

### Validate Active Context
```markdown
"Validate docs/context/ACTIVE_CONTEXT.md against the schema
in .ace/schemas/validation.md. Report any violations."
```

---

## Custom Schemas

Add project-specific schemas below:

### [Schema Name]

```yaml
# Define schema here
```

---

*Last Updated: [DATE]*
