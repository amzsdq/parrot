#!/usr/bin/env bash
set -euo pipefail

ROOT=$(git rev-parse --show-toplevel)
PREFLIGHT="$ROOT/scripts/verify-release-preflight.sh"
CANDIDATE_SHA=${1:-f51e4ba53753dade3bd3f9a64e2b3c50ca05d691}
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

git clone -q "$ROOT" "$TMP/repo"
cd "$TMP/repo"

git config user.email test@example.invalid
git config user.name 'Parrot Preflight Test'

expect_fail() {
  local name=$1
  shift
  if "$@" >"$TMP/$name.out" 2>&1; then
    echo "FAIL: $name unexpectedly passed" >&2
    cat "$TMP/$name.out" >&2
    exit 1
  fi
}

# Clean exact candidate tree should pass even when release tooling commits are newer.
bash "$PREFLIGHT" "$CANDIDATE_SHA"

printf '\n// preflight unstaged sentinel\n' >> extension/background.js
expect_fail unstaged bash "$PREFLIGHT" "$CANDIDATE_SHA"
git checkout -- extension/background.js

printf '\n// preflight staged sentinel\n' >> extension/background.js
git add extension/background.js
expect_fail staged bash "$PREFLIGHT" "$CANDIDATE_SHA"
git reset -q HEAD -- extension/background.js
git checkout -- extension/background.js

printf 'sentinel\n' > extension/preflight-untracked.txt
expect_fail untracked bash "$PREFLIGHT" "$CANDIDATE_SHA"
rm extension/preflight-untracked.txt

# A committed product-byte drift must fail candidate identity even with a clean tree.
printf '\n// committed candidate drift sentinel\n' >> extension/background.js
git add extension/background.js
git commit -qm 'test: candidate drift sentinel'
expect_fail candidate_drift bash "$PREFLIGHT" "$CANDIDATE_SHA"

echo 'PASS: executable release preflight rejects unstaged, staged, untracked, and committed candidate drift.'
