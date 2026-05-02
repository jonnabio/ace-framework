---
name: mcp-implementation
description: Procedural knowledge for implementing the Model Context Protocol (MCP) to expose local tools to LLMs.
---

# Skill: MCP Implementation

> Procedural knowledge for implementing the Model Context Protocol (MCP)
> to securely expose local tools, data, and APIs to LLMs.

---

## Purpose

Enable the Developer and AI Expert roles to build standard MCP servers, allowing any compatible LLM client (like Claude Desktop) to seamlessly discover and execute tools without custom integrations.

---

## Prerequisites

- [ ] MCP specification reviewed (modelcontextprotocol.io)
- [ ] Target local resource or API to expose identified
- [ ] Transport layer decided (stdio for local, SSE for remote)

---

## Procedures

### 1. Server Architecture

```markdown
Step 1: Choose the Transport
- Stdio: Best for local helper scripts running alongside the LLM client.
- SSE (Server-Sent Events): Best for remote APIs exposing tools over the web.

Step 2: Define Capabilities
- Resources: Static data you want the LLM to read (e.g., `file:///logs/app.log`).
- Prompts: Reusable prompt templates the LLM can invoke.
- Tools: Executable functions the LLM can call (e.g., `query_database`, `git_commit`).
```

### 2. Tool Implementation & Safety

```markdown
Step 1: Define the Tool Schema
- Return an array of tools on the `tools/list` endpoint.
- Provide highly descriptive names and JSON schemas for arguments so the LLM understands when to use it.

Step 2: Handle Execution
- Respond to `tools/call` with the exact execution logic.
- Catch all internal errors and return them gracefully to the LLM (e.g., `isError: true` in the result object) rather than crashing the MCP server.

Step 3: Security & Sandboxing
- Implement strict path traversal checks if exposing files.
- Ensure the MCP server runs with the lowest necessary OS permissions.
```

---

## Common Pitfalls

1. **Crashing the Server**: Failing to catch exceptions in the `tools/call` handler, which kills the stdio connection and breaks the LLM client.
2. **Vague Tool Descriptions**: The LLM will refuse to use the tool or hallucinate arguments if the description isn't mathematically precise.
3. **Path Traversal Vulnerabilities**: Blindly accepting `filepath` arguments without validating they reside within an allowed directory.

---

## Invocation

```markdown
"Apply the mcp-implementation skill from .ace/skills/mcp-implementation/SKILL.md
to build an MCP server that exposes our internal Jira instance to the LLM."
```
