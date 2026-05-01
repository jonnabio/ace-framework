# Skill: Transcript Analysis

> Procedural knowledge for transforming raw, unstructured transcripts
> into formal Requirements Specifications using AI-assisted extraction.

---

## Purpose

Enable the Architect to convert meeting recordings, interview notes, and
brainstorming transcripts into structured, traceable requirements — feeding
high-quality input into the BMAD Analyze phase.

---

## Prerequisites

- [ ] Raw transcript available in `docs/inputs/transcripts/`
- [ ] Transcript is in plain text or markdown format
- [ ] Source session type identified (meeting, interview, brainstorm)
- [ ] Output filename decided (e.g., `REQ-001-feature-name.md`)
- [ ] Review `.ace/standards/documentation.md` for formatting requirements

---

## Procedures

### 1. Prepare the Transcript

```markdown
Step 1: Acquire the raw transcript
- Meeting recording → run through transcription service
- Manual notes → type up in plain text
- Existing document → copy as-is

Step 2: Place in designated directory
- Save to: docs/inputs/transcripts/[filename].md
- Use descriptive naming: YYYY-MM-DD-topic-participants.md

Step 3: Assess transcript quality
- Is the transcript complete (not truncated)?
- Are speakers identified? (helps attribution)
- Is the audio/text quality sufficient?
- Flag any known gaps or inaudible segments
```

### 2. Execute the Extraction

```markdown
Step 1: Load the golden prompt
- Read .ace/prompts/extract-transcript.md

Step 2: Configure variables
- Set [TRANSCRIPT_FILE] to the input filename
- Set [OUTPUT_FILE] to the desired output filename
- Set the session type (meeting | interview | brainstorming session)

Step 3: Run the extraction
- Apply the prompt against the full transcript
- Do NOT truncate or summarize the input — feed the complete text
- Allow the LLM to process the entire document before output

Step 4: Save the output
- Write to: docs/requirements/[OUTPUT_FILE].md
- Verify the file was created successfully
```

### 3. Validate the Output

```markdown
Step 1: Completeness check
- [ ] All sections present (Metadata, Stakeholders, FR, NFR, 
      Constraints, Assumptions, Conflicts, Open Questions)
- [ ] Every requirement has a unique ID
- [ ] Every requirement has a confidence rating
- [ ] Every requirement has a source quote
- [ ] No compound requirements (each FR/NFR is atomic)

Step 2: Quality check
- [ ] Requirements are testable (can you write acceptance criteria?)
- [ ] Requirements use active voice ("The system shall...")
- [ ] No invented/hallucinated requirements (all trace to quotes)
- [ ] Priorities reflect the language used by speakers
- [ ] Conflicts section captures genuine disagreements

Step 3: Coverage check
- [ ] Re-read the original transcript
- [ ] Verify no requirements were missed
- [ ] Check informal/tangential remarks for hidden requirements
- [ ] Verify out-of-scope items are correctly classified

Step 4: Stakeholder readiness
- [ ] Executive summary is accurate and concise
- [ ] Stakeholder map reflects actual influence levels
- [ ] Open questions are actionable (not vague)
- [ ] Document is ready for human review
```

### 4. Iterate if Needed

```markdown
If validation reveals gaps:

1. Identify the specific section with issues
2. Re-run extraction with a targeted follow-up prompt:
   "Re-examine the transcript for additional [category].
    Focus on [specific area of concern]."
3. Merge new findings into the existing specification
4. Re-validate the merged document

If conflicts are found:
1. Document each conflict in the Conflicts & Ambiguities section
2. Propose resolution paths
3. Flag for stakeholder review
4. Do NOT resolve conflicts unilaterally
```

---

## Output Artifacts

| Artifact | Location | Purpose |
|---|---|---|
| Requirements Specification | `docs/requirements/[OUTPUT_FILE].md` | Structured requirements for BMAD Analyze |
| Raw Transcript (preserved) | `docs/inputs/transcripts/[INPUT_FILE]` | Source traceability |

---

## Integration with BMAD

```
┌──────────────────────────────────────────────────────────────┐
│                  TRANSCRIPT → BMAD PIPELINE                  │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│   ┌───────────┐    ┌───────────┐    ┌───────────┐           │
│   │ TRANSCRIPT│───▶│  EXTRACT  │───▶│REQUIREMENTS│          │
│   │  (raw)    │    │  (skill)  │    │  (formal)  │          │
│   └───────────┘    └───────────┘    └─────┬─────┘           │
│                                           │                  │
│                                           ▼                  │
│                                    ┌───────────┐            │
│                                    │  ANALYZE  │            │
│                                    │ (BMAD P1) │            │
│                                    └─────┬─────┘            │
│                                          │                   │
│                                          ▼                   │
│                                   ┌───────────┐             │
│                                   │  DISCUSS  │             │
│                                   │ (BMAD P2) │             │
│                                   └───────────┘             │
│                                          │                   │
│                                          ▼                   │
│                                      ... PLAN → EXECUTE ...  │
└──────────────────────────────────────────────────────────────┘
```

This skill is a **pre-BMAD** activity. It produces the input that feeds Phase 1 (Analyze).

---

## Common Pitfalls

1. **Truncating the transcript** — LLMs may miss requirements in truncated input. Feed the full text.
2. **Accepting INFERRED as fact** — Inferred requirements must be validated by stakeholders before becoming firm.
3. **Skipping the re-read** — Always re-read the original transcript after extraction to catch misses.
4. **Over-engineering priorities** — Let speaker language drive priority. Don't impose MoSCoW unless speakers used it.
5. **Ignoring off-topic segments** — Requirements often appear in tangential discussions. Process everything.
6. **Merging without dedup** — When iterating, check for duplicate requirement IDs before merging.
7. **Single-pass assumption** — Complex transcripts (>30 min) may need multiple extraction passes for completeness.

---

## Validation

After completing the full procedure:

- [ ] Requirements spec saved to `docs/requirements/`
- [ ] All requirements have IDs, confidence ratings, and source quotes
- [ ] No compound or vague requirements remain
- [ ] Conflicts section is populated (or explicitly empty)
- [ ] Open questions are listed for stakeholder follow-up
- [ ] Original transcript is preserved in `docs/inputs/transcripts/`
- [ ] Output is ready to feed into BMAD Analyze phase

---

## Invocation

```markdown
"Apply the transcript analysis skill from .ace/skills/transcript-analysis.md
to process the transcript at docs/inputs/transcripts/[FILENAME].
Extract all requirements and save to docs/requirements/[OUTPUT_NAME].md."
```

---

*Skill Version: 1.0*
