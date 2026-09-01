# Git Workflow Standards

> Branching strategy, commit conventions, and version control practices.
> Changes require ADR approval.

---

## Branching Strategy

### Branch Types

| Branch | Purpose | Naming | Lifetime |
|--------|---------|--------|----------|
| `main` | Production-ready code | `main` | Permanent |
| `develop` | Integration branch | `develop` | Permanent |
| `feature/*` | New features | `feature/short-description` | Until merged |
| `bugfix/*` | Bug fixes | `bugfix/issue-id-description` | Until merged |
| `hotfix/*` | Production fixes | `hotfix/issue-id-description` | Until merged |
| `release/*` | Release prep | `release/vX.Y.Z` | Until released |

### Branch Flow

```text
main ─────────────────────────────●─────────────────────●───▶
                                  ▲                     ▲
                                  │ merge               │ merge
                                  │                     │
develop ────●─────●─────●─────────●─────●─────●─────────●───▶
            ▲     ▲     ▲               ▲     ▲
            │     │     │               │     │
feature/a ──┘     │     │               │     │
                  │     │               │     │
feature/b ────────┘     │               │     │
                        │               │     │
bugfix/123 ─────────────┘               │     │
                                        │     │
feature/c ──────────────────────────────┘     │
                                              │
hotfix/456 ───────────────────────────────────┘ (to main AND develop)
```

### Branch Rules

#### main

- Always deployable
- Protected: no direct commits
- Requires PR with approvals
- All tests must pass
- Only merge from release/*or hotfix/*

#### develop

- Integration of features
- Protected: no direct commits
- Requires PR with approvals
- Tests should pass

#### feature/*

- Branch from: develop
- Merge to: develop
- Delete after merge
- Keep up-to-date with develop

#### hotfix/*

- Branch from: main
- Merge to: main AND develop
- For critical production issues only
- Delete after merge

---

## Commit Conventions

### Commit Message Format

```text
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

### Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Formatting, no code change |
| `refactor` | Code change, no feature/fix |
| `perf` | Performance improvement |
| `test` | Adding/updating tests |
| `chore` | Build, config, dependencies |
| `revert` | Reverting previous commit |

### Scope

Optional, describes the affected module:

- `api`, `auth`, `db`, `ui`, `core`, etc.

### Subject

- Imperative mood ("add" not "added")
- No period at end
- Max 50 characters
- Lowercase

### Body

- Explain what and why, not how
- Wrap at 72 characters
- Separate from subject with blank line

### Footer

- Reference issues: `Fixes #123`, `Closes #456`
- Breaking changes: `BREAKING CHANGE: description`
- Co-authors: `Co-Authored-By: Name <email>`

### Examples

```text
feat(auth): add OAuth2 login support

Implement OAuth2 authentication flow with Google and GitHub
providers. This enables SSO for enterprise users.

- Add OAuth2 strategy configuration
- Implement callback handlers
- Add provider-specific user mapping

Closes #234
```

```text
fix(api): prevent SQL injection in user search

Apply parameterized queries to user search endpoint.
Previously, user input was concatenated directly.

Fixes #567
RCA: docs/rca/RCA-003-sql-injection.md
```

```text
refactor(core): extract validation logic to separate module

No functional changes. Improves testability and reuse.
```

---

## Pull Request Process

### Before Creating PR

1. [ ] Rebase on latest develop/main
2. [ ] All tests pass locally
3. [ ] Self-review completed
4. [ ] Commit history is clean
5. [ ] Branch follows naming convention

### PR Requirements

1. [ ] Descriptive title
2. [ ] Complete description (use template)
3. [ ] Linked to issue/spec
4. [ ] Tests included
5. [ ] Documentation updated
6. [ ] No merge conflicts
7. [ ] CI pipeline passes

### PR Size Guidelines

| Size | Lines Changed | Review Effort |
|------|---------------|---------------|
| XS | < 50 | Trivial |
| S | 50-200 | Quick |
| M | 200-500 | Moderate |
| L | 500-1000 | Significant |
| XL | > 1000 | Consider splitting |

**Prefer smaller PRs** - They get faster, better reviews.

### Merge Strategy

- **Squash and merge** for feature branches (clean history)
- **Merge commit** for release branches (preserve context)
- **Rebase and merge** when linear history is preferred

---

## Version Tagging

### Semantic Versioning

```text
MAJOR.MINOR.PATCH

MAJOR: Breaking changes
MINOR: New features, backward compatible
PATCH: Bug fixes, backward compatible
```

### Pre-release Tags

```text
vX.Y.Z-alpha.N   # Alpha releases
vX.Y.Z-beta.N    # Beta releases
vX.Y.Z-rc.N      # Release candidates
```

### Tagging Process

```bash
# Create annotated tag
git tag -a v1.2.0 -m "Release v1.2.0: Feature description"

# Push tag
git push origin v1.2.0
```

---

## Git Best Practices

### Do

- Commit early and often
- Write meaningful commit messages
- Keep commits focused (one change per commit)
- Pull/rebase before pushing
- Use `.gitignore` properly
- Review your own changes before committing

### Don't

- Commit secrets or credentials
- Force push to shared branches
- Commit generated/build files
- Create huge commits
- Commit broken code to shared branches
- Rewrite published history

---

## Conflict Resolution

### Prevention

1. Keep branches short-lived
2. Regularly sync with base branch
3. Communicate about overlapping work
4. Use feature flags for parallel work

### Resolution Process

```bash
# Update your branch
git fetch origin
git rebase origin/develop

# Resolve conflicts
# Edit conflicted files
git add <resolved-files>
git rebase --continue

# Or abort if needed
git rebase --abort
```

### Resolution Guidelines

- Understand both changes before resolving
- Don't just accept "mine" or "theirs" blindly
- Test after resolution
- Get help if unsure

---

## Protected Branch Rules

### main

```yaml
protection:
  required_reviews: 2
  dismiss_stale_reviews: true
  require_code_owner_review: true
  required_status_checks:
    - build
    - test
    - security-scan
  enforce_admins: true
  allow_force_push: false
  allow_deletion: false
```

### develop

```yaml
protection:
  required_reviews: 1
  dismiss_stale_reviews: true
  required_status_checks:
    - build
    - test
  enforce_admins: false
  allow_force_push: false
  allow_deletion: false
```

---

## Git Hooks

### Pre-commit

```bash
#!/bin/sh
# Run linting
npm run lint

# Run type check
npm run typecheck

# Check for secrets
./scripts/check-secrets.sh
```

### Commit-msg

```bash
#!/bin/sh
# Validate commit message format
./scripts/validate-commit-msg.sh "$1"
```

### Pre-push

```bash
#!/bin/sh
# Run tests
npm test

# Check regression guards
./scripts/check-guard-compliance.sh
```

---

## Emergency Procedures

### Reverting a Bad Merge

```bash
# Identify the merge commit
git log --oneline

# Revert the merge
git revert -m 1 <merge-commit-hash>

# Push the revert
git push origin main

# Create hotfix for proper fix
git checkout -b hotfix/revert-issue main
```

### Recovering Deleted Branch

```bash
# Find the commit
git reflog

# Recreate branch
git checkout -b <branch-name> <commit-hash>
```

---

*Last Updated: [DATE]*
*Requires ADR to modify*
