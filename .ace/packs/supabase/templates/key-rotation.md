# Key Rotation Runbook

**Owner:** [responsible human role]
**Reviewed:** [date]

## Rotation intent and inventory

Identify credential classes and their consumers by role, never by secret values.
Distinguish API publishable/secret keys, legacy anon/service-role credentials,
JWT signing material and database credentials; verify the platform's current rotation procedure for each.
Record exposure boundaries and dependencies on token expiry or cached credentials.

## Preparation

Define operator authorization, rollout order, overlap window, rollback limits and monitoring.
Store replacement material only in the approved secret manager/runtime environment.
Do not place keys, tokens or connection values in source, runbooks, traces or examples.
Agents may rehearse only on local stacks or explicitly approved preview branches.

## Human-operated rotation

Record the procedure reference, consumer update order and verification criteria.
Verify expected access with the replacement and denial with revoked material after the overlap window.
Check server-only privilege boundaries and client behavior with synthetic tests.
Revoke old material after validation; log identifiers of evidence, not credential values.

## Failure and review

Document operator escalation and recovery without assuming revoked credentials can be restored.
Record completion evidence, residual risk and follow-up actions.
This template never authorizes an agent to rotate production credentials.
