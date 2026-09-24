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

printf '\n# post-freeze mutation fixture\n' >> scripts/build-release-archive.sh
! cmp -s scripts/build-release-archive.sh "$SNAP/scripts/build-release-archive.sh" || { echo 'FAIL: mutation fixture did not diverge from frozen tooling' >&2; exit 1; }
git show "$RELEASE_SHA:scripts/build-release-archive.sh" > "$TMP/committed-helper"
cmp -s "$TMP/committed-helper" "$SNAP/scripts/build-release-archive.sh" || { echo 'FAIL: frozen helper does not match RELEASE_SHA bytes' >&2; exit 1; }

# Nested live verifier must resolve beside the frozen wrapper, never from CWD.
printf '#!/usr/bin/env node\nprocess.exit(0);\n' > scripts/verify-live-smoke-result.mjs
printf 'definitely-not-valid-live-evidence\n' > "$TMP/invalid-live-result.md"
if bash "$SNAP/scripts/verify-candidate-live-evidence.sh" "$TMP/invalid-live-result.md" f51e4ba53753dade3bd3f9a64e2b3c50ca05d691 >/dev/null 2>&1; then
  echo 'FAIL: frozen live-evidence helper escaped to mutable worktree Node verifier' >&2; exit 1
fi

# The repository wrapper had the same escape class. Make the mutable verifier
# unconditional-success and break the repository; the frozen wrapper must still
# invoke its frozen verifier and reject the broken repository.
printf '#!/usr/bin/env node\nprocess.exit(0);\n' > scripts/verify-repo.mjs
mv extension/manifest.json "$TMP/manifest.removed"
if bash "$SNAP/scripts/verify-release-repository.sh" >/dev/null 2>&1; then
  echo 'FAIL: frozen repository helper escaped to mutable worktree Node verifier' >&2; exit 1
fi
mv "$TMP/manifest.removed" extension/manifest.json

grep -Fq 'run_tool() { bash "$TOOL_ROOT/scripts/$1"' scripts/build-final-release.sh || { echo 'FAIL: builder no longer delegates release gates through frozen TOOL_ROOT' >&2; exit 1; }
if grep -Eq '^PARROT_TEST_USE_WORKTREE_TOOLING=' scripts/build-final-release.sh; then echo 'FAIL: production builder enables worktree tooling bypass by default' >&2; exit 1; fi

echo 'PASS: RELEASE_SHA tooling snapshot remains immutable and nested live/repository verifiers cannot escape to mutable worktree tooling.'
