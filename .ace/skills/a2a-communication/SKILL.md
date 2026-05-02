---
name: a2a-communication
description: Procedural knowledge for orchestrating multi-agent systems and Agent-to-Agent (A2A) handoffs.
---

# Skill: A2A Communication

> Procedural knowledge for orchestrating multi-agent systems 
> and Agent-to-Agent (A2A) handoffs.

---

## Purpose

Enable the AI Expert and Architect roles to design scalable multi-agent ecosystems where specialized agents can securely delegate tasks, share context, and resolve conflicts.

---

## Prerequisites

- [ ] Distinct agent personas defined (e.g., Researcher, Writer, Reviewer)
- [ ] Communication topology chosen (Hierarchical, Peer-to-Peer, Blackboard)

---

## Procedures

### 1. Topology & Orchestration

```markdown
Step 1: Define the Topology
- Supervisor/Hierarchical: A router agent delegates tasks to worker agents and aggregates results.
- Sequential/Chain: Agent A finishes its task and passes the output directly to Agent B.
- Blackboard/Shared State: All agents read from and write to a centralized shared state.

Step 2: Context Handoff
- Define the exact schema for the handoff object.
- Include: Objective, Current State, Completed Steps, and Constraints.
- Do NOT pass the entire raw chat history to the next agent; pass a structured summary to save tokens.
```

### 2. Conflict Resolution & Handoffs

```markdown
Step 1: Delegation
- Give the Supervisor agent a `delegate_task(agent_id, instructions)` tool.
- Ensure the worker agent has a mechanism to signal `task_complete(result)`.

Step 2: Conflict Resolution
- If the Reviewer agent rejects the Writer agent's work, the Reviewer must provide structured feedback (`<feedback>`) and transition state back to the Writer.
- Implement a maximum recursion depth to prevent endless debate between agents.
```

---

## Common Pitfalls

1. **Token Bloat**: Passing full raw histories between agents rapidly exhausts context limits and increases latency.
2. **Endless Debate**: Two agents endlessly rejecting each other's output without a supervisor intervention limit.
3. **Unclear Boundaries**: Creating agents with overlapping capabilities confuses the Supervisor on who to delegate to.

---

## Invocation

```markdown
"Apply the a2a-communication skill from .ace/skills/a2a-communication/SKILL.md
to design the routing logic for the Researcher and Writer agents."
```
