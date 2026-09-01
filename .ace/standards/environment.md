# Environment & Configuration Standards

> Standards for managing configuration across environments.
> Changes require ADR approval.

---

## Environment Tiers

| Environment | Purpose | Data | Access |
|-------------|---------|------|--------|
| `local` | Developer machine | Synthetic | Individual |
| `development` | Integration testing | Synthetic | Team |
| `staging` | Pre-production | Anonymized prod | Team |
| `production` | Live system | Real | Restricted |

---

## Configuration Hierarchy

```text
Priority (highest to lowest):
1. Environment variables (runtime)
2. Environment-specific config files
3. Default config files
4. Code defaults
```

### File Structure

```text
config/
├── default.yaml          # Base configuration
├── development.yaml      # Dev overrides
├── staging.yaml          # Staging overrides
├── production.yaml       # Prod overrides (no secrets!)
├── local.yaml            # Local overrides (gitignored)
└── custom-environment-variables.yaml  # Env var mappings
```

---

## Configuration Rules

### DO

- Use environment variables for secrets
- Use config files for non-sensitive settings
- Validate configuration at startup
- Fail fast on missing required config
- Document all configuration options
- Use sensible defaults where possible

### DON'T

- Hardcode environment-specific values
- Commit secrets to repository
- Use production values as defaults
- Store secrets in config files
- Duplicate config across environments

---

## Secret Management

### Categories

| Category | Examples | Storage |
|----------|----------|---------|
| Critical | DB passwords, API keys | Secret manager |
| Sensitive | Internal service tokens | Env variables |
| Non-secret | Feature flags, URLs | Config files |

### Secret Sources

```yaml
# Order of preference
secrets:
  1. Cloud secret manager (AWS SM, Vault, etc.)
  2. Environment variables
  3. Encrypted files (emergency only)

# Never acceptable
  - Config files
  - Source code
  - Logs
  - Error messages
```

### Environment Variable Naming

```bash
# Pattern: [APP]_[CATEGORY]_[NAME]
APP_DB_HOST=localhost
APP_DB_PORT=5432
APP_DB_PASSWORD=secret          # From secret manager
APP_AUTH_JWT_SECRET=secret      # From secret manager
APP_CACHE_REDIS_URL=redis://...
APP_EXTERNAL_API_KEY=secret     # From secret manager
```

---

## Configuration Schema

### Required Fields

```yaml
# config/schema.yaml
app:
  name:
    type: string
    required: true
  version:
    type: string
    required: true
  environment:
    type: string
    enum: [local, development, staging, production]
    required: true

server:
  host:
    type: string
    default: "0.0.0.0"
  port:
    type: number
    default: 3000
    min: 1
    max: 65535

database:
  host:
    type: string
    required: true
  port:
    type: number
    default: 5432
  name:
    type: string
    required: true
  username:
    type: string
    required: true
    env: APP_DB_USERNAME
  password:
    type: string
    required: true
    env: APP_DB_PASSWORD
    secret: true
```

### Validation

```typescript
// Validate config at startup
function validateConfig(config: unknown): Config {
  const result = configSchema.safeParse(config);
  if (!result.success) {
    console.error('Configuration validation failed:');
    result.error.issues.forEach(issue => {
      console.error(`  ${issue.path.join('.')}: ${issue.message}`);
    });
    process.exit(1);
  }
  return result.data;
}
```

---

## Environment Parity

### Goal

Minimize differences between environments to reduce "works on my machine" issues.

### Requirements

| Aspect | Local | Dev | Staging | Prod |
|--------|-------|-----|---------|------|
| Database | Same version | Same version | Same version | Same version |
| Runtime | Same version | Same version | Same version | Same version |
| Dependencies | Same versions | Same versions | Same versions | Same versions |
| Config structure | Same | Same | Same | Same |

### Differences Allowed

| Aspect | May Differ |
|--------|------------|
| Resource sizes | Scale down for non-prod |
| Replicas | Single in local/dev |
| External services | Mocked in local |
| Data | Synthetic in non-prod |
| Secrets | Different per env |

---

## Feature Flags

### Structure

```yaml
features:
  new_checkout_flow:
    enabled: false
    description: "New checkout UI"
    rollout_percentage: 0
    allowed_users: []
    expires: "2024-06-01"

  dark_mode:
    enabled: true
    description: "Dark mode support"
    rollout_percentage: 100
```

### Usage

```typescript
if (features.isEnabled('new_checkout_flow', { userId })) {
  // New flow
} else {
  // Old flow
}
```

### Rules

- Flags have expiration dates
- Remove flags after full rollout
- Document all active flags
- Test both paths

---

## Configuration Loading

### Startup Sequence

```text
1. Load default.yaml
2. Merge environment-specific file
3. Apply environment variables
4. Validate against schema
5. Freeze configuration
```

### Access Pattern

```typescript
// Centralized config access
import { config } from '@/shared/config';

// Type-safe access
const dbHost = config.database.host;
const port = config.server.port;

// Don't do this
const port = process.env.PORT; // Use config instead
```

---

## Sensitive Data Handling

### Logging

```typescript
// Never log sensitive data
logger.info('Connecting to database', {
  host: config.database.host,
  port: config.database.port,
  // password: NEVER
});
```

### Error Messages

```typescript
// Don't expose config in errors
throw new Error('Database connection failed');
// Not: throw new Error(`Connection to ${host}:${password} failed`);
```

### Debug Output

```typescript
// Mask sensitive values in debug output
function maskConfig(config: Config): SafeConfig {
  return {
    ...config,
    database: {
      ...config.database,
      password: '***MASKED***',
    },
  };
}
```

---

## Environment-Specific Behaviors

### Local Development

```yaml
# config/local.yaml
logging:
  level: debug
  format: pretty

database:
  host: localhost
  logging: true  # Log queries

features:
  all_flags_enabled: true  # Optional: enable all for dev
```

### Production

```yaml
# config/production.yaml
logging:
  level: info
  format: json

database:
  pool:
    min: 10
    max: 50
  logging: false

security:
  rate_limiting: true
  cors:
    origin: "https://app.example.com"
```

---

## Configuration Checklist

Before deployment:

- [ ] All required config values set
- [ ] Secrets in secret manager
- [ ] No secrets in config files
- [ ] Config validated at startup
- [ ] Logging doesn't expose secrets
- [ ] Error messages don't expose secrets
- [ ] Feature flags reviewed
- [ ] Environment parity verified

---

*Last Updated: [DATE]*
*Requires ADR to modify*
