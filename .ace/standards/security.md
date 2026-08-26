# Security Standards

> **CRITICAL**: These are non-negotiable security constraints.
> Violations are treated as Critical severity.
> Zero tolerance policy - no exceptions without documented ADR.

---

## Secrets Management

### NEVER in Code

```text
FORBIDDEN:
- API keys
- Passwords
- Connection strings with credentials
- Private keys
- Tokens (JWT, OAuth, etc.)
- Encryption keys
- Any credential or secret
```

### Required Approach

```text
- Environment variables for runtime secrets
- Secret management service (Vault, AWS Secrets Manager, etc.)
- .env files in .gitignore (never committed)
- Encrypted secrets for CI/CD
```

### Detection

- Pre-commit hooks must scan for secrets
- CI pipeline must fail on detected secrets
- Regular repository audits

---

## Input Validation

### All External Input is Untrusted

```text
Sources requiring validation:
- User input (forms, parameters)
- API request bodies
- URL parameters and query strings
- File uploads
- Webhook payloads
- Database query results (defense in depth)
- Third-party API responses
```

### Validation Rules

1. **Whitelist over blacklist** - Define what's allowed
2. **Validate type, length, format, range**
3. **Sanitize before use**
4. **Encode output appropriately**

---

## OWASP Top 10 Protections

### 1. Injection Prevention

```text
REQUIRED:
- Parameterized queries (never string concatenation)
- ORM with parameterization
- Input sanitization for shell commands
- Template engines with auto-escaping
```

### 2. Authentication

```text
REQUIRED:
- Secure password hashing (bcrypt, Argon2)
- Multi-factor authentication for sensitive operations
- Session timeout and invalidation
- Brute force protection
```

### 3. Sensitive Data Exposure

```text
REQUIRED:
- HTTPS everywhere
- Sensitive data encrypted at rest
- PII handling compliant with regulations
- Minimal data collection
```

### 4. XML External Entities (XXE)

```text
REQUIRED:
- Disable DTD processing
- Use JSON over XML when possible
- Validate and sanitize XML input
```

### 5. Access Control

```text
REQUIRED:
- Deny by default
- Principle of least privilege
- Role-based access control (RBAC)
- Verify authorization on every request
```

### 6. Security Misconfiguration

```text
REQUIRED:
- Remove default credentials
- Disable unnecessary features
- Security headers configured
- Error messages don't leak info
```

### 7. Cross-Site Scripting (XSS)

```text
REQUIRED:
- Output encoding
- Content Security Policy (CSP)
- HTTPOnly cookies
- Framework auto-escaping enabled
```

### 8. Insecure Deserialization

```text
REQUIRED:
- Validate serialized data
- Use safe serialization formats
- Integrity checks on serialized objects
```

### 9. Vulnerable Components

```text
REQUIRED:
- Regular dependency updates
- Vulnerability scanning in CI
- No end-of-life dependencies
- License compliance checks
```

### 10. Logging & Monitoring

```text
REQUIRED:
- Security event logging
- No sensitive data in logs
- Log integrity protection
- Alerting on anomalies
```

---

## API Security

### Authentication

- Token-based authentication (JWT, OAuth2)
- API keys for service-to-service
- Token expiration and refresh

### Authorization

- Verify permissions on every endpoint
- Resource-level access control
- Rate limiting

### Transport

- TLS 1.2+ required
- Certificate validation
- HSTS enabled

---

## File Handling

### Uploads

```text
REQUIRED:
- Validate file type (magic bytes, not extension)
- Size limits enforced
- Virus scanning
- Store outside webroot
- Generate new filenames
```

### Downloads

```text
REQUIRED:
- Path traversal prevention
- Access control verification
- Content-Disposition headers
```

---

## Database Security

### Queries

- Parameterized queries only
- Least privilege database accounts
- No direct SQL string building

### Storage

- Encryption at rest for sensitive data
- Secure connection strings
- Regular backups (encrypted)

---

## Security Headers

### Required Headers

```http
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: [appropriate policy]
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: [appropriate policy]
```

---

## Incident Response

### If Security Violation Detected

1. **STOP** - Do not proceed with implementation
2. **REPORT** - Flag immediately to team lead
3. **DOCUMENT** - Record in security incident log
4. **REMEDIATE** - Fix before any merge
5. **REVIEW** - Post-incident analysis

---

## Compliance Checklist

Before any code is merged:

- [ ] No secrets in code or config files
- [ ] All inputs validated and sanitized
- [ ] Parameterized queries used
- [ ] Output properly encoded
- [ ] Authentication/authorization verified
- [ ] Security headers present
- [ ] Dependencies scanned for vulnerabilities
- [ ] Sensitive data handling compliant
- [ ] Error messages don't leak information
- [ ] Security logging in place

---

*Last Updated: [DATE]*
*CRITICAL - Violations require immediate remediation*
