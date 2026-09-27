---
name: az-take-work-item
description: Takes a work item in Azure DevOps — lists what is available, assigns the chosen item to the signed-in developer, moves it to the type's in-progress state, creates the branch from the remote base branch and drafts a PRD from the item. ALWAYS use this when a developer wants to start working on something, asks what is available, says "what should I pick up", "give me the next item", "I'll take 3312", "starting on this", asks to create the branch for a work item, or says the Spanish equivalents — even if Azure DevOps is not mentioned. Also use to show which work items are currently assigned to them.
---

# Take work item

**Read `azure-devops.config.json` at the repository root first.** Organization, project, area
path, base branch, valid states, required fields and document paths all come from there —
never hardcode them in a command. If the file is missing, or still contains `<PLACEHOLDER>`
strings, stop and run `az-devops-setup`.

This skill **writes to the board and to git**: it assigns, changes state and creates a branch.
Confirm with the developer before the write block in §3.

Talk to the developer in the language they used.

---

## 1. List candidates

Use `az-read-work-item`'s list mode, or run the query directly. Candidates are items that are:

- `System.AreaPath` **UNDER** `areaPath` from the config — mandatory, never omit
- `System.AssignedTo` empty
- in the type's initial state — `workItems.states.<type>.default` in the config

```sql
SELECT [System.Id], [System.Title], [System.WorkItemType], [Microsoft.VSTS.Common.Priority]
FROM WorkItems
WHERE [System.TeamProject] = '<project from config>'
  AND [System.AreaPath] UNDER '<areaPath from config>'
  AND [System.State] = '<the type's default state>'
  AND [System.AssignedTo] = ''
ORDER BY [Microsoft.VSTS.Common.Priority] ASC, [System.Id] ASC
```

**The initial state is per type.** Backlog items, bugs and features usually start in one
state and tasks in another — read each type's `default` from the config rather than assuming
`New` covers everything. If the developer is looking for tasks specifically, query that
type's default state.

Three things that silently return the wrong rows:

- **`CONTAINS` is rejected on area-path fields.** Use `UNDER`. An exact `=` also works but
  excludes child areas.
- **Do not use the `@project` macro.** It resolves through the REST/MCP path but returns
  **zero rows** under `az boards query` — indistinguishable from an empty backlog.
- **WIQL returns IDs only.** Fetch titles and fields in a second batched call.

**If the result is empty, suspect the area path before believing the backlog is empty.**
Re-run without the area clause: if rows appear, the path is wrong.

**Fetch fresh data every time.** Between listing and choosing, another developer may have
taken the same item. Do not reuse results from earlier in the conversation.

Show: ID, type, title, priority. If nothing is available, say so and offer to list the items
already assigned to them.

---

## 2. Selection

The developer picks an ID. If they gave an ID directly without asking for the list, skip to §3
but **still verify** it is unassigned, in its type's initial state, and inside `areaPath`.

- Outside the area path → stop. It does not belong to this team.
- Already assigned to someone else → stop and say who has it.
- Not in the initial state → stop and report the actual state.

---

## 3. Take it — write block

Show exactly what will happen and wait for approval:

```text
Work item #3312 — BUG-019 — Backend: Reads unbounded, no pagination
  Assign to:  <signed-in user>
  State:      New → In Progress
  Branch:     3312-backend-reads-unbounded-no-pagination  (from origin/development)
  PRD:        docs/requirements/PRD-006-backend-reads-unbounded-no-pagination.md  (draft)
```

The assignee is the authenticated Azure CLI user:

```bash
az account show --query "user.name" -o tsv
```

Once approved, in this order:

1. **Assign** `System.AssignedTo` to that user.
2. **Change state** to the type's in-progress state.

> **The in-progress state is per type.** Read `workItems.states.<type>` from the config and
> pick a state from that type's own list — several workflows have no `In Progress` at all and
> use a differently named state for the same stage. If a transition fails, read the valid list
> for that type out of the config and report it. **Never guess a variant**, and never reuse
> the state that worked for a different type last time.

If the state change fails, **report that it was assigned but not moved.** Do not let it pass
silently — a half-taken item reads as available to the next developer.

---

## 4. Branch

Format: `{id}-{slug}`, branched from the **remote** base branch — `origin/{defaultBranch}`
from the config.

Always branch from the remote ref, never from the local branch of the same name and never
from whatever happens to be checked out. A stale local base, or an unrelated feature branch
left over from the last task, silently puts the new branch on the wrong base — the diff then
carries commits that were never part of this work item.

Build the slug from the title: lowercase, no accents, no articles, words joined by `-`,
max 50 characters. Strip a leading tracking prefix (`BUG-0NN —`, `REQ-2026-00NN`) if the title
has one — the numeric work item ID is already the first segment.

```bash
git status --short                                 # refuse if tracked files are dirty
git fetch origin
git rev-parse --verify origin/<defaultBranch>      # fail loudly if the ref is missing
git checkout -b 3312-backend-reads-unbounded-no-pagination origin/<defaultBranch>
```

The branch name is the last argument, the base is the remote ref — passing the base first
creates a branch off `HEAD` with the wrong name.

Refuse to branch from a dirty working tree; let the developer commit or stash first.
Untracked files alone do not block the checkout.

Confirm the base took before reporting success:

```bash
git rev-parse HEAD origin/<defaultBranch>          # both hashes must match
```

**Link the branch to the work item in ADO.** The name alone creates no traceability; without
the link the PR does not inherit the relation and the sprint report is incomplete. Use the
artifact-link tool if available (`add_artifact_link`, type `Branch`). If it is not, tell the
developer to use "Create a branch" from the work item in the web UI, or to put `AB#<id>` in
the first commit message.

---

## 5. PRD

Only if `paths.prdDir` in the config is set. If it is empty, skip this section and say so.

Once the branch exists, draft the PRD from the work item. This is a **draft for the developer
to correct** — never presented as approved, never committed automatically.

### Fetch the full item

Use `az-read-work-item`'s get mode. `System.Description` and
`Microsoft.VSTS.Common.AcceptanceCriteria` are the two fields that matter and neither comes
back by default. Fetch relations too (`expand: Relations`) — the parent Feature/Epic is the
PRD's context.

**Both long fields come back as HTML**, not markdown. Convert them. Pasting raw HTML into the
PRD is a bug, not a formatting preference.

### Number and filename

```bash
ls <prdDir>/PRD-*.md          # highest existing number, ignore the template
```

Next number, zero-padded to three: `PRD-{NNN}-{slug}.md` in `paths.prdDir`. The slug is built
the same way as the branch slug in §4, so the branch and the PRD read as a pair. Never reuse a
number — if two developers took items in parallel, re-check before writing.

### Fill the template

Copy `paths.prdTemplate` if it exists; if it does not, use the project's existing PRDs as the
shape. Header block:

```text
# Product Requirements Document: PRD-{NNN} {Title without the tracking prefix}

> **Status:** Draft
> **Author:** {assignee display name} (drafted from work item #{id})
> **Last Updated:** {today, YYYY-MM-DD}
> **Work Item:** [AB#{id}](<organization>/<project>/_workitems/edit/{id})
> **Stakeholders:** TODO — confirm with the PO
```

The `Work Item` line is usually not in a stock template. Add it — it is the only link back to
the board, and without it the PRD is an orphan.

| PRD section | Source | Rule |
|---|---|---|
| Executive Summary | Title + first paragraph of Description | 2–3 sentences, no new claims |
| Problem Statement → Current State | Description "Problem" heading | Keep file:line references verbatim |
| Problem Statement → Pain Points | Description "Impact" list | One bullet per item, do not merge |
| Impact | Description "Impact" | Quantify only where the item quantifies |
| Primary Goals | Description "Proposed fix" | State the outcome, not the implementation |
| Non-Goals | Description "Out of scope" | Copy the list as-is |
| User Stories → Acceptance Criteria | `AcceptanceCriteria` field | One checkbox per numbered criterion |
| Functional Requirements | `AcceptanceCriteria`, testable items | Map priority to Must/Should/Could/Won't |
| Non-Functional Requirements | Description, where it names limits | Leave `TODO` where the item is silent |
| Risks → Likelihood/Impact | A complexity field, if the process has one | Do not invent a likelihood |
| Timeline → Milestones | The item's target date field | Mark it `PLACEHOLDER` if the item says so |
| Open Questions | Anything the item leaves undecided | This section earns its keep — use it |

### Do not invent

A template has sections the work item cannot answer: Success Metrics, User Flow, Wireframes,
Edge Cases, Glossary, Approval.

- Write `TODO — not specified in work item #{id}` and move on.
- **Leave the Approval table empty.** Never fill in a name, a date or a signature. A PRD that
  looks signed off when nobody signed it is worse than no PRD.
- Where the template wants a reference that does not exist, say `N/A — {reason}`.
- If the item's Description is empty or a single line, say so and skip the PRD rather than
  padding it. An invented PRD is worse than none.

### Show it

Report the path and the sections left as `TODO`. Ask the developer to review before they build
on it — the work item is one person's summary of the code, not the code.

---

## 6. Wrap-up

Report in three lines: work item taken (ID + new state), branch created, and the PRD path,
with the work item URL `<organization>/<project>/_workitems/edit/{id}`.

Then update `docs/context/ACTIVE_CONTEXT.md` with what was taken.

---

## Authentication

Every call runs as the signed-in Azure CLI user. If anything returns
`ERROR: Please run 'az login' to setup account.`, re-run `az login` (with
`--allow-no-subscriptions` on a tenant with no subscriptions — those accounts authenticate but
never persist the profile without it). See `docs/AZURE_DEVOPS_MCP_SETUP.md`.

---

## What this skill does NOT do

- Create work items — that is `az-create-work-item`.
- Take several items at once. One at a time, or the board stops reflecting what each person is
  actually working on.
- Move items between iterations. That is the PO's job.
- Push the branch, commit the PRD, or open a PR.
- Approve the PRD it drafts. Draft status only, PO signs off.
- Touch anything outside `areaPath`. Out of scope means out of scope.
