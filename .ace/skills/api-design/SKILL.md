---
name: api-design
description: Procedural knowledge for designing and implementing RESTful APIs that are consistent, secure, and maintainable.
---

# Skill: API Design

> Procedural knowledge for designing and implementing
> RESTful APIs that are consistent, secure, and maintainable.

---

## Purpose

Create APIs that follow established conventions, provide excellent
developer experience, and maintain backward compatibility.

---

## Prerequisites

- [ ] Review .ace/standards/architecture.md for API conventions
- [ ] Review existing API patterns in codebase
- [ ] Understand authentication/authorization model
- [ ] Check relevant ADRs for API decisions

---

## Procedures

### 1. Designing a New Endpoint

```markdown
Step 1: Define the resource
- Identify the noun (user, order, product)
- Determine if new resource or nested
- Check if resource already exists

Step 2: Choose HTTP method
- GET: Retrieve (safe, idempotent)
- POST: Create (not idempotent)
- PUT: Full replace (idempotent)
- PATCH: Partial update (idempotent)
- DELETE: Remove (idempotent)

Step 3: Design URL structure
- Use plural nouns: /users not /user
- Use kebab-case: /user-profiles
- Nest logically: /users/{id}/orders

Step 4: Define request/response
- Use consistent envelope format
- Document all fields
- Include examples

Step 5: Handle errors
- Use appropriate status codes
- Provide error details
- Include request ID
```

### 2. Request/Response Design

```markdown
## Standard Response Envelope

Success:
{
  "data": { ... },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "requestId": "req_abc123"
  }
}

Error:
{
  "errors": [
    {
      "code": "VALIDATION_ERROR",
      "message": "Email format is invalid",
      "field": "email",
      "details": {}
    }
  ],
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "requestId": "req_abc123"
  }
}

## Pagination
{
  "data": [...],
  "pagination": {
    "page": 1,
    "perPage": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### 3. Status Code Guide

```markdown
## Success
200 OK           - General success with body
201 Created      - Resource created (include Location header)
204 No Content   - Success with no body (DELETE)

## Client Errors
400 Bad Request  - Malformed request / validation error
401 Unauthorized - No/invalid authentication
403 Forbidden    - Authenticated but not authorized
404 Not Found    - Resource doesn't exist
409 Conflict     - State conflict (duplicate, etc.)
422 Unprocessable - Valid syntax but semantic error
429 Too Many     - Rate limit exceeded

## Server Errors
500 Internal     - Unexpected server error
502 Bad Gateway  - Upstream service error
503 Unavailable  - Server temporarily down
504 Timeout      - Upstream timeout
```

---

## Patterns

### Resource Collection
```
GET    /users           â†’ List users (paginated)
POST   /users           â†’ Create user
GET    /users/{id}      â†’ Get single user
PUT    /users/{id}      â†’ Replace user
PATCH  /users/{id}      â†’ Update user fields
DELETE /users/{id}      â†’ Delete user
```

### Nested Resources
```
GET    /users/{userId}/orders     â†’ User's orders
POST   /users/{userId}/orders     â†’ Create order for user
GET    /users/{userId}/orders/{orderId}  â†’ Specific order
```

### Actions (Non-CRUD)
```
POST   /users/{id}/activate       â†’ Action on resource
POST   /orders/{id}/cancel        â†’ Action on resource
```

### Filtering & Search
```
GET /users?status=active&role=admin      â†’ Filter
GET /users?q=john                        â†’ Search
GET /users?sort=-createdAt               â†’ Sort (- = desc)
GET /users?fields=id,name,email          â†’ Sparse fields
```

---

## Security Checklist

- [ ] Authentication required (unless public)
- [ ] Authorization checked for resource
- [ ] Input validated and sanitized
- [ ] Rate limiting configured
- [ ] CORS properly configured
- [ ] No sensitive data in URLs
- [ ] Request size limits set
- [ ] Timeout configured

---

## Documentation Template

```markdown
## [METHOD] /api/v1/[resource]

[Brief description]

### Authentication
[Required/Optional] - [Type: Bearer, API Key, etc.]

### Request

**Headers:**
| Header | Required | Description |
|--------|----------|-------------|

**Path Parameters:**
| Param | Type | Description |
|-------|------|-------------|

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|

**Body:**
```json
{
  "field": "type (required/optional)"
}
```

### Response

**Success (2XX):**
```json
{
  "data": {}
}
```

**Errors:**
| Status | Code | When |
|--------|------|------|
```

---

## Validation

After designing/implementing an API:

- [ ] Follows URL conventions
- [ ] Uses correct HTTP methods
- [ ] Response format consistent
- [ ] Error responses informative
- [ ] Authentication/authorization in place
- [ ] Input validation complete
- [ ] Documentation written
- [ ] Tests cover happy/error paths

---

## Common Pitfalls

1. **Verbs in URLs** - Use nouns, not /getUser
2. **Inconsistent naming** - Stick to one convention
3. **Missing pagination** - Lists must paginate
4. **Exposing IDs** - Consider if sequential IDs are safe
5. **Over-fetching** - Support sparse fieldsets
6. **No versioning** - Always version from start
7. **Leaky abstractions** - Don't expose DB structure

---

## Invocation

```markdown
"Apply the API design skill from .ace/skills/api-design/SKILL.md
for this endpoint. Follow the conventions and include
complete documentation."
```

---

*Skill Version: 1.0*


