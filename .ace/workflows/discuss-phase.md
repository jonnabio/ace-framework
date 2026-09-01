# Workflow: Discuss Phase

**Trigger**: After `ANALYZE` and before `PLAN`.
**Role**: Architect
**Goal**: Eliminate ambiguity by capturing user preferences on implementation details ("gray areas") before technical planning.

## Process

1. **Identify Gray Areas**
    Review requirements and identify areas where multiple valid implementations exist (e.g., UI density, error handling style, library choices).

2. **Formulate Questions**
    Present options to the user clearly.
    _Example:_ "For the error handling, do you prefer a global toast notification system or inline error messages near the form fields?"

3. **Capture Decisions**
    Record the user's answers.

4. **Update Artifact**
    Create or update `docs/context/PROJECT_CONTEXT.md` with these decisions.

## Output Artifact: `docs/context/PROJECT_CONTEXT.md`

```markdown
# Project Context & Preferences

## Visual Style

- **Density**: Compact
- **Theme**: Dark Mode default
- **Component Lib**: Shadcn/UI

## API Design

- **Error Format**: Problem Details RFC 7807
- **Auth**: Bearer Token in Header

## Testing

- **Framework**: Vitest
- **Coverage Target**: 80%
```

## Transition

Once `PROJECT_CONTEXT.md` is updated, proceed to **PLAN** phase using these preferences as strict constraints.
