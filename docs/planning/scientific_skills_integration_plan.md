# Integration Plan: ACE Framework & Scientific Agent Skills

**Date:** 2026-05-03
**Role:** The Architect
**Status:** Proposed

## Objective
To seamlessly integrate the `scientific-agent-skills` repository into the ACE Framework, upgrading its documentation to reflect these new capabilities, and to establish a standard pipeline for the documentation skill when a user invokes "Document as per the ACE standard."

---

## Phase 1: The "Expansion Pack" Architecture

To maintain the ACE Framework's lightweight core, `scientific-agent-skills` will be managed as an **Expansion Pack**. This modular approach ensures that the base framework remains agnostic, while allowing domain-specific capabilities to be cleanly "plugged in" when needed.

### 1. Update Core Documentation (`CLAUDE.md`, `.cursorrules`)
- Introduce the concept of **ACE Expansion Packs**.
- Add a subsection for the **Scientific Expansion Pack** (`K-Dense-AI/scientific-agent-skills`).
- Provide installation instructions using standard AgentSkills.io tooling: `gh skill install K-Dense-AI/scientific-agent-skills` or `npx skills add`.
- Explain that installing this pack activates the **Scientific Editor**, **Data Scientist**, and **AI Expert** roles.

### 2. Expansion Pack Configuration (`.aceconfig`)
- Instead of polluting the core `.aceconfig` with scientific triggers, introduce support for **modular config loading** (e.g., `include: [.ace/packs/scientific/.aceconfig-ext]`).
- The expansion pack will contain its own keyword mappings:
  ```yaml
  # .ace/packs/scientific/.aceconfig-ext
  triggers:
    genomics: .ace/skills/scanpy/SKILL.md
    chemistry: .ace/skills/rdkit/SKILL.md
    literature: .ace/skills/paper-lookup/SKILL.md
    document: .ace/skills/documentation-generation/SKILL.md
  ```

### 3. CLI Support for Expansion Packs
- Augment the `create-ace-framework` CLI to support an `--expansion` or `--pack` flag.
- Example: `npx create-ace-framework my-lab-project --pack scientific`
- This command would scaffold the base ACE project and automatically run the `gh skill` commands to populate the `.ace/packs/scientific` directory.

### 4. Update Guides (`USER_GUIDE.md` / `SKILLS_GUIDE.md`)
- Document the Expansion Pack architecture.
- Add a "Scientific AI Co-Scientist" tutorial demonstrating how an Expansion Pack alters the BMAD methodology to support bioinformatics or cheminformatics workflows.

---

## Phase 2: The "ACE Standard Documentation" Pipeline

When a user concludes an analysis or experiment and prompts: **"Document as per the ACE standard,"** the framework must execute a structured, reproducible pipeline leveraging the **Scientific Editor** role and the `scientific-agent-skills` communication tools.

### Trigger
User states: `"Document as per the ACE standard"`
Mode shifts to: **PUBLICATION / VERIFICATION**
Role assumed: **Scientific Editor**

### Execution Pipeline

The `documentation-generation` skill will be updated to execute the following pipeline automatically:

#### Step 1: Context Aggregation
- **Action**: Read `docs/context/ACTIVE_CONTEXT.md` to understand the completed task.
- **Action**: Ingest relevant raw outputs, logs, or Jupyter notebooks generated during the EXECUTION phase.

#### Step 2: Scientific Translation (Using Scientific Agent Skills)
- **Action**: Use the `Scientific Writing` skill to convert raw experimental results into academic-toned, publication-ready text.
- **Action**: If external citations are needed, invoke the `Paper Lookup` and `Citation Management` skills to find and properly format references.

#### Step 3: Visual & Structural Generation
- **Action**: Invoke the `Markdown & Mermaid Writing` skill to generate necessary architectural, pipeline, or network diagrams.
- **Action**: If data was analyzed, invoke `Scientific Schematics` to structure the results visually.

#### Step 4: Artifact Production
- **Action**: Write the final output to the appropriate ACE standard artifact:
  - If closing an execution task: `docs/planning/walkthrough.md`
  - If documenting an issue: `docs/rca/RCA-XXX.md`
  - If concluding an experiment: `docs/research/experiment_results.md`

#### Step 5: Session Wrap-Up
- **Action**: Update `docs/context/ACTIVE_CONTEXT.md` indicating that the documentation phase is complete.
- **Action**: Request the user to review the generated artifact.

---

## Next Steps for Implementation

1. **Modify `CLAUDE.md`** to include the scientific skills installation instructions.
2. **Refactor `.ace/skills/documentation-generation/SKILL.md`** to encode the pipeline outlined in Phase 2.
3. **Copy the Scientific Communication skills** (e.g., `Paper Lookup`, `Scientific Writing`, `Markdown & Mermaid Writing`) from the `scientific-agent-skills` repository into the ACE Framework's `.ace/skills` directory (or instruct the user to install them dynamically).
