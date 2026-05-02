---
name: ci-cd-pipeline
description: Procedural knowledge for designing and configuring continuous integration and deployment pipelines.
---

# Skill: CI/CD Pipeline Design

> Procedural knowledge for designing and configuring 
> continuous integration and deployment pipelines.

---

## Purpose

Enable the Architect and Developer roles to build automated, secure, and reliable pipelines for testing, building, and deploying code.

---

## Prerequisites

- [ ] CI/CD platform identified (GitHub Actions, GitLab CI, etc.)
- [ ] Target deployment environment identified (AWS, Vercel, Kubernetes, etc.)

---

## Procedures

### 1. Continuous Integration (CI)

```markdown
Step 1: Quality Gates
- Configure automated linting and formatting checks.
- Run static analysis (SAST) and dependency vulnerability scans.
- Execute unit and integration test suites.

Step 2: Build & Artifacts
- Build the application or Docker image.
- Cache dependencies to optimize build times.
- Tag artifacts with git commit SHA or semantic version.
```

### 2. Continuous Deployment (CD)

```markdown
Step 1: Deployment Strategy
- Define deployment targets (Staging, Production).
- Require manual approval gates for Production if necessary.
- Configure safe deployment mechanisms (Blue/Green, Canary).

Step 2: Security & Secrets
- Inject secrets via environment variables securely.
- Ensure the pipeline runner operates with the principle of least privilege (OIDC preferred over long-lived keys).
```

---

## Invocation

```markdown
"Apply the ci-cd-pipeline skill from .ace/skills/ci-cd-pipeline/SKILL.md
to design the GitHub Actions workflow for this repository."
```
