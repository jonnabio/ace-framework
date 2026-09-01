# Observability Standards

> Logging, monitoring, tracing, and alerting standards.
> Changes require ADR approval.

---

## Three Pillars

| Pillar | Purpose | Tools |
|--------|---------|-------|
| **Logs** | Record events | Structured logging |
| **Metrics** | Measure system state | Prometheus, StatsD |
| **Traces** | Track request flow | OpenTelemetry, Jaeger |

---

## Logging Standards

### Log Levels

| Level | When to Use | Example |
|-------|-------------|---------|
| `error` | System cannot perform function | DB connection failed |
| `warn` | Unexpected but handled | Retry succeeded |
| `info` | Normal operation milestones | Request completed |
| `debug` | Detailed troubleshooting | Query parameters |
| `trace` | Very detailed debugging | Function entry/exit |

### Log Format

```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "level": "info",
  "message": "Request completed",
  "service": "api",
  "traceId": "abc123",
  "spanId": "def456",
  "requestId": "req-789",
  "userId": "user-123",
  "duration": 150,
  "statusCode": 200,
  "path": "/api/users",
  "method": "GET"
}
```

### Required Fields

| Field | Description | Required |
|-------|-------------|----------|
| `timestamp` | ISO 8601 format | Always |
| `level` | Log level | Always |
| `message` | Human-readable message | Always |
| `service` | Service name | Always |
| `traceId` | Distributed trace ID | When available |
| `requestId` | Request identifier | For HTTP requests |

### Logging Rules

```typescript
// DO: Structured logging with context
logger.info('User registered', {
  userId: user.id,
  email: user.email, // Only if not sensitive
  registrationMethod: 'email',
});

// DON'T: Unstructured logging
logger.info(`User ${user.id} registered with ${user.email}`);

// DON'T: Log sensitive data
logger.info('Login attempt', { password }); // NEVER

// DO: Mask sensitive data
logger.info('Login attempt', {
  email: maskEmail(email), // jo***@example.com
  success: true,
});
```

### What to Log

| Event | Level | Required Fields |
|-------|-------|-----------------|
| Request start | debug | method, path, requestId |
| Request end | info | statusCode, duration |
| Error | error | error message, stack, context |
| External call start | debug | service, operation |
| External call end | info | service, duration, success |
| Business event | info | event type, relevant IDs |

### What NOT to Log

- Passwords, tokens, API keys
- Full credit card numbers
- Personal health information
- Complete request/response bodies
- High-volume debug in production

---

## Metrics Standards

### Metric Types

| Type | Use Case | Example |
|------|----------|---------|
| Counter | Cumulative count | `http_requests_total` |
| Gauge | Current value | `active_connections` |
| Histogram | Distribution | `request_duration_seconds` |
| Summary | Percentiles | `response_size_bytes` |

### Naming Convention

```text
[namespace]_[subsystem]_[name]_[unit]

Examples:
app_http_requests_total
app_http_request_duration_seconds
app_db_connections_active
app_queue_messages_pending
```

### Required Metrics

#### RED Metrics (Request-focused)

```text
# Rate - requests per second
app_http_requests_total{method, path, status}

# Errors - error rate
app_http_errors_total{method, path, error_type}

# Duration - latency
app_http_request_duration_seconds{method, path}
```

#### USE Metrics (Resource-focused)

```text
# Utilization
app_cpu_usage_percent
app_memory_usage_bytes

# Saturation
app_db_pool_waiting
app_queue_length

# Errors
app_db_errors_total
app_external_call_errors_total
```

### Labels

```yaml
# Good labels (low cardinality)
method: GET, POST, PUT, DELETE
status_code: 2xx, 4xx, 5xx  # Grouped
service: api, worker, scheduler

# Bad labels (high cardinality)
user_id: # Too many unique values
request_id: # Every request is unique
timestamp: # Always unique
```

---

## Tracing Standards

### Span Naming

```text
[service].[operation]

Examples:
api.handleRequest
db.query
cache.get
external.paymentService.charge
```

### Required Span Attributes

```yaml
# HTTP spans
http.method: GET
http.url: /api/users
http.status_code: 200
http.host: api.example.com

# Database spans
db.system: postgresql
db.name: users_db
db.operation: SELECT
db.statement: # Sanitized query

# Messaging spans
messaging.system: rabbitmq
messaging.destination: orders.created
messaging.operation: publish
```

### Trace Context Propagation

```typescript
// Always propagate trace context
const headers = {
  'traceparent': getTraceParent(),
  'tracestate': getTraceState(),
};

await fetch(url, { headers });
```

### Span Events

```typescript
// Add events for significant moments
span.addEvent('cache_miss', { key: cacheKey });
span.addEvent('retry_attempt', { attempt: 2, reason: 'timeout' });
```

---

## Alerting Standards

### Alert Severity

| Severity | Response Time | Examples |
|----------|---------------|----------|
| Critical | Immediate | System down, data loss |
| High | < 1 hour | Degraded service |
| Medium | < 4 hours | Elevated errors |
| Low | Next business day | Warning thresholds |

### Alert Structure

```yaml
alert: HighErrorRate
expr: rate(http_errors_total[5m]) > 0.1
for: 5m
labels:
  severity: high
  team: backend
annotations:
  summary: "High error rate detected"
  description: "Error rate is {{ $value }} (threshold: 0.1)"
  runbook: "docs/runbooks/high-error-rate.md"
  dashboard: "https://grafana/d/errors"
```

### Required Alert Fields

- **Summary**: One-line description
- **Description**: Detailed explanation with values
- **Runbook**: Link to remediation steps
- **Dashboard**: Link to relevant dashboard

### Alert Rules

1. Every alert must have a runbook
2. Avoid alert fatigue (actionable alerts only)
3. Test alerts in staging
4. Review alert thresholds quarterly
5. Acknowledge within SLA

---

## Dashboard Standards

### Required Dashboards

| Dashboard | Purpose | Refresh |
|-----------|---------|---------|
| Overview | System health at a glance | 30s |
| Service | Per-service deep dive | 30s |
| Infrastructure | Resource utilization | 1m |
| Business | Business metrics | 5m |

### Dashboard Structure

```text
Row 1: Key metrics (RED)
  - Request rate
  - Error rate
  - Latency (p50, p95, p99)

Row 2: Resources
  - CPU usage
  - Memory usage
  - Active connections

Row 3: Dependencies
  - Database latency
  - External API status
  - Queue depth

Row 4: Business metrics
  - Active users
  - Transactions
  - Revenue (if applicable)
```

---

## Health Checks

### Endpoints

```text
GET /health         # Basic liveness
GET /health/live    # Detailed liveness
GET /health/ready   # Readiness check
```

### Response Format

```json
{
  "status": "healthy",
  "version": "1.2.3",
  "timestamp": "2024-01-15T10:30:00Z",
  "checks": {
    "database": {
      "status": "healthy",
      "latency_ms": 5
    },
    "cache": {
      "status": "healthy",
      "latency_ms": 1
    },
    "external_api": {
      "status": "degraded",
      "latency_ms": 500,
      "message": "Slow response"
    }
  }
}
```

### Health Check Rules

- Liveness: Can the app respond? (for restart decisions)
- Readiness: Can the app serve traffic? (for load balancing)
- Check timeouts: Fail fast (< 5 seconds)
- Don't check: External dependencies in liveness

---

## Implementation Checklist

### Logging

- [ ] Structured JSON logging
- [ ] Log levels configured per environment
- [ ] Request/response logging with requestId
- [ ] Error logging with stack traces
- [ ] No sensitive data in logs
- [ ] Log retention configured

### Metrics

- [ ] RED metrics implemented
- [ ] USE metrics for resources
- [ ] Custom business metrics
- [ ] Metric labels are low cardinality
- [ ] Dashboards created

### Tracing

- [ ] Trace context propagation
- [ ] Spans for external calls
- [ ] Database query tracing
- [ ] Trace sampling configured

### Alerting

- [ ] Critical alerts defined
- [ ] Runbooks for each alert
- [ ] Alert routing configured
- [ ] On-call schedule set

---

*Last Updated: [DATE]*
*Requires ADR to modify*
