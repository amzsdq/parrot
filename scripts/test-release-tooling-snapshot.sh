#!/usr/bin/env bash
set -euo pipefail

ROOT=$(git rev-parse --show-toplevel)
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT
git clone -q "$ROOT" "$TMP/repo"
cd "$TMP/repo"

RELEASE_SHA=$(git rev-parse HEAD)
SNAP=$TMP/frozen
mkdir -p "$SNAP"
git archive "$RELEASE_SHA" -- scripts docs/RELEASE_NOTES_DRAFT.md | tar -x -C "$SNAP"

# Mutate a downstream helper only after the committed tooling snapshot exists.
# The frozen helper must remain byte-identical to RELEASE_SHA while the
# worktree helper diverges, proving later execution can be isolated from the
# post-freeze mutation.
printf '\n# post-freeze mutation fixture\n' >> scripts/build-release-archive.sh
! cmp -s scripts/build-release-archive.sh "$SNAP/scripts/build-release-archive.sh" || {
  echo 'FAIL: mutation fixture did not diverge from frozen tooling' >&2
  exit 1
}
git show "$RELEASE_SHA:scripts/build-release-archive.sh" > "$TMP/committed-helper"
cmp -s "$TMP/committed-helper" "$SNAP/scripts/build-release-archive.sh" || {
  echo 'FAIL: frozen helper does not match RELEASE_SHA bytes' >&2
  exit 1
}

# The production builder must route delegated gates through TOOL_ROOT and must
# not opt into the worktree-only orchestration test escape hatch by default.
grep -Fq 'run_tool() { bash "$TOOL_ROOT/scripts/$1"' scripts/build-final-release.sh || {
  echo 'FAIL: builder no longer delegates release gates through frozen TOOL_ROOT' >&2
  exit 1
}
if grep -Eq '^PARROT_TEST_USE_WORKTREE_TOOLING=' scripts/build-final-release.sh; then
  echo 'FAIL: production builder enables worktree tooling bypass by default' >&2
  exit 1
fi

echo 'PASS: RELEASE_SHA tooling snapshot stays immutable across post-freeze worktree mutation and builder delegates through frozen TOOL_ROOT.'
