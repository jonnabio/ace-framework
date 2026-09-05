# Operational Runbooks

> Step-by-step procedures for handling operational situations.

---

## Purpose

Runbooks provide:

- Consistent response to incidents
- Reduced time to resolution
- Knowledge sharing across team
- Training for on-call engineers

---

## Runbook Index

### Incidents

| Runbook | Trigger | Severity |
|---------|---------|----------|
| [High Error Rate](./high-error-rate.md) | Error rate > threshold | High |
| [Service Down](./service-down.md) | Health check failing | Critical |

### Suggested additions

Not written yet. They are listed as prompts, not links, so the index never
promises a document that does not exist:

- High Latency — p99 above threshold
- Database Issues — connection or performance failures
- Memory Exhaustion — OOM or sustained high memory
- Deployment — production deployment procedure
- Rollback — reverting a deployment
- Scale Up — increasing capacity
- Database Migration — schema changes

Use the template below. A runbook is only worth writing against a real stack,
so these are deliberately left to the adopting project.

---

## Runbook Template

```markdown
# Runbook: [Title]

## Overview
**Trigger:** [What triggers this runbook]
**Severity:** [Critical | High | Medium | Low]
**Owner:** [Team/Person responsible]

## Symptoms
- [Observable symptom 1]
- [Observable symptom 2]

## Impact
- [User impact]
- [Business impact]

## Prerequisites
- [ ] Access to [system]
- [ ] Permissions for [action]

## Diagnosis
1. [Step to identify cause]
2. [Step to gather information]

## Resolution

### Scenario A: [Cause]
1. [Step 1]
2. [Step 2]
3. [Verification step]

### Scenario B: [Other cause]
1. [Step 1]
2. [Step 2]

## Escalation
If issue persists:
1. Escalate to [team/person]
2. Contact [external support if applicable]

## Post-Incident
- [ ] Document in incident log
- [ ] Create RCA if needed
- [ ] Update runbook if procedures changed

## Related
- [Dashboard](https://example.com/dashboard)
- [Documentation](https://example.com/docs)
- [Related runbook](https://example.com/runbooks/related)
```

---

## Using Runbooks

### During an Incident

1. Identify the alert/issue
2. Find matching runbook
3. Follow steps in order
4. Document actions taken
5. Escalate if needed
6. Create RCA after resolution

### Updating Runbooks

After each incident:

- Was the runbook helpful?
- What was missing?
- What was incorrect?
- Update runbook accordingly
- Get review from team

---

*Last Updated: [DATE]*
