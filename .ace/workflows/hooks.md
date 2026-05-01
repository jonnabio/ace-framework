# Workflow Hooks

> Automation hooks that trigger at specific points in the
> AI-assisted development workflow.

---

## Purpose

Define automated checks and actions that run:
- Before AI generates code
- After AI generates code
- Before commits
- On issue detection
- At other workflow stages

---

## Hook Categories

### Pre-Generation Hooks

Triggered before AI generates any code.

```yaml
pre_generation:
  - name: check_active_context
    description: Verify ACTIVE_CONTEXT.md is current
    action: |
      - Check last_updated is within current session
      - Warn if stale (>24 hours)
      - Prompt to update if stale
    required: true

  - name: load_relevant_adrs
    description: Load ADRs relevant to current task
    action: |
      - Parse current task description
      - Identify relevant ADRs by keyword
      - Load into context
    required: true

  - name: verify_plan_approved
    description: Ensure implementation plan is approved
    action: |
      - Check IMPLEMENTATION_PLAN.md exists
      - Verify "Approved" status
      - Block if not approved
    required: true

  - name: check_regression_guards
    description: Check for regression guards on files to be modified
    action: |
      - Load docs/rca/regression-guards.yaml
      - Identify files that will be modified
      - For each guarded file:
        - Load associated RCA
        - Note invariants that must be maintained
        - Identify regression tests to run
      - Warn if modifying guarded files
    required: true
```

### Post-Generation Hooks

Triggered after AI generates code.

```yaml
post_generation:
  - name: validate_against_standards
    description: Check code against .ace/standards/
    action: |
      - Run coding standards check
      - Run security standards check
      - Run architecture standards check
      - Report violations
    required: true

  - name: verify_regression_invariants
    description: Verify regression guard invariants maintained
    action: |
      - For each modified guarded file:
        - Check all invariants still hold
        - Flag any potential violations
        - Require explicit confirmation if invariant affected
    required: true

  - name: run_regression_tests
    description: Run regression tests for guarded files
    action: |
      - Identify regression tests from guards
      - Execute regression test suite
      - Block if any regression test fails
    required: true

  - name: update_active_context
    description: Prompt to update ACTIVE_CONTEXT.md
    action: |
      - Remind to update current state
      - Remind to update next steps
      - Remind to log completed work
    required: true

  - name: run_tests
    description: Execute relevant tests
    action: |
      - Identify affected test files
      - Run unit tests
      - Report failures
    required: false
```

### Pre-Commit Hooks

Triggered before code is committed.

```yaml
pre_commit:
  - name: lint
    description: Run code linter
    command: npm run lint
    required: true
    block_on_failure: true

  - name: type_check
    description: Run type checker
    command: npm run typecheck
    required: true
    block_on_failure: true

  - name: test
    description: Run test suite
    command: npm test
    required: true
    block_on_failure: true

  - name: regression_tests
    description: Run all regression tests from guards
    command: npm run test:regression
    required: true
    block_on_failure: true

  - name: security_scan
    description: Scan for security issues
    command: npm run security:check
    required: true
    block_on_failure: true

  - name: secrets_scan
    description: Scan for hardcoded secrets
    command: |
      # Check for common secret patterns
      git diff --cached | grep -iE "(password|secret|api_key|token).*=.*['\"][^'\"]+['\"]"
    required: true
    block_on_failure: true

  - name: guard_compliance_check
    description: Verify regression guard compliance
    command: |
      # Check modified files against regression guards
      # Fail if invariants appear violated
    required: true
    block_on_failure: true
```

### Post-Commit Hooks

Triggered after successful commit.

```yaml
post_commit:
  - name: update_context
    description: Update ACTIVE_CONTEXT.md with commit info
    action: |
      - Add commit hash to session notes
      - Update completed tasks list
    required: false

  - name: notify
    description: Send notification of commit
    action: |
      - Log to feedback system
      - Update progress tracking
    required: false
```

### On-Issue Hooks

Triggered when an issue is detected.

```yaml
on_issue:
  - name: create_incident
    description: Initialize incident response
    action: |
      - Log issue to .ace/feedback/log.md
      - Create draft RCA from template
      - Set mode to INCIDENT
      - Activate Incident Responder role
    required: true

  - name: capture_evidence
    description: Capture issue evidence
    action: |
      - Save error messages and stack traces
      - Capture relevant logs
      - Document reproduction steps
      - Note affected components
    required: true

  - name: notify_stakeholders
    description: Alert relevant parties
    action: |
      - Determine severity
      - Notify based on severity level
    required: false
```

### Post-RCA Hooks

Triggered after RCA completion.

```yaml
post_rca:
  - name: create_regression_guard
    description: Create regression guard entry
    action: |
      - Add guard to regression-guards.yaml
      - List all guarded files
      - Define invariants
      - Link regression tests
    required: true
    block_on_failure: true

  - name: update_standards
    description: Update standards if new rule needed
    action: |
      - Identify if pattern was missing
      - Add rule to appropriate .ace/standards/ file
      - Reference RCA in rule
    required: true

  - name: verify_regression_tests
    description: Ensure regression tests exist and pass
    action: |
      - Run all regression tests
      - Verify coverage of fix
      - Block RCA closure if tests fail
    required: true
    block_on_failure: true

  - name: close_rca
    description: Close RCA and update status
    action: |
      - Update RCA status to "Resolved"
      - Update ACTIVE_CONTEXT.md
      - Return to previous mode
    required: true
```

---

## Hook Implementation

### For AI Agents

AI agents should simulate hooks by:

1. **Pre-Generation**: Always start with
   ```markdown
   "Before generating code, I'll verify:
   - ACTIVE_CONTEXT.md is current
   - Relevant ADRs are loaded
   - Implementation plan is approved
   - Regression guards checked for files to modify"
   ```

2. **Post-Generation**: Always end with
   ```markdown
   "After generating, I'll:
   - Validate against .ace/standards/
   - Verify regression guard invariants maintained
   - Run regression tests for guarded files
   - Update ACTIVE_CONTEXT.md
   - Recommend running full test suite"
   ```

3. **On Issue Detection**:
   ```markdown
   "Issue detected. Switching to INCIDENT mode:
   - Capturing symptoms and evidence
   - Creating RCA document
   - Applying .ace/skills/root-cause-analysis/SKILL.md"
   ```

4. **Post-RCA**:
   ```markdown
   "RCA complete. Finalizing:
   - Creating regression guard
   - Updating standards
   - Verifying regression tests pass
   - Closing RCA"
   ```

### For CI/CD Systems

Implement hooks as pipeline stages:

```yaml
# .github/workflows/ci.yml (example)
name: CI
on: [push, pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Lint
        run: npm run lint

      - name: Type Check
        run: npm run typecheck

      - name: Unit Tests
        run: npm test

      - name: Regression Tests
        run: npm run test:regression

      - name: Security Scan
        run: npm run security:check

      - name: Guard Compliance
        run: |
          # Check modified files against regression-guards.yaml
          ./scripts/check-guard-compliance.sh

      - name: Secrets Scan
        run: |
          if git diff HEAD~1 --name-only | xargs grep -l -E "(password|secret|api_key).*=" 2>/dev/null; then
            echo "Potential secrets detected!"
            exit 1
          fi
```

### For Git Hooks

Install via Husky or similar:

```bash
# .husky/pre-commit
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npm run lint-staged
npm run typecheck
npm test -- --passWithNoTests
npm run test:regression -- --passWithNoTests

# Check regression guard compliance
./scripts/check-guard-compliance.sh
```

---

## Regression Guard Compliance Script

```bash
#!/bin/bash
# scripts/check-guard-compliance.sh

# Get list of modified files
MODIFIED_FILES=$(git diff --cached --name-only)

# Load regression guards
GUARDS_FILE="docs/rca/regression-guards.yaml"

if [ ! -f "$GUARDS_FILE" ]; then
    echo "No regression guards file found"
    exit 0
fi

# Check each modified file against guards
for file in $MODIFIED_FILES; do
    if grep -q "$file" "$GUARDS_FILE"; then
        echo "WARNING: Modifying guarded file: $file"
        echo "Please verify regression guard compliance:"
        grep -A 20 "$file" "$GUARDS_FILE"
        echo ""
        echo "Ensure invariants are maintained and regression tests pass."
    fi
done
```

---

## Custom Hooks

Add project-specific hooks below:

### [Hook Name]

```yaml
trigger: [pre_generation | post_generation | pre_commit | post_commit | on_issue | post_rca]
name: hook_name
description: What this hook does
action: |
  Steps to perform
required: true | false
block_on_failure: true | false
```

---

## Hook Configuration

### Enabling/Disabling Hooks

In `.aceconfig`:

```yaml
hooks:
  pre_generation:
    check_active_context: true
    load_relevant_adrs: true
    verify_plan_approved: true
    check_regression_guards: true
  post_generation:
    validate_against_standards: true
    verify_regression_invariants: true
    run_regression_tests: true
    update_active_context: true
    run_tests: false  # Disabled
  pre_commit:
    lint: true
    test: true
    regression_tests: true
    security_scan: true
    guard_compliance_check: true
  on_issue:
    create_incident: true
    capture_evidence: true
  post_rca:
    create_regression_guard: true
    update_standards: true
    verify_regression_tests: true
```

### Hook Priority

Hooks run in defined order. To change priority:

```yaml
hooks:
  pre_commit:
    - lint        # Runs first
    - typecheck   # Runs second
    - test        # Runs third
    - regression_tests  # Runs fourth
    - guard_compliance  # Runs fifth
```

---

## Failure Handling

When a hook fails:

1. **Block on Failure = true**: Stop workflow, require fix
2. **Block on Failure = false**: Warn but continue

### Failure Recovery

```markdown
"Hook [hook_name] failed with:
[Error message]

To resolve:
1. [Fix step]
2. [Verify step]
3. Re-run hook"
```

### Regression Guard Failure

```markdown
"Regression guard check failed for [file].

Guard: RCA-XXX
Invariant violated: [invariant description]

To resolve:
1. Read docs/rca/RCA-XXX-description.md
2. Ensure changes maintain the invariant
3. Run regression tests: [test file]
4. If invariant must change, update guard with justification"
```

---

*Last Updated: [DATE]*

