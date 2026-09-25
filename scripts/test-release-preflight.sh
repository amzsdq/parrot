#!/usr/bin/env bash
set -euo pipefail

ROOT=$(git rev-parse --show-toplevel)
PREFLIGHT="$ROOT/scripts/verify-release-preflight.sh"
CANDIDATE_SHA=${1:-10b053c1a949dcab72f6f74703e9b07c10865e70}
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

# Final release is bound to the exact M5/M6 candidate, not merely any commit
# whose extension tree happens to match it.
expect_fail wrong_candidate bash "$PREFLIGHT" HEAD

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

echo 'PASS: executable release preflight rejects wrong candidate identity plus unstaged, staged, untracked, and committed candidate drift.'
