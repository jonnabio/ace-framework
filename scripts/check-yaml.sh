#!/bin/bash
#
# check-yaml.sh - Parse every YAML document in the repository.
#
# Exits 1 and lists the failures if any file does not parse. The step this
# replaced in .github/workflows/validate.yml was
#     python3 -c "..." && echo "OK" || echo "Invalid"
# which prints a failure and still exits 0, so a malformed .aceconfig or
# workflow could never turn CI red.
#
# Covers the extensionless YAML this framework actually runs on - .aceconfig
# is parsed by verify.sh and read first by every agent, and is not matched by
# a *.yml glob.
#
# Usage: scripts/check-yaml.sh [root]   (default: repository root)

set -u

ROOT="${1:-.}"
FAILED=0
CHECKED=0

if ! command -v python3 > /dev/null 2>&1; then
    echo "[!] python3 not found; cannot validate YAML."
    exit 1
fi

# Report the parser's own message, not a traceback through the yaml package.
PARSE='
import sys, yaml
try:
    yaml.safe_load(open(sys.argv[1], encoding="utf-8"))
except Exception as err:
    sys.exit(str(err))
'

# -print0 / read -d '"''"' so paths with spaces survive.
while IFS= read -r -d '' file; do
    CHECKED=$((CHECKED + 1))
    if ERR=$(python3 -c "$PARSE" "$file" 2>&1); then
        echo "  ok   $file"
    else
        echo "  FAIL $file"
        echo "$ERR" | sed 's/^/       /'
        FAILED=$((FAILED + 1))
    fi
done < <(find "$ROOT" \
    \( -name node_modules -o -name .git \) -prune -o \
    \( -name '*.yml' -o -name '*.yaml' -o -name '.aceconfig' -o -name '.aceconfig-ext' \) \
    -type f -print0 | sort -z)

echo ""
if [ "$FAILED" -gt 0 ]; then
    echo "$FAILED of $CHECKED YAML file(s) failed to parse."
    exit 1
fi

echo "All $CHECKED YAML file(s) parsed."
exit 0
