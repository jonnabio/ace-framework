# Runbook: Service Down

## Overview

**Trigger:** Service health check failing, service unreachable
**Severity:** Critical
**Owner:** Platform Team / On-Call

---

## Symptoms

- Alert: `ServiceDown` or `HealthCheckFailing` firing
- Cannot reach service endpoints
- Load balancer showing no healthy instances
- Users reporting complete outage

---

## Impact

- Complete service outage
- All users affected
- Business operations halted
- Potential data in flight may be lost

---

## Prerequisites

- [ ] Access to infrastructure (cloud console/kubectl)
- [ ] Access to monitoring dashboards
- [ ] Access to logs
- [ ] Incident communication channel ready

---

## Immediate Actions (First 5 Minutes)

### Step 1: Acknowledge and Communicate

```text
1. Acknowledge the alert
2. Join incident channel
3. Post initial status:
   "[INCIDENT] Service [name] is DOWN. Investigating."
4. Update status page if applicable
```

### Step 2: Quick Assessment

```bash
# Check if pods are running
kubectl get pods -l app=<service-name>

# Check recent events
kubectl get events --sort-by='.lastTimestamp' | head -20

# Check service endpoints
kubectl get endpoints <service-name>
```

### Step 3: Check Basic Connectivity

```bash
# From inside cluster
kubectl run test --rm -it --image=busybox -- wget -qO- http://<service>:port/health

# Check load balancer
curl -I https://<public-endpoint>/health
```

---

## Diagnosis

### Is it a Single Instance or All Instances?

```bash
# Check all pods
kubectl get pods -l app=<service-name> -o wide

# Check each pod's health
for pod in $(kubectl get pods -l app=<service-name> -o name); do
  echo "Checking $pod"
  kubectl exec $pod -- curl -s localhost:port/health
done
```

### Check Pod Logs

```bash
# Recent logs
kubectl logs -l app=<service-name> --tail=100

# If pods are crash-looping
kubectl logs <pod-name> --previous
```

### Check Resource Usage

```bash
# Pod resource usage
kubectl top pods -l app=<service-name>

# Node resource usage
kubectl top nodes
```

---

## Resolution

### Scenario A: Pods in CrashLoopBackOff

**Indicators:**

- `kubectl get pods` shows CrashLoopBackOff
- Pod restarting repeatedly

**Steps:**

1. Check logs for crash reason

   ```bash
   kubectl logs <pod-name> --previous
   ```

2. Common causes:
   - Missing config/secret: Verify configmaps/secrets exist
   - OOM killed: Check memory limits
   - Failed health check: Check startup probes
   - Application error: Check for exceptions

3. If config issue:

   ```bash
   kubectl describe configmap <name>
   kubectl describe secret <name>
   ```

4. If OOM:

   ```bash
   kubectl describe pod <name> | grep -A 5 "Last State"
   # Increase memory limit if needed
   ```

### Scenario B: No Pods Running

**Indicators:**

- No pods found for the service
- Deployment has 0 replicas

**Steps:**

1. Check deployment

   ```bash
   kubectl get deployment <name>
   kubectl describe deployment <name>
   ```

2. If scaled to 0:

   ```bash
   kubectl scale deployment <name> --replicas=3
   ```

3. If deployment missing:
   - Check if accidentally deleted
   - Redeploy from CI/CD or manually

### Scenario C: Pods Running but Not Ready

**Indicators:**

- Pods show Running but 0/1 Ready
- Health checks failing

**Steps:**

1. Check readiness probe

   ```bash
   kubectl describe pod <name> | grep -A 10 "Readiness"
   ```

2. Test health endpoint manually

   ```bash
   kubectl exec <pod> -- curl localhost:port/health
   ```

3. Check what health check is checking:
   - Database connectivity?
   - External service dependency?
   - Internal initialization?

### Scenario D: Network Issue

**Indicators:**

- Pods running and ready
- Cannot reach from outside
- Service/Ingress misconfigured

**Steps:**

1. Check service configuration

   ```bash
   kubectl describe service <name>
   ```

2. Check ingress/load balancer

   ```bash
   kubectl describe ingress <name>
   ```

3. Check network policies

   ```bash
   kubectl get networkpolicies
   ```

### Scenario E: Recent Deployment Issue

**Indicators:**

- Issue started after deployment
- New version is faulty

**Steps:**

1. Rollback to previous version

   ```bash
   kubectl rollout undo deployment/<name>
   ```

2. Verify rollback

   ```bash
   kubectl rollout status deployment/<name>
   ```

---

## Escalation

**Immediate Escalation (Critical):**

| Time | Action |
|------|--------|
| 0 min | Start diagnosis |
| 5 min | If no progress, page additional help |
| 15 min | Escalate to management |
| 30 min | Consider broader incident response |

**Contacts:**

- Platform Team Lead: [contact]
- Infrastructure Team: [contact]
- Management: [contact]

---

## Communication

### During Incident

Post updates every 10-15 minutes:

```text
[INCIDENT UPDATE] [TIME]
Status: Still investigating / Identified cause / Implementing fix
Impact: [Current user impact]
ETA: [Estimated time if known]
```

### After Resolution

```text
[INCIDENT RESOLVED] [TIME]
Service [name] is restored.
Duration: [X minutes]
Impact: [Summary of impact]
Root cause: [Brief description]
Next steps: [RCA will be conducted]
```

---

## Post-Incident

- [ ] Service confirmed healthy
- [ ] All instances running
- [ ] Monitoring showing normal metrics
- [ ] Status page updated
- [ ] Stakeholders notified
- [ ] Incident documented
- [ ] RCA created in docs/rca/

---

## Prevention

After incident, consider:

- Were alerts timely?
- Were runbooks helpful?
- What monitoring was missing?
- What automation could help?

---

## Related

- [High Error Rate Runbook](./high-error-rate.md)
- [Runbook index](./README.md)
- Infrastructure Dashboard — fill in your monitoring URL

---

*Last Updated: [DATE]*
