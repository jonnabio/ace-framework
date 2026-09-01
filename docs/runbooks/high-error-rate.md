# Runbook: High Error Rate

## Overview

**Trigger:** Error rate exceeds threshold (> 1% of requests)
**Severity:** High
**Owner:** Backend Team

---

## Symptoms

- Alert: `HighErrorRate` firing
- Error rate dashboard showing spike
- User reports of failures
- Increased error logs

---

## Impact

- Users experiencing failed requests
- Potential data inconsistency
- Business transactions may fail

---

## Prerequisites

- [ ] Access to monitoring dashboards
- [ ] Access to log aggregation
- [ ] SSH access to servers (if needed)
- [ ] Database access (read-only)

---

## Diagnosis

### Step 1: Confirm the Alert

```bash
# Check current error rate
curl -s http://metrics/api/v1/query?query=rate(http_errors_total[5m])
```

Dashboard: Error Rate Dashboard — fill in your monitoring URL

### Step 2: Identify Affected Endpoints

Check which endpoints are failing:

- Filter logs by status >= 500
- Check metrics by endpoint label
- Note: Is it one endpoint or many?

### Step 3: Check Recent Changes

- Was there a recent deployment?
- Were there configuration changes?
- Did external dependencies change?

### Step 4: Check Dependencies

- Database connectivity
- External API status
- Cache availability
- Queue health

---

## Resolution

### Scenario A: Recent Deployment Caused Issue

**Indicators:**

- Error rate spike coincides with deployment
- Errors are from newly changed code

**Steps:**

1. Initiate rollback

   ```bash
   ./scripts/rollback.sh production
   ```

2. Verify error rate decreasing
3. Notify team of rollback
4. Investigate cause before redeploying

### Scenario B: Database Issues

**Indicators:**

- Database connection errors in logs
- High database latency
- Connection pool exhausted

**Steps:**

1. Check database health

   ```bash
   ./scripts/check-db-health.sh
   ```

2. If connections exhausted:
   - Restart application pods to reset pools
   - Increase connection pool if needed
3. If database overloaded:
   - Identify slow queries
   - Scale database if possible
   - Add read replicas if applicable

### Scenario C: External API Failure

**Indicators:**

- Timeout errors to external service
- External service returning errors

**Steps:**

1. Check external service status page
2. If external service is down:
   - Enable circuit breaker if not active
   - Return cached data if possible
   - Show degraded mode to users
3. Contact external service support if prolonged

### Scenario D: Application Bug

**Indicators:**

- Specific error message in logs
- Stack trace pointing to code issue

**Steps:**

1. Identify the bug from logs
2. If quick fix possible:
   - Hotfix and deploy
3. If complex:
   - Rollback to previous version
   - Investigate properly before fix

### Scenario E: Resource Exhaustion

**Indicators:**

- High CPU/Memory usage
- Out of memory errors
- Thread pool exhausted

**Steps:**

1. Scale up instances

   ```bash
   kubectl scale deployment app --replicas=N
   ```

2. Identify resource leak
3. Restart affected pods
4. Investigate root cause

---

## Escalation

If issue persists after 15 minutes:

1. Page the Tech Lead
2. Notify stakeholders of ongoing issue
3. Consider broader rollback
4. Engage additional team members

**Escalation contacts:**

- Tech Lead: [contact]
- Platform Team: [contact]
- Database Team: [contact]

---

## Post-Incident

- [ ] Error rate returned to normal
- [ ] Document actions taken in incident channel
- [ ] Create RCA in docs/rca/ if significant
- [ ] Update this runbook if procedures changed
- [ ] Schedule post-mortem if needed

---

## Related

- Error Rate Dashboard — fill in your monitoring URL
- Application Logs — fill in your log aggregator URL
- [Service Down Runbook](./service-down.md)
- [Runbook index](./README.md)

---

*Last Updated: [DATE]*
