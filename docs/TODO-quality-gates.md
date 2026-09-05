# Quality Gates and Tooling Defects — Resolved

Status: **resolved** on 2026-08-31. All nine findings are closed.

Originally opened 2026-08-24 against commit `f2e4ced`, from findings produced
by running the tooling rather than reading it.

Related: [TODO-markdown-lint.md](TODO-markdown-lint.md), resolved earlier,
closed the markdown half of finding 2.

## What was wrong

Findings 1, 2 and 4 shared one failure mode: **a gate that exists but cannot
fail.** CI never ran the 88-test suite that `CLAUDE.md` calls "the repo's
verify gate"; the YAML step printed `❌ Invalid: <file>` and left the job
green; the release changelog fell back silently to "last 20 commits" on every
release. In effect CI verified that certain directories exist.

The rest were smaller but real: the CLI could not run unattended, a skill was
referenced by nothing, the guard hook over-matched, the Stop hook ran the full
test suite on every agent turn, and fifteen documentation links were broken.

## What was done

| # | Finding | Commit |
| --- | --- | --- |
| 7 | Stop hook ran the full suite every turn | `a16610b` |
| 2 | YAML step could not fail | `edec4a1` |
| 3 | No encoding check | `b4b0f6f` |
| 1 | CI never ran the test suite | `111b0a9` |
| 4 | Release changelog broken by a shallow clone | `95b4702` |
| 5 | CLI could not run unattended | `45d2ae6` |
| 8 | Guard matching over-blocked | `999a764` |
| 6 | Orphaned `phantom-link` skill | `dbeab57` |
| 9 | Fifteen broken runbook links | `e4dc45a` |
| 2 | Link check could not fail | `ab04650` |

Every step in `.github/workflows/validate.yml` now either fails on a real
defect or says "advisory, does not gate" in its own name:

| Step | Gates? |
| --- | --- |
| Validate Structure — `scripts/validate.sh` | yes |
| Verify Gate — `.ace/scripts/verify.sh` | yes (tests + lint) |
| Check Encoding — `scripts/check-encoding.sh` | yes |
| Check YAML Syntax — `scripts/check-yaml.sh` | yes |
| Validate Internal Links — lychee `--offline` | yes |
| Validate External Links | no, and says so |

## Decisions worth carrying forward

**CI calls the scripts instead of copying them.** The workflow used to
re-implement structure validation inline — a 25-line block that checked a
subset of what `scripts/validate.sh` already checked — and ran markdown lint
from its own definition even though `.aceconfig` already named that command.
Both copies were free to drift. CI now runs `validate.sh` and `verify.sh`, so
"passing" has one definition. The cost is granularity: one red X on the verify
step can mean tests or lint. Its output labels each gate, so the log still
says which.

**The verify gate has two profiles, and the split is by flag.** `--fast` runs
lint and typecheck and skips the test suite; the default runs everything.
The Stop hook uses `--fast`, CI and the loop runner use the default. Measured
here: 1.2s fast, 4.3s full. The flag was chosen over a second config block so
scaffolded projects inherit the split without any new configuration, and so
`verify.sh`'s sed-based parser stays untouched.

Neither profile can pass vacuously: `--fast` discards `test_cmd` before the
unconfigured-gate check runs, so a project whose only configured command is
its test suite fails a fast run rather than finding nothing to do and
reporting success.

**Only the deterministic half of the link check gates.** `--offline` resolves
links to files in this repository, so it fails on a link to a document that
does not exist and never on someone else's server being down. External links
stay advisory. Gating on them would break unrelated pull requests for reasons
their authors cannot fix.

**Unattended means refusing, not assuming.** `create-ace-framework --yes`
declines a non-empty target directory instead of scaffolding into it.
Accepting defaults must not silently mean overwriting, and the caller is by
definition not present to notice.

**The encoding check matches the corruption, not all non-ASCII.**
`scripts/check-encoding.sh` looks for the byte sequences that UTF-8-read-as-
cp1252 produces, so accents, arrows and the box-drawing diagrams in
`USER_GUIDE.md` are untouched. Its pattern is assembled from octal escapes,
because a script containing literal mojibake would flag itself.

**`.aceconfig` is now YAML-checked.** No `*.yml` glob matches it, yet it is
parsed by `verify.sh` and is the first file every agent reads.

## Corrections to the original findings

- **Finding 3** said the encoding repair was "local and unpushed". It has since
  been pushed: `origin/main` and `main` are both `1b86891`, no mojibake remains
  outside `.ace/packs`, and a scaffold created from upstream today is clean.
  Verified by scaffolding and running the new check against the result. Only
  the CI check was still outstanding.
- **Finding 9** described literal `[link]` and `[link-to-dashboard]`
  placeholders. The actual strings were `(link)` and `(link-to-dashboard)` as
  link *targets*, plus shortcut references in the README's template. Same
  fifteen errors, different text.
- The test count in the original document was 88. It is 112 after this branch.

## Still open

Nothing from this document. Two things it touched are deliberately left:

- The seven missing runbooks are listed in `docs/runbooks/README.md` as
  suggested additions rather than links. A runbook written against an unknown
  stack is a template, and the template is already there.
- `.cursorrules` lists eight of twenty-four skills. It is not an index and was
  not treated as one.

## Reproducing

```bash
bash scripts/validate.sh          # structure
bash .ace/scripts/verify.sh       # tests + lint;  VERIFY_RESULT=pass gate=all
bash .ace/scripts/verify.sh --fast # lint only;    VERIFY_RESULT=pass gate=fast
bash scripts/check-encoding.sh    # no double-encoded UTF-8
bash scripts/check-yaml.sh        # all 8 YAML documents parse
node cli/bin/create-ace-framework.js --help
```

Each gate was also verified to fail, which is the point of the branch: an
invalid YAML file, an injected mojibake sequence, a deleted required file, a
failing `lint_cmd`, and a link to a nonexistent document each turn their step
non-zero.
