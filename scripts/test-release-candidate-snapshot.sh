#!/usr/bin/env bash
set -euo pipefail

ROOT=$(git rev-parse --show-toplevel)
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT
git clone -q "$ROOT" "$TMP/repo"
cd "$TMP/repo"
CANDIDATE=$(git rev-parse HEAD)
EXPECTED=$(git show "$CANDIDATE:extension/manifest.json")

# Simulate the working tree changing after a successful preflight. The release
# snapshot must still contain the committed candidate bytes, not this mutation.
printf '\nTOCTOU-MUTATION\n' >> extension/manifest.json
bash scripts/materialize-release-candidate.sh "$CANDIDATE" "$TMP/snapshot" >/dev/null
ACTUAL=$(cat "$TMP/snapshot/extension/manifest.json")
[[ "$ACTUAL" == "$EXPECTED" ]] || { echo 'FAIL: snapshot did not preserve exact candidate bytes' >&2; exit 1; }
! grep -Fq 'TOCTOU-MUTATION' "$TMP/snapshot/extension/manifest.json" || { echo 'FAIL: working-tree mutation leaked into candidate snapshot' >&2; exit 1; }
grep -Fq 'TOCTOU-MUTATION' extension/manifest.json || { echo 'FAIL: mutation fixture did not execute' >&2; exit 1; }

# Destination reuse could mix stale bytes with a new candidate and is forbidden.
set +e
bash scripts/materialize-release-candidate.sh "$CANDIDATE" "$TMP/snapshot" >/dev/null 2>&1
rc=$?
set -e
[[ $rc -eq 2 ]] || { echo "FAIL: existing snapshot destination was not rejected: $rc" >&2; exit 1; }

# Invalid candidate identity must fail closed.
set +e
bash scripts/materialize-release-candidate.sh deadbeef "$TMP/missing" >/dev/null 2>&1
rc=$?
set -e
[[ $rc -eq 3 ]] || { echo "FAIL: missing candidate was not rejected: $rc" >&2; exit 1; }

echo 'PASS: release candidate snapshot is materialized from immutable commit bytes and rejects stale destinations/unknown commits.'
