# Release Process

> Standard process for releasing software to production.

---

## Release Types

| Type | Version Bump | Approval | Testing |
|------|--------------|----------|---------|
| Major | X.0.0 | Full team | Full regression |
| Minor | 0.X.0 | Tech lead | Feature + regression |
| Patch | 0.0.X | Developer | Targeted tests |
| Hotfix | 0.0.X | On-call + lead | Minimal + fix verification |

---

## Release Workflow

```text
┌─────────────────────────────────────────────────────────────┐
│                    RELEASE WORKFLOW                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐ │
│  │  PREPARE │──▶│  BUILD   │──▶│  DEPLOY  │──▶│  VERIFY  │ │
│  │          │   │  & TEST  │   │ STAGING  │   │          │ │
│  └──────────┘   └──────────┘   └──────────┘   └──────────┘ │
│                                      │                      │
│                                      ▼                      │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐                │
│  │ MONITOR  │◀──│  DEPLOY  │◀──│  APPROVE │                │
│  │          │   │   PROD   │   │          │                │
│  └──────────┘   └──────────┘   └──────────┘                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Phase 1: Prepare

### Pre-Release Checklist

```markdown
- [ ] All features for release are merged
- [ ] All tests passing on develop
- [ ] No critical/high bugs open
- [ ] Documentation updated
- [ ] Changelog prepared
- [ ] Version number determined
- [ ] Release notes drafted
- [ ] Database migrations reviewed
- [ ] Breaking changes documented
- [ ] Rollback plan ready
```

### Create Release Branch

```bash
# Branch from develop
git checkout develop
git pull origin develop
git checkout -b release/vX.Y.Z

# Update version
npm version X.Y.Z --no-git-tag-version

# Commit version bump
git add package.json package-lock.json
git commit -m "chore(release): bump version to X.Y.Z"
```

### Changelog Format

```markdown
# Changelog

## [X.Y.Z] - YYYY-MM-DD

### Added
- Feature A description (#123)
- Feature B description (#124)

### Changed
- Updated behavior of X (#125)

### Fixed
- Bug fix description (#126)

### Security
- Security improvement (#127)

### Breaking Changes
- Description of breaking change
- Migration instructions

### Deprecated
- Feature to be removed in future
```

---

## Phase 2: Build & Test

### Automated Pipeline

```yaml
# CI/CD pipeline stages
stages:
  - lint
  - unit-tests
  - integration-tests
  - security-scan
  - build
  - deploy-staging
```

### Required Checks

| Check | Must Pass | Description |
|-------|-----------|-------------|
| Lint | Yes | Code style |
| Unit tests | Yes | All unit tests |
| Integration tests | Yes | API and DB tests |
| Security scan | Yes | No critical/high vulnerabilities |
| Build | Yes | Successful build |
| Coverage | Yes | >= threshold |

### Manual Testing

For major/minor releases:

```markdown
- [ ] Smoke tests pass
- [ ] New features verified
- [ ] Regression tests pass
- [ ] Performance acceptable
- [ ] Security review complete
```

---

## Phase 3: Deploy Staging

### Deployment Steps

1. Deploy to staging environment
2. Run smoke tests
3. Verify database migrations
4. Test new features
5. Run load tests (if applicable)
6. Verify monitoring/alerting

### Staging Verification

```markdown
- [ ] Application starts successfully
- [ ] Health checks passing
- [ ] All services connected
- [ ] Database migrations applied
- [ ] New features working
- [ ] No errors in logs
- [ ] Performance acceptable
- [ ] Monitoring data flowing
```

---

## Phase 4: Approval

### Approval Requirements

| Release Type | Approvers |
|--------------|-----------|
| Major | Product owner + Tech lead + QA |
| Minor | Tech lead + QA |
| Patch | Tech lead |
| Hotfix | On-call + Tech lead |

### Sign-off Checklist

```markdown
## Release Sign-off: vX.Y.Z

Date: YYYY-MM-DD
Release Manager: [Name]

### Verification
- [ ] Staging deployment successful
- [ ] All tests passing
- [ ] Feature verification complete
- [ ] No blocking issues

### Approvals
- [ ] Product Owner: _____________ Date: _______
- [ ] Tech Lead: _____________ Date: _______
- [ ] QA Lead: _____________ Date: _______

### Go/No-Go Decision
[ ] GO - Proceed with production deployment
[ ] NO-GO - Reason: _____________
```

---

## Phase 5: Deploy Production

### Pre-Deployment

```markdown
- [ ] Notify stakeholders
- [ ] Verify on-call availability
- [ ] Confirm rollback plan
- [ ] Check deployment window
- [ ] Verify monitoring dashboards
```

### Deployment Steps

```bash
# 1. Merge release to main
git checkout main
git pull origin main
git merge --no-ff release/vX.Y.Z

# 2. Tag the release
git tag -a vX.Y.Z -m "Release vX.Y.Z"
git push origin main --tags

# 3. Deploy (automated or manual)
./deploy.sh production

# 4. Merge back to develop
git checkout develop
git merge --no-ff main
git push origin develop

# 5. Delete release branch
git branch -d release/vX.Y.Z
git push origin --delete release/vX.Y.Z
```

### Deployment Strategies

| Strategy | Use When | Rollback |
|----------|----------|----------|
| Rolling | Low risk changes | Rolling back |
| Blue-Green | Zero downtime needed | Switch back |
| Canary | High risk changes | Stop rollout |
| Feature Flag | Gradual rollout | Disable flag |

---

## Phase 6: Monitor

### Post-Deployment Monitoring

```markdown
## Monitoring Period: 30 minutes minimum

### Metrics to Watch
- [ ] Error rate (should be <= pre-deployment)
- [ ] Response time (should be stable)
- [ ] CPU/Memory usage (should be stable)
- [ ] Active users (should be normal)
- [ ] Business metrics (should be normal)

### Immediate Actions
Time 0: Deployment complete
Time +5min: Initial health check
Time +15min: Metrics review
Time +30min: All-clear or escalate

### Alert Response
If issues detected:
1. Assess severity
2. Decide: fix forward or rollback
3. Execute decision
4. Communicate status
```

---

## Rollback Procedure

### When to Rollback

- Critical error rate increase
- Service unavailable
- Data corruption
- Security issue discovered

### Rollback Steps

```bash
# 1. Notify team
# "Initiating rollback of vX.Y.Z due to [reason]"

# 2. Rollback deployment
./rollback.sh production vX.Y.Z-1

# OR for blue-green
./switch-environment.sh blue

# 3. Verify rollback successful
./health-check.sh production

# 4. Notify stakeholders
# "Rollback complete. Service restored."

# 5. Create incident report
# Document in docs/rca/
```

### Database Rollback

```markdown
If database changes were made:

1. Assess if data migration is reversible
2. Run down migration if possible
3. If not reversible, assess data impact
4. May need to restore from backup
5. Document all steps taken
```

---

## Hotfix Process

### Hotfix Workflow

```bash
# 1. Branch from main
git checkout main
git pull origin main
git checkout -b hotfix/vX.Y.Z

# 2. Fix the issue
# Write fix with test

# 3. Version bump
npm version patch --no-git-tag-version
git add -A
git commit -m "fix: description of fix"

# 4. Fast-track testing
# Minimal tests focused on fix

# 5. Deploy with expedited approval
# Get on-call + tech lead approval

# 6. Merge to main AND develop
git checkout main
git merge --no-ff hotfix/vX.Y.Z
git tag -a vX.Y.Z -m "Hotfix vX.Y.Z"
git push origin main --tags

git checkout develop
git merge --no-ff hotfix/vX.Y.Z
git push origin develop

# 7. Delete hotfix branch
git branch -d hotfix/vX.Y.Z
```

---

## Communication

### Release Notifications

| When | Who | Channel |
|------|-----|---------|
| Release planned | Team | Team chat |
| Deployment starting | Stakeholders | Status page |
| Deployment complete | All | Status page + email |
| Issues detected | Team | Incident channel |
| Rollback initiated | Stakeholders | Status page |

### Release Notes Template

```markdown
# Release Notes: vX.Y.Z

**Release Date:** YYYY-MM-DD

## Highlights
- Key feature or improvement

## New Features
- Feature A: Description
- Feature B: Description

## Improvements
- Improvement description

## Bug Fixes
- Fixed issue with X

## Breaking Changes
- Change description
- Migration steps

## Known Issues
- Issue description and workaround
```

---

*Last Updated: [DATE]*
