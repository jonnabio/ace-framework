#!/bin/sh
#
# stop-verify.sh - Claude Code Stop hook (ACE enforced hooks adapter)
#
# Runs the ACE verify gate when the agent tries to finish its turn. If the
# gate fails, exit 2 blocks the stop and feeds the failure back to the agent
# so it keeps working instead of reporting false success.
#
# Guard against infinite loops: Claude Code sets stop_hook_active in the hook
# JSON when the agent is already continuing due to a Stop hook; we only block
# once per turn.

INPUT=$(cat)

case "$INPUT" in
  *'"stop_hook_active":true'* | *'"stop_hook_active": true'*)
    exit 0
    ;;
esac

# Only enforce in projects that configured a verify gate.
[ -f ".ace/scripts/verify.sh" ] || exit 0

OUTPUT=$(sh .ace/scripts/verify.sh 2>&1)
STATUS=$?

if [ "$STATUS" -ne 0 ]; then
  {
    echo "ACE verify gate FAILED - do not stop yet. Fix the failure first."
    echo "$OUTPUT" | tail -n 15
  } >&2
  exit 2
fi

exit 0
