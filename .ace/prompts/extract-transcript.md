# Golden Prompt: Extract Requirements from Transcript

> Version: 1.0
> Success Rate: [Track after use]
> Last Updated: 2026-05-01

---

## Purpose

Use this prompt to transform raw, unstructured transcripts (meetings, interviews,
brainstorming sessions, stakeholder calls) into a formal, structured Requirements
Specification. This bridges the gap between human conversation and the BMAD
Analyze phase by extracting actionable signal from conversational noise.

---

## The Prompt

```markdown
You are an expert Requirements Analyst. I will provide a raw transcript
from a [meeting | interview | brainstorming session]. Your task is to
extract and structure ALL actionable requirements from it.

## Input

The transcript is located at: docs/inputs/transcripts/[TRANSCRIPT_FILE]

## Instructions

1. **Read the entire transcript** without bias. Do not skip informal segments —
   requirements are often embedded in tangential remarks, corrections, and
   asides.

2. **Identify and classify every requirement** using these categories:
   - **Functional Requirements (FR):** What the system must DO
   - **Non-Functional Requirements (NFR):** How the system must PERFORM
     (performance, security, scalability, accessibility, compliance)
   - **Constraints (CON):** Limitations imposed by stakeholders, technology,
     budget, or timeline
   - **Assumptions (ASM):** Statements treated as true without explicit
     confirmation

3. **Extract contextual metadata:**
   - Who said it (speaker attribution if identifiable)
   - Confidence level: EXPLICIT (directly stated) | INFERRED (derived from
     context) | AMBIGUOUS (unclear intent)
   - Priority hints: any language indicating urgency ("must have", "critical",
     "nice to have", "phase 2")

4. **Flag conflicts and ambiguities:**
   - Contradictory statements from different speakers
   - Vague requirements that need follow-up
   - Scope creep indicators (feature requests that contradict stated constraints)

5. **Produce a structured Requirements Specification** using this exact format:

   # Requirements Specification: [Derived Project/Feature Name]

   ## Metadata
   - **Source:** [transcript filename]
   - **Date of Session:** [if identifiable from transcript]
   - **Participants:** [list if identifiable]
   - **Extraction Date:** [today's date]
   - **Extracted By:** AI Requirements Analyst

   ## Executive Summary
   [2-3 sentence summary of what was discussed and the core objective]

   ## Stakeholders
   | Name/Role | Interest | Influence |
   |-----------|----------|-----------|
   | [Speaker] | [What they care about] | [Decision maker / Contributor / Observer] |

   ## Functional Requirements
   | ID | Requirement | Priority | Confidence | Source Quote | Speaker |
   |----|-------------|----------|------------|--------------|---------|
   | FR-001 | [Clear, testable statement] | Must/Should/Could | EXPLICIT/INFERRED | "[exact quote]" | [name] |

   ## Non-Functional Requirements
   | ID | Category | Requirement | Target | Confidence | Source Quote |
   |----|----------|-------------|--------|------------|--------------|
   | NFR-001 | [Performance/Security/...] | [Statement] | [Measurable target] | EXPLICIT/INFERRED | "[quote]" |

   ## Constraints
   | ID | Constraint | Type | Source Quote |
   |----|-----------|------|--------------|
   | CON-001 | [Limitation] | [Technical/Business/Timeline/Budget] | "[quote]" |

   ## Assumptions
   | ID | Assumption | Risk if Wrong |
   |----|-----------|---------------|
   | ASM-001 | [Statement assumed true] | [Impact if assumption is invalid] |

   ## Conflicts & Ambiguities
   | ID | Issue | Speakers | Resolution Needed |
   |----|-------|----------|-------------------|
   | AMB-001 | [Description of conflict or vagueness] | [Who] | [Suggested resolution path] |

   ## Out of Scope (Explicitly Mentioned)
   - [Items participants explicitly excluded]

   ## Open Questions
   - [ ] [Question that must be answered before implementation]

   ## Traceability
   [For each requirement, the Source Quote column provides direct
   traceability back to the original transcript.]

6. **Quality rules:**
   - Every requirement must be a single, testable statement
   - No compound requirements (split "X and Y" into FR-001 and FR-002)
   - Use active voice: "The system shall..." not "It would be nice if..."
   - Preserve original speaker intent — do not editorialize
   - When confidence is INFERRED, explain the reasoning briefly

Do not summarize or abbreviate. Extract EVERYTHING. Completeness is more
important than brevity. Save the output to docs/requirements/[OUTPUT_FILE].md
```

---

## When to Use

- After a stakeholder meeting or interview before starting the BMAD Analyze phase
- When onboarding to a project that has meeting recordings but no formal specs
- When converting tribal knowledge into structured requirements
- When a brainstorming session produces ideas that need formalization

---

## Variables to Replace

- `[TRANSCRIPT_FILE]` — Filename of the raw transcript in `docs/inputs/transcripts/`
- `[OUTPUT_FILE]` — Desired filename for the output (e.g., `REQ-001-user-auth`)
- `[meeting | interview | brainstorming session]` — Type of source session

---

## Expected Output

A complete Requirements Specification markdown file containing:

- All functional and non-functional requirements with IDs and traceability
- Stakeholder map with influence levels
- Explicit confidence ratings (EXPLICIT / INFERRED / AMBIGUOUS)
- Conflicts and ambiguities flagged for human resolution
- Direct quotes from the transcript for every extracted requirement

---

## Follow-up Prompts

After extraction is complete:

```markdown
"Review the extracted requirements in docs/requirements/[OUTPUT_FILE].md.
Identify any requirements marked AMBIGUOUS and suggest clarifying questions
I should ask the stakeholders."
```

To proceed to BMAD Analyze:

```markdown
"Requirements extraction complete. Use docs/requirements/[OUTPUT_FILE].md
as input for the Analyze phase. Apply the analyze-requirements prompt."
```

To refine a specific section:

```markdown
"Re-examine the transcript for additional [NFRs | security requirements |
performance constraints]. I think we may have missed some implicit ones."
```

---

## Anti-Patterns to Avoid

| Anti-Pattern | Why It's Bad | What to Do Instead |
|---|---|---|
| Summarizing instead of extracting | Loses detail and traceability | Extract every atomic requirement |
| Inventing requirements | Hallucinated reqs create false confidence | Only extract what's in the transcript |
| Compound requirements | Untestable, ambiguous scope | Split into atomic statements |
| Ignoring "throwaway" comments | Key requirements hide in casual remarks | Process the full transcript |
| Skipping confidence ratings | Team can't triage what needs follow-up | Always rate EXPLICIT/INFERRED/AMBIGUOUS |

---

## Changelog

- v1.0: Initial version — structured extraction with traceability

---

*Track usage and update success rate*
