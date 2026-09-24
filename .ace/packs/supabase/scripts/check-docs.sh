#!/usr/bin/env bash
set -eu
command -v node >/dev/null || { echo "Required tool missing: node" >&2; exit 1; }
exec node "$(dirname "$0")/docs.js"  "$@"
