---
name: agent-design
description: Procedural knowledge for designing autonomous AI agents with tools, memory, and reasoning loops.
---

# Skill: Agent Design

> Procedural knowledge for designing autonomous AI agents 
> with tools, memory, and reasoning loops.

---

## Purpose

Enable the AI Expert and Architect roles to systematically design AI agents capable of autonomous execution, ensuring predictable tool usage, context management, and guardrails against infinite loops.

---

## Prerequisites

- [ ] Core objective of the agent defined (e.g., "Code Reviewer", "Support Triage")
- [ ] Target LLM supports function calling / tool use
- [ ] Required tools (APIs, databases, bash) identified

---

## Procedures

### 1. Loop & State Design

```markdown
Step 1: Choose the Execution Loop
- ReAct (Reason + Act): The agent thinks, selects a tool, observes the result, and repeats.
- State Machine/DAG: The agent follows a strictly defined graph of states with deterministic transitions.
- Plan-and-Execute: The agent generates a complete plan upfront, then executes tasks sequentially.

Step 2: Context & Memory
- Short-term Memory: Define the sliding window of conversation history. Summarize when the context window exceeds 70% capacity.
- Long-term Memory: Implement RAG (Vector DB) or semantic search for historical context retrieval.
```

### 2. Tool Definition

```markdown
Step 1: Tool Schema
- Define tools using strict JSON schemas (e.g., OpenAPI).
- Ensure descriptions are incredibly clear, as the LLM uses the description to decide when to invoke the tool.

Step 2: Tool Safety
- Implement "Human-in-the-Loop" (HITL) for destructive actions (e.g., `DROP TABLE`, sending emails).
- Use safe sandboxes for code execution (e.g., Docker, WASM).
```

---

## Common Pitfalls

1. **Infinite Loops**: The agent repeatedly calls a tool that fails, eating up tokens. Always implement a `max_iterations` cutoff.
2. **Context Stuffing**: Passing too much irrelevant context, causing the agent to "forget" the primary instruction (Lost in the Middle).
3. **Overly Broad Tools**: Tools like `run_python_code` without restrictions often lead to unpredictable behavior. Prefer specific tools like `calculate_shipping_cost`.

---

## Invocation

```markdown
"Apply the agent-design skill from .ace/skills/agent-design/SKILL.md
to draft the architecture for the new customer support agent."
```
