# TODO — Markdown Lint Is Not Enforced

Status: open. Nothing in this document has been applied; the repository is
unchanged. All numbers below were measured on 2026-08-24 against commit
`7800f35`.

## Summary

Markdown linting does not work locally and cannot fail in CI. The documented
command has never been runnable, and the CI step is marked
`continue-on-error: true`. As a result no markdown problem in this repository
has ever produced a failure signal.

This is how 1744 mojibake characters survived across 15 files until they were
found by hand (fixed in commit `68d0f52`).

## Problem 1 — The documented command cannot run

`CLAUDE.md:25` and `CONTRIBUTING.md:125` both document:

```bash
npx markdownlint '**/*.md'
```

This fails with:

```text
npm error could not determine executable to run
```

The `markdownlint` npm package is a library and ships no binary. Verified
against the registry:

| Package | `bin` field |
| --- | --- |
| `markdownlint` | *(none — library only)* |
| `markdownlint-cli` | `markdownlint` |
| `markdownlint-cli2` | `markdownlint-cli2` |

The error is not "command not found": npx resolves the package, then finds
nothing executable inside it.

CI uses a third tool, `DavidAnson/markdownlint-cli2-action@v16`
(`.github/workflows/validate.yml:44`), which wraps `markdownlint-cli2`. The
local docs and CI have therefore never referred to the same binary.

There is no `package.json` at the repository root, so no devDependency pins
which tool or version is correct.

### Fix

Correct both documented commands to match what CI actually runs:

```bash
npx markdownlint-cli2 '**/*.md'
```

- [ ] Update `CLAUDE.md:25`
- [ ] Update `CONTRIBUTING.md:125`
- [ ] Optional: add a root `package.json` with `markdownlint-cli2` as a
      devDependency and a `lint:md` script, to pin the tool and version

## Problem 2 — CI cannot fail on markdown

`.github/workflows/validate.yml:48`:

```yaml
      - name: Validate Markdown
        uses: DavidAnson/markdownlint-cli2-action@v16
        with:
          globs: '**/*.md'
          config: '.markdownlint.json'
        continue-on-error: true
```

`continue-on-error: true` means the job stays green no matter how many
violations are reported. Combined with Problem 1, markdown lint is currently
unenforced everywhere.

Do not remove this flag before the backlog below is cleared — the build would
break immediately.

- [ ] Remove `continue-on-error: true` **after** the error count is at zero

## Current error count

Measured with `npx markdownlint-cli2 '**/*.md'` and the existing
`.markdownlint.json`:

**21,699 errors across 582 files.**

Distribution:

| Area | Errors | Share |
| --- | --- | --- |
| `.ace/packs/` (vendored third-party skills) | 20,259 | 93% |
| Framework core (84 files) | 1,440 | 7% |

Top rules by volume:

```text
5758  MD060/table-column-style        table column alignment
4102  MD031/blanks-around-fences      blank line around code fences
3360  MD032/blanks-around-lists       blank line around lists
1623  MD022/blanks-around-headings    blank line around headings
1482  MD040/fenced-code-language      code fence without a language
1226  MD034/no-bare-urls              URLs not wrapped in < >
```

All formatting, no content defects.

## Proposed plan

Steps 1 and 2 were implemented and measured, then reverted so the repository
would stay unchanged. The numbers below are real, not estimates.

### Step 1 — Exclude expansion packs from linting

The 498 markdown files under `.ace/packs/` are vendored third-party skills.
They are not maintained here and cannot be reformatted without diverging from
upstream.

In `.github/workflows/validate.yml`:

```yaml
        with:
          globs: |
            **/*.md
            !.ace/packs/**
          config: '.markdownlint.json'
```

Verified: the workflow still parses as YAML, and the value reaches the action
as `'**/*.md\n!.ace/packs/**\n'`, the newline-separated form it expects.

Effect: 582 files linted drops to 84.

- [ ] Apply the glob exclusion in `.github/workflows/validate.yml`

### Step 2 — Disable MD060

In `.markdownlint.json`, alongside the rules already disabled:

```json
"MD060": false,
```

Two reasons.

First, volume: MD060 alone accounts for 5758 of the 21,699 errors, the single
largest rule.

Second, and more important, its autofix makes the source worse. It strips
table padding:

```diff
-| Skill                    | Use For                  |
-| `api-design/SKILL.md`          | Creating REST APIs       |
+| Skill | Use For |
+| `api-design/SKILL.md` | Creating REST APIs |
```

The rendered output is identical, but every table in the documentation stops
being aligned in the source. Verified that disabling the rule preserves the
padding: after the change, the autofix diff for the `USER_GUIDE.md` skills
table is empty.

- [ ] Add `"MD060": false` to `.markdownlint.json`

### Result of steps 1 and 2

**21,699 errors drop to 970** — a 96% reduction with no documentation file
touched. Configuration only.

### Step 3 — Run the autofix

```bash
npx markdownlint-cli2 --fix '**/*.md' '!.ace/packs/**'
```

Resolves 799 of the remaining 970 (82%), leaving 171.

Two cautions.

This still rewrites **70 of 84 files**. The bulk is `MD022`, `MD032` and
`MD031` — blank lines around headings, lists and fences — spread across the
whole documentation set. It will be a large, noisy commit and will disturb
`git blame`.

Verified safe on two counts: the fix does not reintroduce mojibake, and it
leaves the box-drawing diagrams in `USER_GUIDE.md` intact (12 `│` characters
before and after).

- [ ] Decide whether the blame churn is acceptable
- [ ] If yes, apply as its own commit, labelled as a formatting-only change

### Step 4 — Clear the remaining 171 by hand

```text
117  MD040  code fences with no declared language
 45  MD036  bold text used as a heading
  9  MD025, MD024, MD032, MD022
```

`MD040` is mechanical but not automatable: each fence needs a human to decide
whether it is `bash`, `yaml`, `json`, `text`, or something else.

- [ ] Resolve or explicitly disable `MD040`
- [ ] Resolve or explicitly disable `MD036`
- [ ] Resolve the remaining 9

## Open question

`.aceconfig` currently has an empty `lint_cmd`:

```yaml
verify:
  test_cmd: "cd cli && npm test"
  lint_cmd: ""
  typecheck_cmd: ""
```

Markdown lint could be wired in here, which would make it part of the
framework's own verify gate. That also means a markdown formatting violation
would block the gate for all work. This is a judgement call and is
deliberately left undecided.

- [ ] Decide whether `lint_cmd` should run markdown lint

## Reproducing these numbers

```bash
# Current state
npx markdownlint-cli2 '**/*.md'

# After steps 1 and 2
npx markdownlint-cli2 '**/*.md' '!.ace/packs/**'

# Autofix impact, without touching the repository
rsync -a --exclude='.git' --exclude='.ace/packs' ./ /tmp/repocopy/
cd /tmp/repocopy && npx markdownlint-cli2 --fix '**/*.md'
```
