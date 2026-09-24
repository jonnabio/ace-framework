# Database Platform Usage Inventory

**Owner:** [responsible role]
**Reviewed:** [date]

## Scope

Link to generated application reference; record platform usage intent separately.
Do not include stored rows, request headers, tokens, job SQL bodies or connection values.

| Capability | Intent to record | Verification evidence |
| --- | --- | --- |
| pg_cron | Schedule purpose, ownership, retry and failure handling | Local or preview execution outcome |
| pg_net | Integration purpose, outbound trust boundary, timeout behavior | Synthetic request and failure rehearsal |
| Realtime | Publication/subscription purpose, authorization and data classification | Allowed and denied subscriptions |
| Storage | Bucket and policy intent, retention, object recovery ownership | Synthetic upload/access/restore rehearsal |

## Change review

Record dependencies on platform-owned schemas without treating their internals as owned objects.
Review application-authored Storage policies separately and link to security-model intent.
