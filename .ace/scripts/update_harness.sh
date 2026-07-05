#!/bin/bash

# update_harness.sh - Deterministic Harness Updater
# This script is used by the Curator to append
# newly distilled lessons to a standard or prompt file.
# It requires categorizing the insight to manage redundancy.

# v2.7: --from-staging delegates to the Curator so promotions carry
# provenance and the staged entry is marked promoted (ADR-003).
if [ "$1" = "--from-staging" ]; then
    RULE_ID=$2
    TARGET=$3
    if [ -z "$RULE_ID" ] || [ -z "$TARGET" ]; then
        echo "Usage: $0 --from-staging <RULE-id> <relative/path/to/target.md>"
        exit 1
    fi
    if command -v ace-framework > /dev/null 2>&1; then
        exec ace-framework curate promote "$RULE_ID" --to "$TARGET" --yes
    elif [ -f "cli/bin/ace-framework.js" ]; then
        exec node cli/bin/ace-framework.js curate promote "$RULE_ID" --to "$TARGET" --yes
    else
        exec npx -p create-ace-framework ace-framework curate promote "$RULE_ID" --to "$TARGET" --yes
    fi
fi

if [ "$#" -lt 3 ]; then
    echo "Usage: $0 <relative/path/to/target.md> \"<Category (e.g., API, Context, Auth)>\" \"<Rule or Insight to append>\""
    echo "       $0 --from-staging <RULE-id> <relative/path/to/target.md>"
    exit 1
fi

TARGET_FILE=$1
CATEGORY=$2
NEW_RULE=$3

if [ ! -f "$TARGET_FILE" ]; then
    echo "[!] Target file $TARGET_FILE does not exist. Cannot append."
    exit 1
fi

echo "" >> "$TARGET_FILE"
echo "---" >> "$TARGET_FILE"
echo "> **Distilled Rule [$(date +'%Y-%m-%d')] - Category: $CATEGORY:**" >> "$TARGET_FILE"
echo "> $NEW_RULE" >> "$TARGET_FILE"
echo "" >> "$TARGET_FILE"

echo "[✓] Successfully appended the new rule to $TARGET_FILE."
exit 0
