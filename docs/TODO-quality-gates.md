# TODO — Quality Gate and Tooling Defects

Status: open. Nothing in this document has been applied; the repository is
unchanged. Findings were produced on 2026-08-24 against commit `f2e4ced` by
running the tooling, not only by reading it.

Related: [TODO-markdown-lint.md](TODO-markdown-lint.md) covers the markdown
lint gate specifically. Findings 1, 2 and 4 below are the same failure mode —
a gate that exists but cannot fail.

## Summary

The repository's automated barriers largely do not block anything. CI does not
run the test suite, four of its five steps cannot fail, and the published CLI
propagates defects into every newly scaffolded project. A defect can currently
travel from this repository into a user's project without crossing a single
failure signal.

Findings are ordered by severity.

## 1. CI never runs the test suite

`.github/workflows/validate.yml` defines five steps:

```text
Checkout
Validate Structure
Validate Markdown
Check YAML Syntax
Validate Links
```

None of them runs `npm test`, `scripts/validate.sh`, or
`.ace/scripts/verify.sh`. The 88-test CLI suite that `CLAUDE.md` describes as
"the repo's verify gate" never executes on push or pull request.

```bash
grep -n "npm\|verify.sh\|validate.sh" .github/workflows/validate.yml
# only matches 'node_modules' inside an unrelated grep -v
```

- [ ] Add a step running `cd cli && npm test`
- [ ] Add a step running `bash scripts/validate.sh`
- [ ] Consider calling `.ace/scripts/verify.sh` so CI and the local gate share
      one definition of "passing"

## 2. Four of the five CI steps cannot fail

| Step | Why it cannot fail |
| --- | --- |
| Validate Markdown | `continue-on-error: true` |
| Check YAML Syntax | `cmd && echo ok \|\| echo bad` never exits non-zero |
| Validate Links | `fail: false` |
| Validate Structure | none — this one does fail correctly (`exit 1`) |

The YAML step at `.github/workflows/validate.yml:54` prints
`❌ Invalid: <file>` and still leaves the job green:

```bash
python3 -c "import yaml; yaml.safe_load(open('$file'))" \
  && echo "✓ Valid: $file" || echo "❌ Invalid: $file"
```

In effect CI only verifies that certain directories and files exist.

- [ ] Make the YAML step exit non-zero when any file fails to parse
- [ ] Decide, per step, whether it should gate or stay advisory — and if
      advisory, say so in the step name so the green check is not misread

## 3. `npx create-ace-framework` produces corrupted projects

Scaffolding into a temporary directory and scanning the result:

```text
total replacements: 1723
```

A project created today is born with 1723 mojibake characters. The CLI clones
from GitHub, and upstream still carries the corruption — the repair in commit
`68d0f52` is local and unpushed.

This is the highest-impact item: it is the path by which the defect reaches
other people's projects.

Verified working in the same run: `includes: []` is written correctly and the
expansion packs are pruned properly when no `--pack` is given.

- [ ] Push the encoding repair so upstream is clean
- [ ] Add an encoding check to CI so this cannot silently return

## 4. Release changelog is broken by a shallow clone

`.github/workflows/release.yml` checks out without `fetch-depth`, so
`actions/checkout@v4` clones with depth 1. It then runs:

```bash
PREV_TAG=$(git describe --tags --abbrev=0 HEAD^ 2>/dev/null || echo "")
```

With a single commit of history, `HEAD^` does not exist. The `|| echo ""`
swallows the error, `PREV_TAG` ends up empty, and the job silently falls back
to "last 20 commits". Every release changelog is wrong, and nothing reports it.

- [ ] Add `fetch-depth: 0` to the checkout step in `release.yml`
- [ ] Fail loudly instead of falling back silently when no previous tag is found

## 5. The CLI cannot run unattended

Argument parsing at `cli/bin/create-ace-framework.js:401-409` recognises only
`--pack`, `--adapter`, and the target directory. There is no `else` branch, so
any other flag is ignored with no message — `--no-git` was accepted and
silently discarded.

There is no `--help`, no `--version`, and no `--yes`. The project name is
always prompted for, so in CI the command either hangs or dies on EOF. The
only way to script it today:

```bash
printf 'demo\n\n\n' | node cli/bin/create-ace-framework.js ./target
```

- [ ] Add `--help` and `--version`
- [ ] Add a non-interactive mode (`--yes`) that accepts defaults
- [ ] Error on unrecognised flags instead of ignoring them

## 6. Orphaned skill: `phantom-link`

`.ace/skills/phantom-link/SKILL.md` exists on disk but is referenced nowhere —
not in `.aceconfig`, `.cursorrules`, `.aiconfig`, or `SKILLS_GUIDE.md`. No
agent will ever load it.

It also still pins an old version internally:

```text
Confirm if the version matches the target framework (v2.5.0).
```

- [ ] Register it under `skill_triggers` in `.aceconfig`, or delete it
- [ ] If kept, update the `v2.5.0` reference

## 7. The Stop hook runs the full test suite every turn

`.ace/adapters/claude-code/stop-verify.sh` invokes `verify.sh`, which runs
`cd cli && npm test`, every time the agent tries to end its turn. Here that
costs seconds. In a project with a multi-minute suite, every single agent turn
pays that cost, which will push users to disable the hook entirely.

- [ ] Consider splitting a fast gate (lint, typecheck) from the full suite
- [ ] Document the expected cost so adopters can size it

## 8. `guard-check.sh` over-blocks (minor)

Matching is a suffix glob:

```sh
case "$FILE_PATH" in
  *"$guarded")
```

A guard on `src/services/user-service.ts` therefore also blocks
`vendor/NOTsrc/services/user-service.ts`. Confirmed with a real hook payload.

This fails closed, which is the safe direction, and the script's own comments
already acknowledge part of it. Low priority.

- [ ] Anchor the match on a path separator

## Verified working

Checked actively; no action needed. Recorded so the next audit can skip them.

- Version `2.7.0` is consistent across `.aceconfig`, `cli/package.json`,
  `ACE-SPEC.md`, `README.md`, and the CLI banner
- Every skill and standard path referenced in the config files exists on disk —
  no broken references
- `docs/progress/tasks.example.json` validates against its own schema
- All six shell scripts pass `bash -n`
- `loop --dry-run`, `loop --report`, and `curate list` all run and give useful
  messages when state is absent
- `guard-check.sh` blocks and allows correctly across six payload cases, and
  has no content-injection bypass: a `file_path` planted inside the file
  content does not defeat it, because JSON escaping prevents the match

## Reproducing

```bash
# Finding 3 — scaffold and scan the result
printf 'demo\n\n\n' | node cli/bin/create-ace-framework.js /tmp/scaffold

# Finding 8 — exercise the guard hook directly
printf '{"tool_name":"Edit","tool_input":{"file_path":"src/x.ts"}}' \
  | sh .ace/adapters/claude-code/guard-check.sh; echo "exit=$?"

# Findings 1 and 2 — list what CI actually does
python3 -c "import yaml; d=yaml.safe_load(open('.github/workflows/validate.yml')); \
print([s.get('name') for s in d['jobs']['validate']['steps']])"
```
