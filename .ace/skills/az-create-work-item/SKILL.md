---
name: az-create-work-item
description: Guides the user through creating a well-formed work item in Azure DevOps, using a short structured interview that fills every required field and validates the item works as a specification before it is created. ALWAYS use this when the user wants to create a story, work item, requirement, PBI, bug or ticket in Azure DevOps, or says things like "I need to write this up", "let's document this requirement", "add this to the backlog", "raise a bug for this", or the Spanish equivalents — even if Azure DevOps is never mentioned. Also use when asked to refine or improve an existing work item.
---

# Create work item

Turns a loose idea into a work item a developer (or an agent) can pick up with
`az-take-work-item` without having to ask anything else.

**Read `azure-devops.config.json` at the repository root first.** Organization, project, area
path, iteration, work item types, required fields, picklist values and valid states all come
from there — never hardcode them, and never carry a value over from another project. If the
file is missing, or still contains `<PLACEHOLDER>` strings, stop and run `az-devops-setup`.

Talk to the user in the language they used. Write the work item content in English, matching
the existing board.

## Principle

The bottleneck is not writing the item, it is refining it. A two-line item produces a
convincing and wrong task breakdown. This skill exists so that never reaches a developer.

**Do not create the work item until the validation in §4 passes.**

Checks **1, 2, 4 and 8 are hard blockers.** If any of them fails, do not create the work item
under any circumstances — not even if the user insists. Report which one failed, ask for the
missing input, and re-run the validation. An item with a vague title, no stated why, or no
boundaries is the exact failure this skill exists to prevent; creating it anyway defeats the
purpose. **Check 8 is blocking for a different reason:** the process template rejects the
create outright (§3), so "proceed anyway" produces a `TF401320` API error instead of a work
item — better to refuse clearly than to fail obscurely.

For the remaining checks (3, 5, 6, 7, 9), if the user insists on creating something
incomplete, create it but record what is missing in the description.

---

## 1. Interview

**Ask with the AskUserQuestion tool, not as free text, whenever the answer is a choice from a
known set** — type, priority, and any field listed under `workItems.picklists`. The allowed
values are in the config; offering them as options prevents an invalid value reaching the
API. Use free text only for title, context, scope and criteria.

Ask one block at a time. If the user already answered something in their opening message, do
not ask again — confirm it and move on.

### Block A — What and why

- What needs to happen? (one sentence)
- Why now — what problem does it solve, or what breaks without it?
- Who is affected: which role, screen or module?

### Block B — Type and shape

Offer as options, sourced from the config:

- Work item type. Default `workItems.defaultType`. Use `Bug` only for defective behaviour in
  something already delivered; use `Task` only when it is a step under an existing parent,
  and ask which one.
- Every field in `workItems.picklists` that applies to the chosen type. Offer the exact
  allowed values — a picklist rejects anything outside its list, and the values are
  project-specific. If a value the user wants is absent, say so and ask which listed value
  is closest; do not invent one.
- Priority, where the process uses it. Integer. **Look at what the board actually uses**
  before offering a scale — query a handful of existing items rather than assuming 1–4 are
  all in play.

### Block C — Boundaries

- What is explicitly OUT of scope?
- Does it depend on another work item, a migration, or a third party?
- Is there an existing behaviour that must be preserved?

### Block D — How we know it is done

- What must be observable when this is finished?
- Which error or edge cases matter?
- Business rules, validations or limits?

### Block E — Technical context (only if the user has it)

- Known files, endpoints, entities, components?
- Existing evidence: a report, a screenshot, an assessment section?

---

## 2. Drafting

**Title:** imperative and concrete, max ~70 characters. If the item traces to a tracked
finding, keep the existing prefix so the board and the project's issue log stay greppable —
e.g. `BUG-019 — Backend: Reads unbounded, no pagination`.
Good: `Allow login with Entra ID SSO`. Bad: `Login`.

**Description:** the board stores HTML. Pass `format: Html` on create, or write plain
Markdown and let the MCP convert it. Match the shape of the existing items on this board —
read one before drafting. A reasonable default:

```markdown
## Problem
What is wrong or missing, with concrete evidence — file:line, an error string, a measured
number. 2-4 lines.

## Impact
Why it matters. Numbered, one consequence per line.

## Proposed fix
What to do. Include the code sketch if there is one.

## Source
Where this came from: a report, an assessment section, a meeting, an incident.
```

**Acceptance criteria:** field `Microsoft.VSTS.Common.AcceptanceCriteria`, as a list.
A criterion is valid only if it is **verifiable without human judgement**. "Must be fast" is
not a criterion; "responds in under 500 ms at p95" is. Prefer criteria that name the command
or the observation that proves them — `grep -rn "X" returns only the gated occurrence` beats
"the code is correct".

Include at least one error or edge path, and at least one "nothing else broke" criterion.

---

## 3. Required fields

The process template **rejects** a create that omits any field in `workItems.requiredFields`,
with `TF401320: Rule Error for field <name>`. Read that list from the config — it is
process-specific and typically includes fields beyond `System.Title`.

**Ask for every required field. Never fill one silently.** Date fields are the usual trap: if
the user has no target date, propose one and say plainly that it is a placeholder.

Also set:

- `System.AreaPath` — `areaPath` from the config. Never leave it at the project root; an item
  created outside the area is invisible to `az-read-work-item` and `az-take-work-item`.
- `System.IterationPath` — `iterationPath` from the config unless the user names a sprint.
- `System.State` — the type's initial state from `workItems.states.<type>.default`.
  **This is per type.** A state valid on one type is rejected on another, and the initial
  state is frequently not `New`.
- `System.Tags` — optional, but tag anything belonging to a batch so it can be queried later.

**Leave it unassigned.** A developer takes it with `az-take-work-item`; assigning at creation
breaks that flow.

**Parent:** ask whether it belongs under an existing Feature or Epic. The MCP `create` action
does not accept a parent, so either link afterwards or POST the JSON-patch document with the
relation included, using `workItems.parentRelation` from the config:

```json
{
  "op": "add",
  "path": "/relations/-",
  "value": {
    "rel": "System.LinkTypes.Hierarchy-Reverse",
    "url": "<organization>/_apis/wit/workItems/<parentId>"
  }
}
```

---

## 4. Validation — blocking

Check before creating and show the result to the user:

| # | Check | Fails if | On failure |
|---|---|---|---|
| 1 | Title is imperative and specific | It is a single word or a bare noun | 🛑 **Blocks creation** |
| 2 | Problem section explains the why | It only restates the title | 🛑 **Blocks creation** |
| 3 | Evidence is concrete | No file, number, error string or source named | Warn |
| 4 | Out of scope / boundaries stated | Nothing was listed | 🛑 **Blocks creation** |
| 5 | ≥2 acceptance criteria | Fewer than 2 | Warn |
| 6 | ≥1 error-path criterion | All are happy path | Warn |
| 7 | Criteria are verifiable | Any uses "correct", "adequate", "fast", "friendly" | Warn |
| 8 | Every field in `requiredFields` has a value | Any is empty or guessed | 🛑 **Blocks creation** — the API rejects it (§3) |
| 9 | Fits in one sprint | The user says no, or there are >6 distinct scenario criteria | Warn — propose splitting and ask before continuing |

**Checks 1, 2, 4 and 8 block creation and cannot be overridden by the user.** The first three
make an item usable as a specification: what it is, why it exists, and where it stops. Check 8
is mechanical — the board will not accept the item without those fields, so overriding it just
turns a clear refusal into `TF401320`. The rest are warnings — report them, let the user
decide, and record what is missing in the description if they choose to proceed.

Show the result plainly, no decoration. If a blocking check failed, say so and stop:

```text
Validation: 7/9
✗ #4 Out of scope empty          BLOCKING
✗ #6 No error-path criterion     warning

Not creating. Fix #4 first: what is explicitly out of scope for this item?
```

When every blocking check passes, name the warnings that remain and continue to §5:

```text
Validation: 8/9
✗ #6 No error-path criterion     warning

No blockers. Proceed, or add an error-path criterion first?
```

After the user supplies the missing input, **re-run the full validation** — do not assume the
fix landed. A blocking check that failed once is checked again before every create attempt.

---

## 5. Creation

**Gate:** checks 1, 2, 4 and 8 from §4 must be passing. If any is still failing, stop here and
go back to §4 — no summary, no approval prompt, no create call.

Show the full summary — every field, with its value — and **wait for explicit approval**.
Only then create.

After creating, return the ID and the URL
`<organization>/<project>/_workitems/edit/{id}`, plus the parent link if one was set.
Nothing else.

Then verify: re-read the item and confirm the area path, state and parent are what was
intended. A create that succeeds with the wrong area path is silently invisible.

If several items are being created from one source, write them as drafts first, show the
table, get approval once, and create them in a batch — do not ask nine times.

---

## 6. Refining an existing work item

Same process, but fetch the item first (use `az-read-work-item`), verify it is inside
`areaPath` (refuse if it is not), run the §4 validation against what it already has, and show
only the fields that would change. Never rewrite a description without showing the diff.

---

## Common mistakes

- **Inventing a required date.** It is required, so it is tempting to fill silently. Always
  say when a date is a placeholder.
- **Guessing a picklist value.** Picklist fields reject anything outside their list, and the
  lists are project-specific. Read the config; do not assume a "Bug" or "Tech Debt" option
  exists.
- **Using a state from the wrong type.** `In Progress` is not valid on every type — see
  `workItems.states`.
- **Creating a Task instead of a backlog item.** If the user describes a technical step
  ("add an index to the table"), ask which parent it belongs to.
- **Packing several features into one item.** If "and" appears in the title, it is almost
  always two items.
- **Assuming the area path.** `areaPath` in the config is the only valid value. A different
  area means a different team.
- **Trusting a create that returned no error.** Verify the area path afterwards.
