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
| [High Latency](./high-latency.md) | p99 latency > threshold | High |
| [Service Down](./service-down.md) | Health check failing | Critical |
| [Database Issues](./database-issues.md) | DB connection/performance | Critical |
| [Memory Exhaustion](./memory-exhaustion.md) | OOM or high memory | High |

### Procedures

| Runbook | Purpose |
|---------|---------|
| [Deployment](./deployment.md) | Production deployment |
| [Rollback](./rollback.md) | Reverting a deployment |
| [Scale Up](./scale-up.md) | Increasing capacity |
| [Database Migration](./database-migration.md) | Schema changes |

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
- [Link to dashboard]
- [Link to documentation]
- [Link to related runbook]
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
