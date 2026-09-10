#!/bin/bash
#
# verify.sh - Pre-flight and Post-flight Verification Gate
#
# The absolute source of truth for code health (Harness Engineering
# Standard section 4). Runs the commands configured in .aceconfig's
# `verify:` block and exits non-zero if any of them fail. An
# unconfigured gate also fails: silence must never count as passing.
#
# Output contract: the final line is always machine-parseable:
#   VERIFY_RESULT=pass|fail gate=<name>
#
# Two profiles:
#   full (default) - test_cmd, lint_cmd, typecheck_cmd; ends gate=all
#   fast (--fast)  - lint_cmd and typecheck_cmd only; ends gate=fast
#
# The fast profile exists for the Claude Code Stop hook, which runs this on
# every agent turn. A full test suite on every turn is what pushes adopters
# to disable the hook, and a disabled hook verifies nothing.
#
# Usage: .ace/scripts/verify.sh [--fast] [path/to/.aceconfig]

set -u

CONFIG=".aceconfig"
PROFILE="full"
TAIL_LINES=20

for arg in "$@"; do
    case "$arg" in
        --fast) PROFILE="fast" ;;
        -*)     echo "[!] Unknown option: $arg"
                echo "    Usage: verify.sh [--fast] [path/to/.aceconfig]"
                exit 2 ;;
        *)      CONFIG="$arg" ;;
    esac
done

fail() {
    # $1 = gate name, $2 = message
    echo "[!] $2"
    echo "VERIFY_RESULT=fail gate=$1"
    exit 1
}

if [ ! -f "$CONFIG" ]; then
    fail "config" "Config file not found: $CONFIG"
fi

# Read a flat `key: "value"` line from the config. The verify: block is
# constrained to flat double-quoted values precisely so this works
# without a YAML parser.
get_cmd() {
    sed -n 's/^[[:space:]]*'"$1"':[[:space:]]*"\(.*\)".*$/\1/p' "$CONFIG" | head -n 1
}

TEST_CMD="$(get_cmd test_cmd)"
LINT_CMD="$(get_cmd lint_cmd)"
TYPECHECK_CMD="$(get_cmd typecheck_cmd)"

# In the fast profile test_cmd is not merely skipped, it is discarded: the
# unconfigured-gate check below must see what this run will actually execute,
# so a project whose only configured command is test_cmd fails fast runs
# rather than passing them vacuously.
if [ "$PROFILE" = "fast" ]; then
    TEST_CMD=""
fi

if [ -z "$TEST_CMD" ] && [ -z "$LINT_CMD" ] && [ -z "$TYPECHECK_CMD" ]; then
    echo "[!] No verification commands configured in $CONFIG."
    echo "    Add a verify: block with at least one of test_cmd, lint_cmd,"
    echo "    typecheck_cmd as flat key: \"command\" lines. Example:"
    echo "        verify:"
    echo "          test_cmd: \"npm test\""
    fail "unconfigured" "An unconfigured gate must not pass."
fi

run_gate() {
    # $1 = gate name, $2 = command
    [ -z "$2" ] && return 0

    echo "[*] Gate '$1': $2"
    OUTPUT_FILE="$(mktemp)"
    if bash -c "$2" > "$OUTPUT_FILE" 2>&1; then
        echo "[ok] Gate '$1' passed."
        rm -f "$OUTPUT_FILE"
        return 0
    else
        STATUS=$?
        echo "[!] Gate '$1' FAILED (exit $STATUS). Last $TAIL_LINES lines:"
        tail -n "$TAIL_LINES" "$OUTPUT_FILE" | sed 's/^/    /'
        rm -f "$OUTPUT_FILE"
        fail "$1" "Gate '$1' failed."
    fi
}

echo "Running ACE verification gate (profile: $PROFILE, config: $CONFIG)..."

# A block with some commands configured and no test_cmd passes without running
# a single test. The all-empty case already fails loudly; this one cannot, or
# a freshly scaffolded project could never finish a turn. Say it out loud
# instead, on every full run, until someone fills it in.
if [ "$PROFILE" = "full" ] && [ -z "$TEST_CMD" ]; then
    echo "[warn] test_cmd is not configured. This gate is not running any tests."
    echo "       Set verify.test_cmd in $CONFIG to this project's test command."
fi

run_gate "test" "$TEST_CMD"
run_gate "lint" "$LINT_CMD"
run_gate "typecheck" "$TYPECHECK_CMD"

echo "All configured gates passed."
if [ "$PROFILE" = "fast" ]; then
    echo "VERIFY_RESULT=pass gate=fast"
else
    echo "VERIFY_RESULT=pass gate=all"
fi
exit 0
