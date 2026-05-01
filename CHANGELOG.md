# Changelog

All notable changes to the ACE Framework will be documented in this file.

## [v2.2.0] - 2026-05-01

### Added

- **Transcript Analysis**: New golden prompt `.ace/prompts/extract-transcript.md` for extracting structured requirements from raw transcripts.
- **Transcript Analysis Skill**: New skill `.ace/skills/transcript-analysis.md` defining the full ingest → extract → validate → iterate procedure.
- **Input Directory**: `docs/inputs/transcripts/` as the designated drop zone for raw unstructured data.
- **Requirements Directory**: `docs/requirements/` replaces `docs/specs/` as the unified home for specifications and extracted requirements.

### Changed

- **Architect Role**: Added transcript analysis responsibility, updated activation prompt to include "requirements extraction", expanded output to include Requirements Specifications.
- **Directory Structure**: `docs/specs/` migrated to `docs/requirements/`; PRD and TECH_SPEC templates moved.
- **Config Files**: `.aceconfig`, `.aiconfig`, `.cursorrules`, `CLAUDE.md` updated with transcript skill trigger and v2.2 version.
- **ACE-SPEC.md**: Directory blueprint, skills listing, prompts listing, and all `docs/specs/` references updated.
- **USER_GUIDE.md**: Skills table and keyword triggers updated with transcript-analysis.
- **Scaffolding**: CLI (`create-ace-framework.js`), `init.sh`, and `validate.sh` updated for new directory structure.

### Removed

- **`docs/specs/` directory**: Superseded by `docs/requirements/`. Templates preserved and relocated.

## [v2.1.0] - 2026-02-01

### Added

- **Discuss Phase**: New phase in BMAD (between Analyze and Plan) for capturing "soft" preferences.
- **Workflow**: `.ace/workflows/discuss-phase.md` to guide the discussion process.
- **Context**: `docs/context/PROJECT_CONTEXT.md` artifact for stable project preferences.
- **XML Tasks**: `implementation_plan.md` now uses XML `<task>` tags for better Agent parsing.
- **Atomic Commits**: Strict "One Task = One Commit" rule enforced in Developer role.

### Changed

- **ACE-SPEC.md**: Updated to include Discuss phase and new documentation standards.
- **Roles**: Updated Architect and Developer roles with new responsibilities.
- **Prompts**: Updated `generate-implementation-plan.md` to output XML format.

## [v2.0.0] - Initial Standard

### Added

- **BMAD Methodology**: The core "Analyze → Plan → Execute → Verify" loop.
- **Directory Setup**: Standardized `.ace/` directory structure for Agent knowledge.
- **Agentic Roles**: Definition of 7 key roles (Architect, Developer, QA, etc.).
- **Active Context**: Protocol for maintaining session state in `ACTIVE_CONTEXT.md`.
- **RCA Protocol**: Standardized Root Cause Analysis and Regression Guards.
- **ADR System**: Architecture Decision Records for tracking design choices.

## [v1.0] - Pre-history (The "Conversation" Era)

### Conceptual

- Represents the ad-hoc usage of LLMs without standardized frameworks.
- Characterized by:
  - Casual, unstructured conversations.
  - Lack of persistent context management.
  - No defined roles or responsibilities.
  - Fragile, non-reproducible outputs.
- **Note**: There are no files or specs for v1.0; it serves as the "dark age" baseline that v2.0 standardizes.
