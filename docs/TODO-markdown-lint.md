# Markdown Lint — Resolved

Status: **resolved** on 2026-08-26. Markdown lint now runs, is identical
locally and in CI, reports zero errors, and fails the build on regression.

Originally opened 2026-08-24 against commit `7800f35`.

## What was wrong

Three independent gaps meant no markdown problem had ever produced a failure
signal in this repository:

1. The documented command, `npx markdownlint '**/*.md'`, could not run. The
   `markdownlint` npm package is a library and ships no binary, so npx
   resolved it and then failed with `could not determine executable to run`.
2. CI used a different tool (`markdownlint-cli2`) with different globs, and
   was marked `continue-on-error: true`, so the job stayed green regardless.
3. `.aceconfig` had an empty `lint_cmd`, so `verify.sh` skipped lint and
   `VERIFY_RESULT=pass gate=all` only ever meant the test suite passed.

This is how 1744 mojibake characters survived across 15 files until they were
found by hand (repaired in `68d0f52`; a further 12 in `AGENTS.md` were found
during this work and repaired in `7aad699`).

## What was done

One config, one command. `.markdownlint-cli2.jsonc` at the repository root
holds the globs, the ignores and the rules, replacing `.markdownlint.json`.
The docs, CI and the verify gate all now invoke the same bare command:

```bash
npx markdownlint-cli2
```

Two scoping decisions are recorded in that config:

- `.ace/packs/**` is ignored. Those 498 files are vendored third-party
  skills, not maintained here; reformatting them would diverge from upstream.
- `MD060` is disabled. It was the largest single rule, and its autofix
  strips table padding, so tables lose their source alignment while
  rendering identically.

| Step | Commit | Errors after |
| --- | --- | --- |
| Baseline, all files | — | 21,728 |
| Ignore packs, disable MD060 | `ac21c3a` | 995 |
| Autofix (71 files, formatting only) | `9006ed0` | 171 |
| Repair unbalanced fences | `1399f89` | 163 |
| Declare a language on 114 fences | `b318b40` | 49 |
| Real headings, targeted exemptions | `f614029` | **0** |
| Enforce in CI | `f19448a` | 0 |
| Wire into the verify gate | `ef2811f` | 0 |

## Decisions worth carrying forward

**MD036 was split rather than disabled.** Sixteen `**Step N: ...**` lines in
`USER_GUIDE.md` really were headings and became level-4 headings. The other
25 hits are the italic metadata footer every document here ends with
(`*Skill Version: 1.0*`); turning those into headings would be wrong, so each
carries a `disable-next-line` comment with its reason. The rule stays live
for real cases. The two `MD024` hits — deliberately repeated placeholder
headings in templates — are exempted the same way.

**`lint_cmd` is wired in, and it is not free.** `verify.sh` runs on every
Stop hook, so lint now runs on every agent turn alongside the test suite.
Measured at 4.3s for the whole gate here. Finding 7 in
[TODO-quality-gates.md](TODO-quality-gates.md) tracked splitting a fast gate
from the full suite; it has since been done, and the Stop hook now runs
`verify.sh --fast` — lint without the test suite, 1.2s.

**`9006ed0` is a candidate for `.git-blame-ignore-revs`.** It rewrote 71
files mechanically. Ignoring whitespace, its real diff is 18 lines.

**The version is pinned, and the pin is what runs.** A root
`package.json` holds `markdownlint-cli2` at an exact `0.23.2`, with a
lockfile. CI runs `npm ci` and then `npx markdownlint-cli2` rather than
`DavidAnson/markdownlint-cli2-action@v16` — the action was doing the right
thing, but a lockfile cannot pin a version bundled inside an action, so CI
and local could still have drifted. The package is `private`, and it is not
in the CLI's copy list, so it never reaches scaffolded projects.

**Scaffolded projects get the config, not just the command.** `.aceconfig`
is copied into every scaffolded project, so setting `lint_cmd` there set it
for them too. Without `.markdownlint-cli2.jsonc` alongside it,
`markdownlint-cli2` prints its help and exits 0 — a gate that cannot fail,
which is the thing this document was opened about. Both copy paths now ship
the config.

## Still open

Nothing. CI did not run the test suite and three of its steps could not fail
when this was written; both were closed on the following branch. See
[TODO-quality-gates.md](TODO-quality-gates.md), also resolved.

## Reproducing

```bash
npm ci                       # once
npx markdownlint-cli2        # expected: Summary: 0 issues in 0 files
bash .ace/scripts/verify.sh  # expected: VERIFY_RESULT=pass gate=all
```
