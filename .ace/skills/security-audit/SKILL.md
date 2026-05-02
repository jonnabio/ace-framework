---
name: security-audit
description: Procedural knowledge for conducting focused security reviews and enforcing secure coding practices.
---

# Skill: Security Audit

> Procedural knowledge for conducting focused security 
> reviews and enforcing secure coding practices.

---

## Purpose

Enable the QA Engineer and Developer roles to proactively identify and mitigate security vulnerabilities (e.g., OWASP Top 10) before code reaches production.

---

## Prerequisites

- [ ] Target codebase or PR identified
- [ ] Review `.ace/standards/security.md`
- [ ] Static analysis tooling results available (if any)

---

## Procedures

### 1. Code Review Checks

```markdown
Step 1: Input Validation
- Verify all user input is sanitized and validated against an allowlist.
- Check for SQL Injection (enforce parameterized queries/ORMs).
- Check for XSS (enforce context-aware output encoding).

Step 2: Authentication & Authorization
- Verify endpoints have appropriate permission checks.
- Ensure JWTs/tokens are securely stored (e.g., HttpOnly cookies) and validated.
- Check for Insecure Direct Object References (IDOR).

Step 3: Secret Management
- Scan for hardcoded API keys, passwords, or tokens.
- Ensure `.env` files are not tracked in Git.
```

### 2. Dependency & Config Checks

```markdown
Step 1: Dependencies
- Review `package.json`, `requirements.txt`, etc., for known vulnerable packages.
- Ensure lock files are committed and audited.

Step 2: Security Headers
- Ensure appropriate headers are set (CORS, CSP, HSTS, X-Frame-Options).
```

---

## Invocation

```markdown
"Apply the security-audit skill from .ace/skills/security-audit/SKILL.md
to review this pull request for vulnerabilities."
```
