#!/bin/sh
#
# guard-check.sh - Claude Code PreToolUse hook (ACE enforced hooks adapter)
#
# Blocks file edits that touch a path listed in docs/rca/regression-guards.yaml
# until the agent has read the associated RCA. Exit code 2 is Claude Code's
# blocking status: the tool call is denied and stderr is fed back to the agent.
#
# POSIX sh, grep/sed only - no jq, no yaml parser. Guard paths are collected
# from every "- <path>" list entry in the guards file that looks like a file
# path; matching a test path listed under a guard also blocks, which is
# intentional caution for a reference implementation.
#
# stdin: Claude Code hook JSON ({"tool_name": ..., "tool_input": {"file_path": ...}})

GUARDS_FILE="docs/rca/regression-guards.yaml"

# No guards file, nothing to enforce.
[ -f "$GUARDS_FILE" ] || exit 0

INPUT=$(cat)

# Extract tool_input.file_path from the hook JSON; normalize \ and \\ to /.
FILE_PATH=$(printf '%s' "$INPUT" \
  | sed -n 's/.*"file_path"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' \
  | head -n 1 \
  | sed 's/\\\\/\//g; s/\\/\//g')

# Not a file-editing call we understand; allow.
[ -n "$FILE_PATH" ] || exit 0

# Collect path-looking "- entry" lines from the guards file.
GUARDED_PATHS=$(sed -n 's/^[[:space:]]*-[[:space:]]*\([^"[:space:]][^[:space:]]*\)[[:space:]]*$/\1/p' "$GUARDS_FILE" \
  | grep -E '^[A-Za-z0-9_./-]+\.[A-Za-z0-9]+$|/')

[ -n "$GUARDED_PATHS" ] || exit 0

for guarded in $GUARDED_PATHS; do
  case "$FILE_PATH" in
    *"$guarded")
      {
        echo "BLOCKED by ACE regression guard: $FILE_PATH matches guarded path '$guarded'."
        echo "Before modifying this file you must:"
        echo "  1. Read the guard entry and its RCA in $GUARDS_FILE"
        echo "  2. Confirm the listed invariants will be maintained"
        echo "  3. Plan to run the guard's regression tests after the change"
        echo "Guard context:"
        grep -B 6 -A 8 -- "$guarded" "$GUARDS_FILE" | sed 's/^/  | /'
      } >&2
      exit 2
      ;;
  esac
done

exit 0
