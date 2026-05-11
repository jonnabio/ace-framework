#!/bin/bash

# update_harness.sh - Deterministic Harness Updater
# This script is used by agents (like QA or Incident Responder) to append
# newly distilled lessons to a standard or prompt file.
# This prevents Context Collapse and Brevity Bias caused by full LLM file rewrites.

if [ "$#" -lt 2 ]; then
    echo "Usage: $0 <relative/path/to/target.md> \"<Rule or Insight to append>\""
    exit 1
fi

TARGET_FILE=$1
NEW_RULE=$2

if [ ! -f "$TARGET_FILE" ]; then
    echo "[!] Target file $TARGET_FILE does not exist. Cannot append."
    exit 1
fi

echo "" >> "$TARGET_FILE"
echo "---" >> "$TARGET_FILE"
echo "> **Distilled Rule [$(date +'%Y-%m-%d')]:**" >> "$TARGET_FILE"
echo "> $NEW_RULE" >> "$TARGET_FILE"
echo "" >> "$TARGET_FILE"

echo "[✓] Successfully appended the new rule to $TARGET_FILE."
exit 0
