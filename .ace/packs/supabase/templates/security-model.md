# Database Security Model

**Owner:** [responsible role]
**Reviewed:** [date]

## Intent and trust boundaries

Explain why each exposed surface exists; link to generated reference for physical facts.
Distinguish owned scope from exposed scope.

## Access model

Describe expected access for anon and authenticated requests and how identity is verified.
Explain service_role bypass and the server-only trust boundary without recording credentials.
Document grants, RLS policy intent, default-deny cases and privilege escalation paths.
Explain views and SECURITY DEFINER routines, execution grants and pinned search_path namespace trust.

## Validation evidence

Link to comment/RLS checks and allow/deny access tests using synthetic data.
A green documentation gate does not prove policy correctness.
Record review owner and unresolved access risks.
