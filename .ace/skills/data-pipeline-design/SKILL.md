---
name: data-pipeline-design
description: Procedural knowledge for designing robust, idempotent, and scalable data pipelines (ETL/ELT).
---

# Skill: Data Pipeline Design

> Procedural knowledge for designing robust, idempotent, 
> and scalable data pipelines (ETL/ELT).

---

## Purpose

Enable the Architect and Data Scientist roles to design robust data workflows, ensuring data integrity, reproducibility, and efficient processing at scale.

---

## Prerequisites

- [ ] Source and destination data stores identified
- [ ] Data volume, velocity, and variety understood
- [ ] Expected latency requirements (Batch vs. Streaming) defined
- [ ] Target schema designed

---

## Procedures

### 1. Pipeline Architecture Design

```markdown
Step 1: Choose the Pattern
- Extract-Transform-Load (ETL): Transformation happens before loading into destination.
- Extract-Load-Transform (ELT): Raw data is loaded first, transformed in the data warehouse.
- Streaming: Real-time processing for low-latency requirements.

Step 2: Define the Directed Acyclic Graph (DAG)
- Break the pipeline into atomic, independent tasks.
- Define dependencies clearly to prevent circular execution.

Step 3: Ensure Idempotency
- Operations must produce the same result regardless of how many times they are executed.
- Use upserts (MERGE) instead of blind inserts.
- Rely on date/time partitions for selective overwrites.
```

### 2. Error Handling & Quality Checks

```markdown
Step 1: Data Quality Gates
- Implement schema validation on ingress.
- Add anomaly detection (e.g., unusual null rates, out-of-bounds values).

Step 2: Retry & Backoff
- Configure exponential backoff for transient API or connection errors.
- Implement dead-letter queues for malformed payloads.

Step 3: Alerting
- Define SLAs for pipeline completion.
- Alert on failure, unusual duration, or data quality breaches.
```

---

## Common Pitfalls

1. **Non-idempotent operations**: Failing halfway and re-running causes duplicated data.
2. **Hardcoded credentials**: Always use secure secret managers.
3. **Ignoring schema evolution**: Source schemas change; pipelines must fail gracefully or adapt.
4. **Lack of backfill capability**: Not designing pipelines to easily process historical data.

---

## Invocation

```markdown
"Apply the data-pipeline-design skill from .ace/skills/data-pipeline-design/SKILL.md
to design the ETL flow for the new analytics dashboard."
```
