---
name: az-read-work-item
description: Reads work items from Azure DevOps without writing anything — lists the backlog with filters (state, assignee, type, tag, sprint) and fetches one item in full, including description, acceptance criteria and parent/child relations, converted from HTML to markdown. ALWAYS use this when the user asks what is on the board, what is assigned to them, what is in progress, what is left in the sprint, asks to see or summarise a specific work item or ID, says things like "show me 3312", "what's in the backlog", "read that ticket", or the Spanish equivalents — even if Azure DevOps is not mentioned. Use it as the read step before refining, planning or taking an item.
---

# Read work item

Two modes, both read-only: **list** the board, and **get** one item in full.

**Read `azure-devops.config.json` at the repository root first.** Organization, project, area
path, work item types and valid states all come from there — never hardcode them in a query.
If the file is missing, or still contains `<PLACEHOLDER>` strings, stop and run
`az-devops-setup`.

Talk to the user in the language they used.

**This skill never writes.** No assign, no state change, no field edit, no branch, no comment.
If the conversation turns into taking or changing an item, hand off to `az-take-work-item` or
`az-create-work-item` and say so.

---

## 1. List

Start from `wiql.byArea` in the config and add the filters the user asked for:

```sql
SELECT [System.Id], [System.Title], [System.WorkItemType], [System.State],
       [System.AssignedTo], [Microsoft.VSTS.Common.Priority]
FROM WorkItems
WHERE [System.TeamProject] = '<project from config>'
  AND [System.AreaPath] UNDER '<areaPath from config>'
  AND [System.State] = '<state>'
ORDER BY [Microsoft.VSTS.Common.Priority] ASC, [System.Id] ASC
```

Common filters:

| Ask | Clause |
|---|---|
| Unassigned / available | `AND [System.AssignedTo] = ''` |
| Mine | `AND [System.AssignedTo] = @me` |
| Open only | `AND [System.State] IN (<the type's open list from the config>)` |
| One type | `AND [System.WorkItemType] = '<type>'` |
| Tagged | `AND [System.Tags] CONTAINS '<tag>'` |
| Current sprint | `AND [System.IterationPath] = '<iterationPath>'` |
| Changed recently | `AND [System.ChangedDate] >= @today - 7` |

Four things that silently return the wrong rows:

- **`CONTAINS` is rejected on area-path fields.** Use `UNDER`. An exact `=` also works but
  excludes child areas.
- **Do not use the `@project` macro.** It resolves through the REST/MCP path but returns
  **zero rows** under `az boards query` — indistinguishable from an empty backlog. Spell the
  project name out, as `wiql.byArea` does.
- **States are per work item type.** Filtering on a state that does not exist for the type in
  question returns nothing rather than erroring. Read the type's list from
  `workItems.states` before putting a state in a query.
- **WIQL returns IDs only.** Fetch titles and fields in a second batched call, not one
  request per ID.

**If the result is empty, suspect the query before believing the backlog is empty.** Re-run
without the area clause: if rows appear, the area path is wrong. Then re-run without the state
clause: if rows appear, the state name does not exist for that type.

**Fetch fresh data every time.** Do not reuse a listing from earlier in the conversation — the
board moves under you.

Show a compact table: ID, type, title, state, assignee, priority. Do not paginate silently —
if the result is capped, say how many were returned and how many exist.

---

## 2. Get one

The listing carries titles only. Re-fetch the item with the fields that matter — neither long
field comes back by default:

```text
System.Title, System.Description, System.WorkItemType, System.State, System.AssignedTo,
System.AreaPath, System.IterationPath, System.Tags, System.CreatedBy, System.ChangedDate,
Microsoft.VSTS.Common.AcceptanceCriteria, Microsoft.VSTS.Common.Priority
```

Add every project-specific field listed in `workItems.requiredFields` and
`workItems.picklists` — those are the ones that carry the process's own meaning.

Fetch relations too (`expand: Relations`): the parent is the item's context, and the children
tell you whether the work is already broken down.

**Both long fields come back as HTML**, not markdown: `<h2>`, `<ol>`, `<code>`, `<p>`.
Convert them before showing or writing them anywhere. Pasting raw HTML into a document is a
bug, not a formatting preference.

Report:

```text
#3312 — Product Backlog Item — In Progress — assigned to <user>
Area:    <areaPath>            Sprint: <iterationPath>
Parent:  #3290 <title>
URL:     <organization>/<project>/_workitems/edit/3312

<description, as markdown>

Acceptance criteria
1. ...
```

If a field the user asked about is empty, say it is empty. Do not fill the gap with a
plausible reading of the title — an inferred acceptance criterion is worse than a missing one,
because the next reader cannot tell which is which.

---

## 3. Out of area

An item outside `areaPath` belongs to another team. Read it if the user gives the ID
explicitly, but **say clearly that it is outside this project's area** — planning against it,
or taking it, is not this team's call.

---

## Authentication

Every call runs as the signed-in Azure CLI user. If anything returns
`ERROR: Please run 'az login' to setup account.`, re-run `az login` (with
`--allow-no-subscriptions` on a tenant with no subscriptions). See
`docs/AZURE_DEVOPS_MCP_SETUP.md`.

---

## What this skill does NOT do

- Write anything: no assign, no state change, no field edit, no comment, no branch.
- Create work items — that is `az-create-work-item`.
- Take a work item — that is `az-take-work-item`.
- Summarise a board it could not query. If the query failed, report the failure; do not
  answer from an earlier listing.
