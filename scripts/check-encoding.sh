#!/bin/bash
#
# check-encoding.sh - Detect double-encoded UTF-8 (mojibake).
#
# This repository has been corrupted twice by UTF-8 text decoded as cp1252 and
# re-encoded: 1744 characters across 15 files, repaired in 68d0f52, then 12
# more in AGENTS.md that the first sweep missed, repaired in 7aad699. Both were
# found by hand, because nothing in CI looked.
#
# Matches the sequences those corruptions actually produce - a UTF-8 lead byte
# rendered as a Latin-1 letter followed by another high byte - rather than
# every non-ASCII character, so legitimate accents, arrows and box drawing are
# untouched.
#
# Exits 1 and prints file:line for every hit.
#
# Usage: scripts/check-encoding.sh [root]   (default: repository root)

set -u

ROOT="${1:-.}"

# The pattern is built from octal escapes rather than written literally, so
# this script does not match itself and can be committed to the repository it
# guards. In order: the mojibake lead bytes for U+00C3 and U+00C2 (which stand
# in for the UTF-8 lead bytes C3 and C2), and the two-character sequences that
# a corrupted em dash and a corrupted arrow begin with.
PATTERN=$(printf '\303\203|\303\202|\303\242\342\202\254|\303\242\342\200\240')

HITS=$(grep -rEn "$PATTERN" "$ROOT" \
    --binary-files=without-match \
    --exclude-dir=.git \
    --exclude-dir=node_modules \
    --exclude-dir=packs \
    2>/dev/null)

if [ -n "$HITS" ]; then
    echo "Double-encoded UTF-8 found:"
    echo "$HITS" | sed 's/^/  /'
    echo ""
    echo "$(echo "$HITS" | wc -l | tr -d ' ') line(s) affected."
    echo "These are UTF-8 bytes that were decoded as cp1252 and re-encoded."
    echo "Repair the source file; do not delete the characters."
    exit 1
fi

echo "No double-encoded UTF-8 found."
exit 0
