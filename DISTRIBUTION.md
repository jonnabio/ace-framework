# ACE-Framework Distribution Guide

This document explains how to distribute and deploy ACE-Framework to other developers and projects.

---

## Distribution Methods

### Method 1: GitHub Template (Recommended)

**For new projects - one click setup**

#### Setup as Template Repository

1. Push this repository to GitHub
2. Go to repository Settings
3. Check "Template repository"
4. Users can now click "Use this template"

#### User Experience

```
1. Go to https://github.com/jonnabio/ace-framework
2. Click "Use this template" → "Create a new repository"
3. Name your project
4. Clone and start working
```

#### Pros
- No dependencies required
- Preserves full structure
- Works with any tech stack
- Easy to discover via GitHub

---

### Method 2: CLI Tool (npx)

**For developers who prefer command line**

#### Publishing to npm

```bash
cd cli/
npm login
npm publish
```

#### User Experience

```bash
# Create new project
npx create-ace-framework my-project

# Add to existing project
npx create-ace-framework .

# Interactive mode
npx create-ace-framework
```

#### Updating the CLI

1. Update version in `cli/package.json`
2. Update templates if needed
3. Run `npm publish`

---

### Method 3: Init Script

**For quick setup in existing projects**

#### Hosting the Script

Host `scripts/init.sh` at a stable URL:
```
https://raw.githubusercontent.com/jonnabio/ace-framework/main/scripts/init.sh
```

#### User Experience

```bash
# One-liner installation
curl -fsSL https://raw.githubusercontent.com/jonnabio/ace-framework/main/scripts/init.sh | bash

# Or with wget
wget -qO- https://raw.githubusercontent.com/jonnabio/ace-framework/main/scripts/init.sh | bash

# Specify target directory
curl -fsSL https://...init.sh | bash -s -- my-project
```

---

### Method 4: Manual Download

**For offline or restricted environments**

#### Creating Release Archives

```bash
# Create zip
git archive --format=zip --prefix=ace-framework/ HEAD -o ace-framework-v2.3.0.zip

# Create tarball
git archive --format=tar.gz --prefix=ace-framework/ HEAD -o ace-framework-v2.3.0.tar.gz
```

#### User Experience

1. Download from GitHub Releases
2. Extract to project directory
3. Customize as needed

---

## Deployment Checklist

### Before First Release

- [ ] Update all `OWNER` placeholders in files
- [ ] Set up GitHub repository
- [ ] Enable "Template repository" in settings
- [ ] Create first release tag
- [ ] Publish CLI to npm (optional)
- [ ] Test all installation methods

### For Each Release

- [ ] Update version numbers
- [ ] Update CHANGELOG.md
- [ ] Create git tag (`git tag v2.3.0`)
- [ ] Push tag (`git push origin v2.3.0`)
- [ ] GitHub Actions will create release
- [ ] Update npm package (`cd cli && npm publish`)

---

## Customization Points

When users install the framework, they should customize:

### Required Customizations

1. **`.aceconfig`** - Project name and specific rules
2. **`.ace/standards/coding.md`** - Language-specific rules
3. **`docs/adr/ADR-001-*.md`** - Tech stack decisions

### Optional Customizations

1. **`.ace/knowledge/`** - Domain-specific terms and rules
2. **`.ace/standards/security.md`** - Project-specific security rules
3. **IDE configs** - Team preferences

---

## Version Strategy

### Semantic Versioning

```
MAJOR.MINOR.PATCH

MAJOR: Breaking changes to framework structure
MINOR: New features, templates, or skills
PATCH: Bug fixes, documentation updates
```

### Compatibility

- Major versions may require migration
- Minor versions are backward compatible
- Patch versions are drop-in replacements

---

## Supporting Multiple Languages

The framework is language-agnostic, but users may want language-specific standards.

### Approach 1: Separate Branches

```
main           - Generic framework
typescript     - TypeScript-specific standards
python         - Python-specific standards
go             - Go-specific standards
```

### Approach 2: Template Variants

```
npx create-ace-framework my-project --template typescript
npx create-ace-framework my-project --template python
```

### Approach 3: Addons

```bash
# Base framework
npx create-ace-framework my-project

# Add language pack
npx ace-framework add typescript
```

---

## Enterprise Deployment

### Internal Distribution

1. Fork to internal GitHub/GitLab
2. Customize standards for organization
3. Add organization-specific rules
4. Distribute via internal package registry

### Configuration

```yaml
# .aceconfig additions for enterprise
enterprise:
  organization: "Acme Corp"
  compliance:
    - SOC2
    - GDPR
  internal_standards:
    - .ace/standards/acme-security.md
```

---

## Metrics & Analytics

### Tracking Adoption

- GitHub stars/forks
- npm download counts
- Template usage (GitHub provides this)

### Feedback Collection

- GitHub Issues for bugs
- GitHub Discussions for questions
- User surveys periodically

---

## Support Channels

### For Users

1. **Documentation:** README.md, USER_GUIDE.md, ACE-SPEC.md
2. **Issues:** GitHub Issues for bugs
3. **Discussions:** GitHub Discussions for questions
4. **Updates:** Watch repository for releases

### For Contributors

1. **Contributing:** CONTRIBUTING.md
2. **Development:** Local setup instructions
3. **Pull Requests:** Use PR template

---

## Quick Reference

| Method | Command/Action | Best For |
|--------|----------------|----------|
| Template | "Use this template" on GitHub | New projects |
| CLI | `npx create-ace-framework my-project` | CLI users |
| Script | `curl ... \| bash` | Quick setup |
| Download | GitHub Releases | Offline use |

---

## Files to Update for Distribution

When preparing for distribution, update these placeholders:

| File | Placeholder | Replace With |
|------|-------------|--------------|
| `cli/package.json` | `OWNER` | GitHub username/org |
| `cli/bin/create-ace-framework.js` | `OWNER` | GitHub username/org |
| `scripts/init.sh` | `OWNER` | GitHub username/org |
| `.github/workflows/*.yml` | Repository URLs | Actual URLs |
| `README.md` | Badge URLs | Actual URLs |

---

*Distribution Guide - ACE-Framework v2.3*
