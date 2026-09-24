#!/usr/bin/env bash
# Called only for a fresh scaffold, from its root. Do not run on adopted projects.
set -eu
[ -f .aceconfig ] || { echo 'Missing .aceconfig' >&2; exit 1; }
tmp=$(mktemp)
trap 'rm -f "$tmp"' EXIT
awk '
BEGIN { in_verify=0; in_includes=0; seen=0 }
/^includes:/ { print "includes: []"; in_includes=1; next }
in_includes && /^[[:space:]]*-/ { next }
in_includes { in_includes=0 }
/^verify:/ {
  seen=1; in_verify=1
  print "verify:"
  print "  test_cmd: \"\""
  print "  lint_cmd: \"bash .ace/scripts/verify-scaffold.sh\""
  print "  typecheck_cmd: \"\""
  print "  docs_cmd: \"\""
  next
}
in_verify && /^[[:space:]]/ { next }
in_verify && /^[^[:space:]#]/ { in_verify=0 }
{ print }
END { if (!seen) exit 1 }
' .aceconfig > "$tmp" || { echo 'Missing verify block' >&2; exit 1; }
cat "$tmp" > .aceconfig
# A framework release queue must never become an adopter work queue.
rm -f docs/progress/tasks.json
