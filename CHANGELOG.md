# Changelog

All notable changes to the ACE Framework will be documented in this file.

## [v2.7.0] - 2026-07-05

### Added — The Loop Engineering Update

Executes the approved plan in `docs/planning/implementation_plan_v2.7_loop_engineering.md` (10 tasks, 4 milestones). Turns the v2.6 Triad from documented protocol into an executable, bounded loop.

- **M1 — The Honest Gate**
  - `.ace/schemas/tasks.schema.json`: JSON Schema (2020-12) for the `docs/progress/tasks.json` task queue; six-state machine with conditional requirements.
  - `cli/lib/validate-tasks.js`: zero-dependency validator enforcing the schema plus cross-field loop invariants (single `in_progress`, dependency existence/cycles, attempt ceiling); wired into `scripts/validate.sh`.
  - `.ace/scripts/verify.sh` rewritten as a real gate: runs `verify:` block commands from `.aceconfig`, exits non-zero on failure or when unconfigured, emits `VERIFY_RESULT=pass|fail gate=<name>`.
  - `cli/lib/loop-guards.js`: pure retry/block decisions — budget exhaustion and stall detection via normalized failure fingerprints.
- **M2 — The Loop Runner**
  - `cli/lib/loop.js` + `ace-framework loop`: thin state machine over the queue; fresh runner session per attempt; atomic saves; crash resume; runner failures never burn retry budget (ADR-002).
  - Runner adapters (`cli/lib/runners/`): `claude-code` (headless `claude -p`, prompt via stdin, transcript to trace file) and `manual` (any tool, zero lock-in); file-drop registry.
  - Enforced hooks adapter (`.ace/adapters/claude-code/`): PreToolUse regression-guard blocking + Stop-hook verify gate; installed via `create-ace-framework --adapter claude-code`; `hooks.md` repositioned enforced-first.
- **M3 — The Learning Loop** *(experimental)*
  - `cli/lib/reflector.js` + `.ace/prompts/reflect-on-trace.md`: automatic Reflector session on failed attempts with a strict output contract; malformed output rejected.
  - `cli/lib/curator.js` + `ace-framework curate`: staged → promoted | expired rule lifecycle per ADR-003 (dedup by identity, hit counts, human-confirmed append-only promotion, 30-day expiry to archive); `update_harness.sh --from-staging`.
  - `cli/lib/telemetry.js` + `ace-framework loop --report`: metadata-only JSONL metrics; first-pass rate and repeat-fingerprint reporting.
- **ADRs**: ADR-002 (runner adapter interface), ADR-003 (rule promotion policy).
- **Tests**: CLI test suite introduced — 88 tests, zero dependencies (`npm test` in `cli/`), which is also the framework repo's own verify gate.

### Changed

- `scripts/validate.sh`: validates `tasks.json` when present; fixed `((ERRORS++))` aborting under `set -e` before the summary.
- `.ace/standards/harness-engineering.md` §5.1: distilled rule lifecycle.
- Version sync: `.aceconfig`, `cli/package.json`, `ACE-SPEC.md`, `README.md`, CLI banners → 2.7.0 in one release (per the v2.6.2 drift lesson).
- `.gitattributes` added: `*.sh` forced to LF so hooks survive Windows checkouts.

## [v2.6.2] - 2026-07-04

### Changed

- **Version Sync**: Bumped `cli/package.json` and `.aceconfig`'s `version` field from a stale `2.5.x` to `2.6.2`. The 2.6.0/2.6.1/2.6.2 releases below only touched `.ace/roles/`, `.ace/scripts/`, `.ace/standards/harness-engineering.md`, and `README.md` — neither `cli/` nor `.aceconfig` were bumped alongside them, so the npm package and the in-repo config both under-reported the framework's actual version. This release (npm `create-ace-framework@2.6.2`) supersedes the same-day `2.5.1` publish, which contained the CLI expansion-pack fix below but predated this sync.

## [v2.6.1] - 2026-05-10

### Added

- **Anti-Collapse Appends and Reflector Distillation**: extended `.ace/standards/harness-engineering.md` and `.ace/scripts/update_harness.sh` with reflector-distillation guidance and anti-collapse append handling; updated role responsibilities in `.ace/roles/roles.md`.

## [v2.6.0] - 2026-05-10

### Added

- **Harness Engineering, Context Flushing, State Tracking, and Validation**: introduced the harness-engineering standard and supporting scripts governing context flushing and state tracking across role transitions.

## [v2.5.1] - 2026-07-04 (npm only, superseded by v2.6.2)

### Fixed

- **CLI Expansion Pack Installer**: `create-ace-framework --pack <name>` now installs the actual vendored skills from `.ace/packs/` instead of shelling out to unrelated third-party packages (`K-Dense-AI/scientific-agent-skills`, `@orchestra-research/ai-research-skills`). The requested pack is kept, all others are pruned, and `.aceconfig`'s `includes:` list is reconciled to match (`includes: []` when no pack is requested).
- **npm README**: Added a dedicated "Skill Expansion Kits" section with copy-paste `--pack scientific` / `--pack ai-research` commands.

## [v2.5.0] - 2026-05-03

### Added

- **AI Research Expansion Pack**: Integrated and bundled 98+ AI engineering skills (vLLM, DeepSpeed, RLHF) from the Orchestra Research collection.
- **Modular Architecture**: Implemented the `includes` directive in `.aceconfig` for dynamic configuration loading of Expansion Packs.
- **Role Augmentation**: Added *AI Researcher* and *MLOps Engineer* roles.
- **Version Unification**: Unified all framework components, CLI, and documentation to v2.5.0.

### Changed

- **CLI v2.5.0**: Enhanced `create-ace-framework` with automated pack installers and configuration wiring.

## [v2.4.0] - 2026-05-03

### Added

- **Scientific Expansion Pack**: Integrated 135+ scientific skills (bioinformatics, chemistry, clinical data) and PhD-level personas.
- **New Scientific Roles**: Introduced *Data Scientist*, *AI Expert*, and *Scientific Editor* roles.
- **Expansion Pack Standard**: Defined the `.ace/packs/` directory structure for domain-specific skillsets.

## [v2.3.0] - 2026-05-01

### Added

- **AgentSkills Standard Migration**: Upgraded all legacy flat `.md` skills into the robust AgentSkills folder standard (with `SKILL.md` and YAML frontmatter).
- **Expanded Core Skills**: Grew the default skills library from 8 to 19, adding massive coverage for Data Engineering, AI Development, and DevOps.
  - *Data/AI*: `data-pipeline-design`, `prompt-engineering`, `model-evaluation`, `feature-engineering`
  - *Agentic*: `agent-design`, `a2a-communication`, `mcp-implementation`
  - *Engineering*: `security-audit`, `performance-optimization`, `accessibility-audit`, `ci-cd-pipeline`, `error-handling`, `documentation-generation`, `state-management`
- **Skill Import CLI Tool**: Built `ace-framework add-skill <url>` to natively import open-source skills via `degit` and auto-register them in `.aceconfig`.
- **SKILLS_GUIDE.md**: Created a dedicated, comprehensive guide at the root explaining how to build, use, and explicitly invoke skills.
- **Claude Code Native Plugins**: Added documentation for leveraging the `document-skills` plugin via Claude Marketplace.

### Changed

- **Configuration Wiring**: `.aceconfig` and `.aiconfig` updated with 11 new trigger keywords.
- **Validation**: Expanded `scripts/validate.sh` to enforce the existence of the new `SKILL.md` hierarchy.
- **Documentation**: Fully upgraded `USER_GUIDE.md`, `CLAUDE.md`, and `README.md` to point to the new AgentSkills structures and the `SKILLS_GUIDE.md`.

## [v2.2.0] - 2026-05-01
### Added

- **Transcript Analysis**: New golden prompt `.ace/prompts/extract-transcript.md` for extracting structured requirements from raw transcripts.
- **Transcript Analysis Skill**: New skill `.ace/skills/transcript-analysis/SKILL.md` defining the full ingest â†’ extract â†’ validate â†’ iterate procedure.
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

- **BMAD Methodology**: The core "Analyze â†’ Plan â†’ Execute â†’ Verify" loop.
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

