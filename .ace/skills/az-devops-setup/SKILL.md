---
name: az-devops-setup
description: Connects a project to Azure DevOps by discovering the real organization, project, area path, work item types, required fields and states from the live board, then writing azure-devops.config.json, .mcp.json and docs/AZURE_DEVOPS_MCP_SETUP.md. ALWAYS use this when the user wants to connect a repository to Azure DevOps or ADO, set up the Azure DevOps MCP server, configure boards access for an AI assistant, or says things like "hook this up to the board", "configure ADO here", "set up work items for this repo", or the Spanish equivalents — and whenever another az-* skill reports that azure-devops.config.json is missing or still contains placeholders.
---

# Set up Azure DevOps

Produces the three files every other `az-*` skill depends on:

| File | Purpose |
|---|---|
| `azure-devops.config.json` | Repo root. The single source of coordinates and process constants. No secrets. |
| `.mcp.json` | Repo root. Registers the Azure DevOps MCP server for the AI client. |
| `docs/AZURE_DEVOPS_MCP_SETUP.md` | Human-facing setup and gotchas document. |

Templates for all three are in `templates/` next to this file. They are placeholder-filled
on purpose.

Talk to the user in the language they used. Write the files in English.

## Principle

**Every value is discovered, never guessed.** Area paths, states and picklist values are
process-template specific: a plausible-looking guess produces `TF51011` or `TF401320` on
first use, or — worse — a query that silently returns zero rows and reads as an empty
backlog. A config written from assumptions is more expensive than no config.

**No `<PLACEHOLDER>` may survive into a written file.** If a value cannot be discovered and
the user does not know it, stop and say which one is missing. Do not write the file partially
filled.

---

## 1. Preflight

```bash
node --version          # 20+
az --version
az account show -o json
```

If `az account show` fails with `ERROR: Please run 'az login' to setup account.`:

```bash
az login                              # or, on a tenant with no subscriptions:
az login --allow-no-subscriptions
```

The `--allow-no-subscriptions` case is not cosmetic — without the flag a subscription-less
account authenticates and then fails to persist, so every later command claims the login
never happened. Ask the user to run the login themselves; do not run an interactive login on
their behalf.

Then check what already exists:

```bash
ls azure-devops.config.json .mcp.json docs/AZURE_DEVOPS_MCP_SETUP.md 2>/dev/null
```

If any exists, **read it and show the user what it contains before touching it.** Ask
whether to update in place or leave it. Never overwrite a populated config silently — it may
carry field values discovered by hand that no API returns cleanly.

**`.mcp.json` is shared with every other MCP server the project uses.** Treat an existing one
as owned by the team, not by this skill: it commonly registers servers this setup knows
nothing about, and replacing it with the template silently disconnects all of them. Merge, as
described in §3.

---

## 2. Discovery

Run these and use the output. Where a command fails because of permissions, ask the user for
the value and say plainly that it was not verified against the API.

### Organization and project

```bash
az devops project list --organization https://dev.azure.com/<org> \
  --query "value[].{name:name,id:id}" -o table
```

Ask for the organization name if it is not already in a `.git` remote — check
`git remote -v` first, an `dev.azure.com` remote carries both org and project.

### Repository and default branch

```bash
az repos list --organization <org-url> --project <project> \
  --query "[].{name:name,defaultBranch:defaultBranch}" -o table
```

The config stores the branch **without** the `refs/heads/` prefix.

**Area paths** — list, never infer:

```bash
az boards area project list --organization <org-url> --project <project> --depth 5 -o json
```

Show the paths to the user and let them pick the one this repository belongs to. Store it
backslash-separated, `<Project>\<Area>`, exactly as returned.

### Iterations

```bash
az boards iteration project list --organization <org-url> --project <project> --depth 3 -o json
```

### Work item types and states

```bash
az boards work-item ... # if unavailable, use the REST API:

TOKEN=$(az account get-access-token \
  --resource 499b84ac-1321-427f-aa17-267ca6975798 --query accessToken -o tsv)

curl -s -H "Authorization: Bearer $TOKEN" \
  "<org-url>/<project>/_apis/wit/workitemtypes?api-version=7.1"

curl -s -H "Authorization: Bearer $TOKEN" \
  "<org-url>/<project>/_apis/wit/workitemtypes/<type>/states?api-version=7.1"
```

Fill one `workItems.states` block per type the team actually uses. Each state comes back with
a `category` (`Proposed`, `InProgress`, `Resolved`, `Completed`, `Removed`) — use it to derive
`open` and `closed`, and take `default` from the first `Proposed` state.

**Do not copy one type's states onto another.** A type's initial state is frequently not
`New`, and `In Progress` is absent from more workflows than you would expect. This one
shortcut causes most failed transitions.

### Required fields and picklists

```bash
curl -s -H "Authorization: Bearer $TOKEN" \
  "<org-url>/<project>/_apis/wit/workitemtypes/<type>/fields?api-version=7.1"
```

`alwaysRequired: true` gives `workItems.requiredFields`. For every field with
`allowedValues`, record them under `workItems.picklists` keyed by reference name
(`Custom.*` fields are project-specific and cannot be guessed).

A cheaper cross-check when the API is awkward: read an existing work item of that type and
see what it carries.

---

## 3. Write the files

Copy each template from `templates/`, substitute every placeholder, and write:

| File | If it does not exist | If it exists |
|---|---|---|
| `azure-devops.config.json` | Write the filled template | Update only the keys that changed; keep values already discovered by hand. Show a diff first |
| `.mcp.json` | Write the filled template | **Merge — see below.** Never overwrite |
| `docs/AZURE_DEVOPS_MCP_SETUP.md` | Write the filled template | Ask before replacing; the team may have added notes worth keeping |

### Merging into an existing `.mcp.json`

Parse the file, add one key under `mcpServers`, write the whole object back. Everything else
in the file — other servers, `env` blocks, client-specific keys, ordering — is preserved
verbatim.

```json
{
  "mcpServers": {
    "<servers already there — untouched>": {},
    "azure-devops": {
      "command": "npx",
      "args": ["-y", "@azure-devops/mcp@<version>", "<org>", "-d", "core", "work", "work-items"]
    }
  }
}
```

- **An `azure-devops` key already present is a conflict, not a free overwrite.** Show the
  existing entry next to the new one and ask which to keep. A different organization there
  means the repository is already pointed somewhere else — stop and resolve that with the user
  before writing anything.
- Preserve the file's formatting: indentation width, key order, trailing newline. A reformat
  turns a one-line change into an unreviewable diff.
- If the existing file is invalid JSON or carries comments (JSONC), **do not attempt a
  rewrite.** Show the user the exact block to paste and let them place it.
- Confirm the merge parsed: re-read the file and check that every server present before is
  still there.

The same rule applies to any client-specific config that may hold the server instead —
`.vscode/mcp.json`, `.cursor/mcp.json`, a user-level `~/.claude.json`. If the project registers
its MCP servers somewhere other than `.mcp.json`, add the entry there and say which file was
touched.

Rules:

- **Pin the MCP server version.** Query the current one (`npm view @azure-devops/mcp version`)
  and write `@azure-devops/mcp@<version>`. An unpinned server changes tool names under the
  skills that call it.
- Keep `-d core work work-items` unless the user needs repos, pipelines, wiki or test plans.
  A narrower domain list means fewer tools competing for the model's attention.
- Delete every `$comment` key whose instruction has been carried out, and every unfilled
  optional block. A config full of scaffolding comments is read as unfinished.
- Set `paths.prdDir` to where this project keeps requirements, or `""` if it has none —
  `az-take-work-item` skips PRD drafting when it is empty.
- **Never write a PAT, token or password into any of the three files.** Authentication is the
  Azure CLI session. If the user offers a PAT, decline and point at `az login`.

Then tell the user, in one line each: which files were written and which were merged, and
that `.mcp.json` requires restarting the editor before the tools appear.

---

## 4. Verify — do not skip

A config that was never exercised is a config that is wrong.

```bash
az devops configure --defaults organization=<org-url> project=<project>
```

Then run the `wiql.byArea` query from the config, exactly as written:

```bash
az boards query --wiql "<the byArea query, verbatim>" -o table
```

| Result | Meaning |
|---|---|
| Rows returned | The org, project and area path are all correct. Done. |
| Zero rows | **Suspect the area path before believing the backlog is empty.** Re-run without the `AND [System.AreaPath] UNDER ...` clause: if rows appear, the path is wrong — go back to §2 and pick from the listed paths. |
| `TF51011` | Area path does not exist. Same fix. |
| Auth error | Token expired. Re-run `az login`. |

Then confirm the MCP server itself starts:

```bash
npx -y @azure-devops/mcp@<version> <org> -d core work work-items --help
```

Report the verification result plainly. If the query returned zero rows and the cause was not
established, say the setup is **unverified** — do not describe it as complete.

---

## 5. Register with the framework

- Add `azure-devops.config.json` to the ACE context paths only if the project tracks it.
- If `.gitignore` should carry `.mcp.json`, ask — do not decide for the team.
- Record the connection in `docs/context/ACTIVE_CONTEXT.md` as part of session wrap-up.

---

## Common mistakes

- **Guessing an area path from the project name.** List them. Every time.
- **Copying another project's config.** Custom fields, picklists and states do not transfer.
- **Leaving `<PLACEHOLDER>` strings in a written file.** The next skill reads them as data.
- **Overwriting an existing `.mcp.json` with the template.** Every other MCP server the
  project registered disappears, and the breakage surfaces later as missing tools, not as an
  error here.
- **Assuming `New` and `In Progress` exist on every type.** They frequently do not.
- **Writing a PAT into `.mcp.json`.** There is no reason to; `az login` covers it.
- **Declaring success on a zero-row query.** That is the signature of a wrong area path, not
  of an empty board.
