# Golden Prompt: Analyze Requirements

> Version: 1.0
> Success Rate: [Track after use]
> Last Updated: [DATE]

---

## Purpose

Use this prompt at the start of BMAD Phase 1 (Analyze) to ensure
comprehensive understanding of requirements before planning.

---

## The Prompt

```markdown
I need to analyze requirements before implementation. Please:

1. **Read and summarize** the requirements in docs/requirements/[SPEC_FILE].md
   - What is the core objective?
   - Who are the stakeholders/users?
   - What are the success criteria?

2. **Identify constraints** from:
   - .ace/standards/coding.md (coding rules)
   - .ace/standards/security.md (security requirements)
   - .ace/standards/architecture.md (structural patterns)
   - docs/adr/* (existing architectural decisions)

3. **Extract business rules** that apply from:
   - .ace/knowledge/business-rules.md
   - .ace/knowledge/entities.md (affected entities)

4. **List unknowns and questions**:
   - What is ambiguous in the requirements?
   - What decisions need to be made?
   - What dependencies are unclear?

5. **Generate a `docs/progress/tasks.json` file**:
   - Break down the implementation into atomic tasks.
   - Format: `[{"id": "T1", "description": "...", "status": "pending", "criteria": "..."}]`

6. **Summarize in this format**:

   ## Analysis Summary

   ### Objective
   [One sentence summary]

   ### Key Requirements
   - [Requirement 1]
   - [Requirement 2]

   ### Applicable Constraints
   - [Standard/ADR]: [Specific constraint]

   ### Affected Entities
   - [Entity]: [How affected]

   ### Open Questions
   - [ ] [Question needing resolution]

   ### Ready for Planning
   [Yes/No - with blockers if No]

Do not proceed to implementation planning until I confirm the
analysis is complete and accurate. You MUST output the `tasks.json` file as part of your analysis.
```

---

## When to Use

- Start of any new feature implementation
- Before significant code changes
- When requirements document is updated
- When onboarding to existing task

---

## Variables to Replace

- `[SPEC_FILE]` - The specific specification file to analyze

---

## Expected Output

A structured analysis document that:
- Confirms understanding of requirements
- Lists all applicable constraints
- Identifies gaps requiring clarification
- Provides clear go/no-go for planning phase

---

## Follow-up Prompts

If analysis reveals questions:
```markdown
"Before proceeding, I need clarification on:
1. [Question 1]
2. [Question 2]

Please provide answers or point me to relevant documentation."
```

After analysis is confirmed:
```markdown
"Analysis confirmed. Proceed to BMAD Phase 2: Planning.
Generate an IMPLEMENTATION_PLAN.md based on this analysis."
```

---

## Changelog

- v1.0: Initial version

---

*Track usage and update success rate*
