---
name: error-handling
description: Procedural knowledge for standardizing error boundaries, logging, and graceful degradation.
---

# Skill: Error Handling

> Procedural knowledge for standardizing error boundaries, 
> logging, and graceful degradation.

---

## Purpose

Enable the Developer role to implement robust error handling that provides actionable telemetry for engineers while presenting a safe, non-technical experience to users.

---

## Prerequisites

- [ ] Target framework/language error paradigms understood
- [ ] Logging infrastructure (e.g., Datadog, Sentry) identified

---

## Procedures

### 1. Backend Error Handling

```markdown
Step 1: Structured Logging
- Log errors in JSON format with contextual metadata (user_id, request_id, path).
- Do not log PII, passwords, or sensitive tokens.

Step 2: Catch & Throw Patterns
- Use global exception handlers to catch unhandled errors.
- Differentiate between expected Operational Errors (e.g., 404 Not Found) and unexpected Programmer Errors (e.g., null reference).
- Always return standard, safe HTTP error envelopes to the client.
```

### 2. Frontend Error Handling

```markdown
Step 1: Error Boundaries
- Wrap independent UI segments in Error Boundaries (e.g., React `<ErrorBoundary>`) to prevent total app crashes.
- Provide a fallback UI that allows the user to retry or navigate away.

Step 2: Graceful Degradation
- Handle network failures gracefully with timeouts and user-friendly messaging.
- Avoid exposing stack traces or raw API error strings to the UI.
```

---

## Invocation

```markdown
"Apply the error-handling skill from .ace/skills/error-handling/SKILL.md
to review the exception handling logic in this service."
```
