#!/usr/bin/env bash
set -euo pipefail

NOTES=${1:-docs/RELEASE_NOTES_DRAFT.md}

# RELEASE_SHA is provenance for the committed release machinery. Refuse to run
# if the builder/gates or the release notes differ from HEAD. Live smoke result
# is intentionally not included: it is external evidence and is hashed into
# provenance separately. extension/ dirtiness is enforced by preflight.
#
# The notes path itself must be tracked. Otherwise a caller could supply an
# untracked local notes file: git diff HEAD would report no tracked difference,
# while the final artifact would be described by bytes absent from RELEASE_SHA.
if ! git ls-files --error-unmatch -- "$NOTES" >/dev/null 2>&1; then
  echo "FAIL: release notes are not tracked by RELEASE_SHA: $NOTES" >&2
  exit 1
fi

if ! git diff --quiet HEAD -- scripts "$NOTES"; then
  echo "FAIL: release tooling or release notes differ from HEAD; commit/revert them before building" >&2
  git status --short -- scripts "$NOTES" >&2 || true
  exit 1
fi

if [[ ! -f "$NOTES" ]]; then
  echo "FAIL: release notes are missing: $NOTES" >&2
  exit 1
fi

echo "PASS: release tooling and tracked release notes match HEAD."
