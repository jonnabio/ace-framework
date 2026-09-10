# RCA-001: Scaffolded projects inherit a verify gate that cannot pass

> **Status:** Resolved
> **Severity:** Critical
> **Created:** 2026-09-02
> **Resolved:** 2026-09-02
> **Owner:** Developer

---

## Issue Summary

**One-line description:** `.aceconfig`'s `verify:` block was copied verbatim
into every scaffolded project, so new projects inherited this repository's own
`test_cmd: "cd cli && npm test"` and their verify gate failed on first run.

**Impact:** Every project created by `create-ace-framework` since v2.7.0. The
gate is load-bearing: with `--adapter claude-code` the Stop hook returns exit 2
on every turn, so the agent can never finish, and `cli/lib/loop.js` defaults
`acceptance_cmd` to `verify.sh`, so every task in the loop fails. The rational
response for an adopter is to delete the hook — which removes the enforcement
the framework exists to provide.

**Detection:** Found while auditing what remained after the quality-gate
backlog, by scaffolding with the published CLI and running the gate in the
result, rather than by reading the code.

---

## Timeline

| Time | Event |
|------|-------|
| 2026-07-05 | v2.7.0 introduces `test_cmd` in `.aceconfig` and ships |
| 2026-08-26 | `lint_cmd` added; the same block now carries two repo-specific commands |
| 2026-09-02 | Reproduced against `create-ace-framework@2.7.0` from npm |
| 2026-09-02 | Root cause identified; fix and regression tests landed |

---

## Symptoms

```text
$ npx create-ace-framework@2.7.0 /tmp/demo
$ cd /tmp/demo && bash .ace/scripts/verify.sh
Running ACE verification gate (config: .aceconfig)...
[*] Gate 'test': cd cli && npm test
[!] Gate 'test' FAILED (exit 1). Last 20 lines:
    bash: line 0: cd: cli: No such file or directory
[!] Gate 'test' failed.
VERIFY_RESULT=fail gate=test
```

The Stop hook then returns exit 2 with "ACE verify gate FAILED - do not stop
yet" on every turn.

---

## Root Cause Analysis

### The 5 Whys

1. **Why did the issue occur?**
   → A scaffolded project's `.aceconfig` ran `cd cli && npm test`, and it has
   no `cli/` directory.

2. **Why did it contain that command?**
   → `.aceconfig` is copied into new projects, and `customizeProject()`
   rewrote only `project_name` before writing it back.

3. **Why did it rewrite only `project_name`?**
   → That was the only field known to be repository-specific when the copy
   logic was written, before v2.7.0 added a `verify:` block.

4. **Why did adding `verify:` not prompt a change to the copy logic?**
   → Nothing in the file marks which fields describe *this* repository and
   which are meant for every project. The distinction lived in whoever was
   editing it.

5. **Why was it not caught afterwards?**
   → Nothing ever ran a scaffolded project's gate. The test suite covers the
   CLI's inputs, and CI covers this repository; neither asserts anything about
   the artefact the CLI produces.

### Root Cause Statement

`.aceconfig` serves two audiences — this repository and every project created
from it — with no marker distinguishing fields to copy from fields to rewrite,
and no test exercising the second audience's copy.

### Contributing Factors

- The failure is invisible from inside this repository: `cd cli && npm test`
  is correct here, so every gate we ran was green.
- The gate fails closed, which is right for a gate and wrong for a first run:
  the failure mode is a project that cannot do anything rather than one that
  quietly skips a check.
- The published CLI's `filesToCopy` also omitted `.markdownlint-cli2.jsonc`,
  so even with the test command removed, `lint_cmd` had no config to read.
  Fixed separately in `7eb9e0d`.

---

## Resolution

### Immediate Fix

`customizeProject()` rewrites the `verify:` block on the way out, the way it
already rewrote `project_name`. New projects get an empty `test_cmd` with a
comment naming it as the thing to fill in, and a `lint_cmd` that works
immediately.

**Files Changed:**

- `cli/lib/scaffold-config.js`: new — pure transforms for the config files
- `cli/bin/create-ace-framework.js`: calls them in `customizeProject()`

**Commit:** `f0e39c4`

### Permanent Fix

Three changes so the class of defect is visible rather than silent:

- `.ace/scripts/verify.sh` warns on every full run when `test_cmd` is empty.
  A partially configured block passed without running tests, which is the same
  dishonesty in a quieter form.
- The lint globs shipped to a new project are narrowed to the documents the
  framework owns, so the day-one gate cannot fail on markdown ACE never
  touched.
- The generated `ACTIVE_CONTEXT.md` was itself failing the framework's lint
  rules in 15 places, which only mattered once lint became the day-one gate.

**Files Changed:**

- `.ace/scripts/verify.sh`: warn when the gate runs no tests
- `cli/lib/scaffold-config.js`: glob scoping and the ACTIVE_CONTEXT template

**Commit:** `4e045e7`, `f488bc6`, `f54b96b`

---

## Regression Prevention

### Tests Added

| Test Type | Description | File |
|-----------|-------------|------|
| Unit | The scaffolded block carries no test command and stays sed-parseable | `cli/test/scaffold-config.test.js` |
| Unit | Generated `ACTIVE_CONTEXT.md` satisfies MD022 and MD032 | `cli/test/scaffold-config.test.js` |
| Integration | A scaffolded project's gate passes, warns, and still fails on a real lint failure | `cli/test/scaffold-config.test.js` |

### Standards Updated

- [x] No standard changed. `.ace/standards/harness-engineering.md` already
      says the gate is the source of truth for code health; the defect was
      that the shipped gate did not implement it, not that the rule was wrong.

### Knowledge Base Updated

- [x] Not applicable — no domain logic or new terminology.

### Regression Guard

Registered in `docs/rca/regression-guards.yaml`, which held `guards: []` until
now — this is the first real entry, so it is also the first time
`guard-check.sh` enforces anything.

```yaml
- id: RCA-001
  title: "Scaffolded projects inherit a verify gate that cannot pass"
  severity: critical
  created: 2026-09-02
  rca_file: docs/rca/RCA-001-scaffold-verify-gate.md
  guarded_files:
    - cli/lib/scaffold-config.js
    - cli/bin/create-ace-framework.js
  invariants:
    - "A scaffolded project's verify gate passes on first run"
    - "No command in a scaffolded .aceconfig refers to this repository's layout"
  tests:
    - cli/test/scaffold-config.test.js
```

---

## Verification

### Fix Verification

- [x] Scaffolded with the local CLI and `--adapter claude-code`:
      `VERIFY_RESULT=pass gate=all`, and `stop-verify.sh` exits 0 where it
      previously exited 2
- [x] A markdown error injected into the scaffolded project still produces
      `VERIFY_RESULT=fail gate=lint` — the fix is not another gate that cannot
      fail
- [x] A broken markdown file *outside* `.ace/` and `docs/` does not fail the
      scaffolded gate, confirming the glob scoping
- [x] 124 tests passing

### Prevention Verification

- [x] The new tests run in CI through the Verify Gate step
- [x] Guard registered in `docs/rca/regression-guards.yaml`

---

## Lessons Learned

### What went well

- The defect was found by running the published artefact, not by reading it.
  Every prior audit of this repository that read code missed it, because from
  inside the repository the configuration is correct.

### What could improve

- The CLI had no test that looked at what it produces. Its suite tested
  argument parsing and file copying; nothing asserted a property of the
  resulting project.
- Three separate audits — encoding, markdown lint, quality gates — walked past
  this. All three scoped themselves to this repository.

### Action items

- [x] Add a test that asserts a property of the scaffolded project, not just
      of the CLI's inputs
- [ ] Publish. The fix does not reach anyone until a release; npm's 2.7.0
      stays broken until then.

---

## References

- **Related ADR:** none
- **Related RCA:** none — this is the first entry in the registry
- **Specification:** `ACE-SPEC.md` §13 (Loop Engineering)
- **Backlogs:** `docs/TODO-quality-gates.md`, `docs/TODO-markdown-lint.md`

---

## Sign-off

| Role | Name | Date |
|------|------|------|
| Investigator | Developer | 2026-09-02 |
| Reviewer | | |
| Approver | | |
