# Backup and Point-in-Time Recovery Runbook

**Owner:** [responsible human role]
**Reviewed:** [date]

## Recovery intent

Record recovery point/time objectives, retention needs and backup ownership.
Verify the currently provisioned backup/PITR capability and limitations; do not assume a subscription tier.
Inventory database metadata and Storage object recovery separately: database recovery does not establish object recovery.

## Preparation

Identify an authorized operator, recovery window, dependency owners and evidence location.
Confirm backup availability and access without placing credentials or connection values here.
Define a safe recovery target and a decision point before irreversible actions.
Agents may rehearse only on local stacks or explicitly approved preview branches using synthetic data.

## Human-operated recovery

Record the approved recovery point, expected impact and operator procedure reference.
Validate schema, catalog comments, data integrity, access control and dependent services after restoration.
Regenerate reference and types, run the full docs gate and record actual recovery timing.

## Failure and review

Describe how the operator stops or escalates a failed restore and avoids overwriting the remaining recovery source.
Record evidence, discrepancies against objectives and follow-up actions.
No production restore is authorized for an agent by this template.
