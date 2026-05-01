# Project Context & Preferences

> This file captures stable project-level decisions made during the **Discuss Phase**.
> It is created/updated by the Architect before the Plan phase.
> Unlike ACTIVE_CONTEXT.md (which is volatile per-session), this file is persistent.

---

## Visual Style

- **Density**: [Compact | Comfortable | Spacious]
- **Theme**: [Dark Mode | Light Mode | System]
- **Component Library**: [e.g., Shadcn/UI, Material, Custom]
- **Typography**: [e.g., Inter, System Default]

---

## API Design

- **Style**: [REST | GraphQL | gRPC]
- **Error Format**: [Problem Details RFC 7807 | Custom envelope]
- **Auth Strategy**: [Bearer Token | Session Cookie | API Key]
- **Versioning**: [URL path | Header | Query param]

---

## Data Layer

- **Database**: [e.g., PostgreSQL, SQLite, MongoDB]
- **ORM/Query Builder**: [e.g., Prisma, Drizzle, raw SQL]
- **Migration Tool**: [e.g., Prisma Migrate, Flyway, manual]

---

## Testing

- **Framework**: [e.g., Vitest, Jest, Pytest]
- **Coverage Target**: [e.g., 80%]
- **E2E Tool**: [e.g., Playwright, Cypress, none]

---

## Code Style

- **Language**: [e.g., TypeScript, Python, Go]
- **Linter**: [e.g., ESLint, Ruff, golangci-lint]
- **Formatter**: [e.g., Prettier, Black, gofmt]

---

## Deployment

- **Platform**: [e.g., Vercel, AWS, Docker, self-hosted]
- **CI/CD**: [e.g., GitHub Actions, GitLab CI]
- **Environment Strategy**: [e.g., dev → staging → prod]

---

## Project-Specific Decisions

<!-- Record any Discuss Phase decisions that don't fit the categories above -->

| Decision | Choice | Rationale | Date |
|---|---|---|---|
| _Example: Error handling_ | _Global toast notifications_ | _Cleaner UX for multi-step forms_ | _YYYY-MM-DD_ |

---

*Update this file during the Discuss Phase. Reference it as a constraint during Plan and Execute phases.*
