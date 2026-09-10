# Connecting the Azure DevOps MCP Server

How to give an AI coding assistant (Claude Code, VS Code, Cursor) direct access to this
project's Azure DevOps work items, repositories and pipelines — so it can query and create
work items without leaving the editor.

- **Organization:** `<ORG_NAME>` — `https://dev.azure.com/<ORG_NAME>`
- **Project:** `<PROJECT_NAME>`
- **Area path for this app:** `<PROJECT_NAME>\<AREA_PATH>`

The same values live in `azure-devops.config.json` at the repository root. Skills and
scripts read them from there; this document explains them and records what broke while
setting the connection up.

---

## 1. Prerequisites

| Requirement | Check | Notes |
|---|---|---|
| Node.js 20+ | `node --version` | The MCP server runs through `npx` |
| Azure CLI | `az --version` | |
| Azure DevOps access | Sign in to the org in a browser | At least **Basic** access to the project |

The `azure-devops` extension for the Azure CLI installs itself on first use — no manual
install step.

---

## 2. Sign in with the Azure CLI

The MCP server authenticates through your Azure CLI credentials. There is no PAT to create
and no secret to store in the repository.

```bash
az login
```

> **If the tenant has no Azure subscriptions, use `az login --allow-no-subscriptions`.**
> A plain `az login` authenticates successfully but then refuses to persist the account,
> leaving a populated `~/.azure/msal_token_cache.json` and an empty
> `~/.azure/azureProfile.json`. Every later command fails with
> `ERROR: Please run 'az login' to setup account.` — which looks like the login never
> happened.

### Verify

```bash
az account show -o json
az account get-access-token --query expiresOn -o tsv
```

A `null` / `N/A` subscription is expected on a tenant-level account and is not a problem:
resource-management commands (`az vm`, `az storage`, `az group`) will not work, while
tenant, Entra and Azure DevOps commands are unaffected.

---

## 3. Configure the MCP server

`.mcp.json` at the repository root:

```json
{
  "mcpServers": {
    "azure-devops": {
      "command": "npx",
      "args": ["-y", "@azure-devops/mcp@<VERSION>", "<ORG_NAME>", "-d", "core", "work", "work-items"]
    }
  }
}
```

- `<ORG_NAME>` — the organization name, passed positionally.
- `-d core work work-items` — restricts the server to the domains this project needs.
  Drop the flag to expose everything (repos, pipelines, wiki, test plans, advanced security);
  a narrower scope means fewer tools competing for the model's attention.
- Pinning `@<VERSION>` keeps every machine on the same tool surface. Drop the pin to track
  latest, and expect tool names to move under you when it changes.

`mcpServers` holds one key per server. If the file already registers others, **add the
`azure-devops` key alongside them** — replacing the file disconnects every other server, and
that surfaces later as missing tools rather than as an error. Some clients read a different
file instead (`.vscode/mcp.json`, `.cursor/mcp.json`, a user-level `~/.claude.json`); the
entry is the same wherever it lands.

`.mcp.json` is developer tooling, not application code. Decide as a team whether to commit
it or add it to `.gitignore` — it contains no secrets either way.

Restart your editor / AI client after creating the file so the server is picked up.

---

## 4. Verify the connection

Ask the assistant to list the projects, or run the equivalent CLI call:

```bash
az devops configure --defaults \
  organization=https://dev.azure.com/<ORG_NAME> \
  project=<PROJECT_NAME>

az boards query --wiql "SELECT [System.Id], [System.Title] FROM WorkItems \
  WHERE [System.TeamProject] = '<PROJECT_NAME>'" -o table
```

A healthy setup returns rows from `<PROJECT_NAME>` (id `<PROJECT_GUID>`).

---

## 5. Gotchas

These cost real time on first use.

### Area paths rarely match the naming convention you infer

The area for this app is:

```text
<PROJECT_NAME>\<AREA_PATH>
```

Sibling areas may follow a different convention. Guessing produces
`TF51011: The specified area path does not exist`. List them instead:

```bash
az boards area project list --depth 5 -o json
```

### `CONTAINS` is rejected on area-path fields

```sql
-- fails: "The specified operator cannot be used with area path fields"
WHERE [System.AreaPath] CONTAINS '<AREA_PATH>'

-- correct
WHERE [System.AreaPath] UNDER '<PROJECT_NAME>\<AREA_PATH>'
```

### The `@project` macro is not portable

It resolves through the REST/MCP path but returns **zero rows** under `az boards query` —
indistinguishable from an empty backlog. Spell the project name out, as
`wiql.byArea` in `azure-devops.config.json` does.

### There is no MCP tool that lists area paths

Use the CLI, as above.

### WIQL returns IDs, not fields

A WIQL query gives you work item IDs. Fetch the fields in a second batched call rather than
one request per ID.

### Long fields come back as HTML

`System.Description` and `Microsoft.VSTS.Common.AcceptanceCriteria` are HTML (`<h2>`,
`<ol>`, `<code>`, `<p>`), not markdown. Convert before writing them into a document.

### Required fields when creating a work item

The process template rejects a create that omits a required field, with
`TF401320: Rule Error for field <name>`. The authoritative list for this project is
`workItems.requiredFields` in `azure-devops.config.json`.

Inspect a picklist's allowed values:

```bash
TOKEN=$(az account get-access-token \
  --resource 499b84ac-1321-427f-aa17-267ca6975798 --query accessToken -o tsv)

curl -s -H "Authorization: Bearer $TOKEN" \
  "https://dev.azure.com/<ORG_NAME>/_apis/work/processes/lists/<picklistId>?api-version=7.1-preview.1"
```

Find `<picklistId>` by reading the field definition from
`https://dev.azure.com/<ORG_NAME>/<PROJECT_NAME>/_apis/wit/fields`.

### Setting a parent at creation time

The MCP `create` action does not take a parent. Either link afterwards, or POST the
JSON-patch document directly with the relation included:

```json
{
  "op": "add",
  "path": "/relations/-",
  "value": {
    "rel": "System.LinkTypes.Hierarchy-Reverse",
    "url": "https://dev.azure.com/<ORG_NAME>/_apis/wit/workItems/<parentId>"
  }
}
```

---

## 6. Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `ERROR: Please run 'az login'` right after a successful login | Account has no subscriptions, so the profile was never persisted | `az login --allow-no-subscriptions` |
| MCP tools missing in the assistant | Editor not restarted, or `.mcp.json` not in the directory the client opened | Restart; confirm the file is at the repo root |
| `TF51011: The specified area path does not exist` | Guessed area path | List them with `az boards area project list` |
| `TF401320: Rule Error for field <name>` | A process-required field was omitted | Add the field; see `workItems.requiredFields` |
| A WIQL query returns zero rows against a non-empty board | `@project` macro, or a wrong area path | Spell the project out; re-run without the area clause to isolate |
| Token expired mid-session | Access tokens are short-lived (about 1 hour) | Re-run `az login` |

---
