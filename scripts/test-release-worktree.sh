#!/usr/bin/env bash
set -euo pipefail

ROOT=$(git rev-parse --show-toplevel)
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT
git clone -q "$ROOT" "$TMP/repo"
cd "$TMP/repo"

GATE=scripts/verify-release-worktree.sh
NOTES=docs/RELEASE_NOTES_DRAFT.md

bash "$GATE" "$NOTES" >/dev/null

printf '\n# dirty release tooling regression\n' >> scripts/build-final-release.sh
if bash "$GATE" "$NOTES" >/dev/null 2>&1; then
  echo 'FAIL: dirty release tooling was accepted' >&2
  exit 1
fi
git checkout -q -- scripts/build-final-release.sh

printf '\nDirty release-note regression.\n' >> "$NOTES"
if bash "$GATE" "$NOTES" >/dev/null 2>&1; then
  echo 'FAIL: dirty release notes were accepted' >&2
  exit 1
fi
git checkout -q -- "$NOTES"

# A caller-selected untracked notes file is not represented by RELEASE_SHA and
# must never be accepted as release metadata.
printf 'local-only release notes\n' > docs/LOCAL_RELEASE_NOTES.md
if bash "$GATE" docs/LOCAL_RELEASE_NOTES.md >/dev/null 2>&1; then
  echo 'FAIL: untracked release notes were accepted' >&2
  exit 1
fi
rm docs/LOCAL_RELEASE_NOTES.md

# Live evidence is deliberately external/uncommitted input and is bound by its
# content hash in provenance; this gate must not accidentally forbid it.
printf 'external live evidence\n' > docs/LIVE_SMOKE_RESULT.md
bash "$GATE" "$NOTES" >/dev/null

# Product-tree dirtiness belongs to verify-release-preflight.sh, not this gate.
printf '\n' >> extension/manifest.json
bash "$GATE" "$NOTES" >/dev/null

echo 'PASS: release worktree gate rejects dirty tooling/notes and untracked notes without conflating external evidence or candidate-tree preflight.'
