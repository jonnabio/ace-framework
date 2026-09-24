#!/usr/bin/env bash
# Structural bootstrap only. Configure application and docs gates when ready.
set -eu
fail() { echo "Scaffold verification failed: $1" >&2; exit 1; }
for file in .aceconfig .ace/roles/roles.md .ace/standards/coding.md .ace/standards/security.md .ace/scripts/verify.sh .ace/schemas/tasks.schema.json docs/context/ACTIVE_CONTEXT.md docs/rca/regression-guards.yaml; do
  [ -s "$file" ] || fail "missing $file"
done
# Check every configured core skill and selected pack include, without YAML dependencies.
refs=$(sed -n -e 's/^[[:space:]]*[^# :]*:[[:space:]]*\(\.ace\/skills\/[^[:space:]]*\).*$/\1/p' -e 's/^[[:space:]]*-[[:space:]]*\(\.ace\/packs\/[^[:space:]]*\.aceconfig-ext\).*$/\1/p' .aceconfig | tr -d '\r')
while IFS= read -r ref; do
  [ -n "$ref" ] || continue
  [ -s "$ref" ] || fail "missing configured reference $ref"
  case "$ref" in
    *.aceconfig-ext)
      while IFS= read -r skill; do
        [ -n "$skill" ] || continue
        [ -s "$skill" ] || fail "missing pack skill $skill"
      done < <(sed -n 's/^[[:space:]]*[^# :]*:[[:space:]]*\(\.ace\/[^[:space:]]*SKILL.md\).*$/\1/p' "$ref" | tr -d '\r') ;;
  esac
done <<< "$refs"
echo 'Scaffold structure verified; application/database checks require explicit configuration.'
