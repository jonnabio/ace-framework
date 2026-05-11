#!/bin/bash

# update_harness.sh - Deterministic Harness Updater
# This script is used by the Curator to append
# newly distilled lessons to a standard or prompt file.
# It requires categorizing the insight to manage redundancy.

if [ "$#" -lt 3 ]; then
    echo "Usage: $0 <relative/path/to/target.md> \"<Category (e.g., API, Context, Auth)>\" \"<Rule or Insight to append>\""
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
