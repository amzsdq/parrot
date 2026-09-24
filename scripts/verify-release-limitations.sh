#!/usr/bin/env bash
set -euo pipefail
GATE_OUTPUT_FILE=${1:?usage: verify-release-limitations.sh GATE_OUTPUT_FILE [NOTES]}
NOTES=${2:-docs/RELEASE_NOTES_DRAFT.md}
GATE_OUTPUT=$(cat "$GATE_OUTPUT_FILE")

if grep -q 'LIMITATION: S9/S10 NOT_OBSERVED' <<<"$GATE_OUTPUT"; then
  if [ ! -f "$NOTES" ]; then
    echo "FAIL: live evidence contains NOT_OBSERVED S9/S10 but release notes file is missing: $NOTES" >&2
    exit 1
  fi
  if ! grep -Eiq 'S9|ambigu' "$NOTES"; then
    echo "FAIL: release notes do not describe the S9/ambiguity limitation" >&2
    exit 1
  fi
  if ! grep -Eiq 'S10|cooldown|rate-limit' "$NOTES"; then
    echo "FAIL: release notes do not describe the S10/cooldown limitation" >&2
    exit 1
  fi
  echo 'PASS: NOT_OBSERVED live limitations are represented in release notes.'
fi
