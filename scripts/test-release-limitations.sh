#!/usr/bin/env bash
set -euo pipefail
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT
GATE="$TMP/gate.txt"
NOTES="$TMP/notes.md"
printf '%s\n' 'LIMITATION: S9/S10 NOT_OBSERVED' > "$GATE"

expect_fail() {
  local pattern=$1
  shift
  set +e
  output=$("$@" 2>&1)
  status=$?
  set -e
  [ "$status" -ne 0 ] || { echo "FAIL: expected command failure" >&2; exit 1; }
  grep -Eiq "$pattern" <<<"$output" || { echo "FAIL: wrong failure: $output" >&2; exit 1; }
}

expect_fail 'notes file is missing' bash scripts/verify-release-limitations.sh "$GATE" "$NOTES"
printf '%s\n' 'S10 cooldown was not observed.' > "$NOTES"
expect_fail 'S9/ambiguity' bash scripts/verify-release-limitations.sh "$GATE" "$NOTES"
printf '%s\n' 'S9 ambiguity was not observed.' > "$NOTES"
expect_fail 'S10/cooldown' bash scripts/verify-release-limitations.sh "$GATE" "$NOTES"
printf '%s\n' 'S9 ambiguity was not observed.' 'S10 cooldown was not observed.' > "$NOTES"
bash scripts/verify-release-limitations.sh "$GATE" "$NOTES" | grep -F 'PASS: NOT_OBSERVED'

printf '%s\n' 'PASS: authenticated live evidence' > "$GATE"
rm -f "$NOTES"
bash scripts/verify-release-limitations.sh "$GATE" "$NOTES"
echo 'PASS: release limitation gate rejects missing/incomplete notes and permits complete or non-limited evidence.'
