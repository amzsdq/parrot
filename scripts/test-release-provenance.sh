#!/usr/bin/env bash
set -euo pipefail

TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT
OUT="$TMP/parrot-test.zip"
RESULT="$TMP/live-result.md"
CANDIDATE=1111111111111111111111111111111111111111
RELEASE=2222222222222222222222222222222222222222
printf 'release artifact bytes\n' > "$OUT"
printf 'authenticated live evidence\n' > "$RESULT"
EXPECTED_ARTIFACT=$(sha256sum "$OUT" | awk '{print $1}')
EXPECTED_LIVE=$(sha256sum "$RESULT" | awk '{print $1}')

bash scripts/write-release-provenance.sh "$OUT" "$CANDIDATE" "$RELEASE" "$RESULT"
PROV="$OUT.provenance.txt"
[[ -f "$PROV" ]] || { echo 'FAIL: provenance file missing' >&2; exit 1; }
grep -Fx "candidate_sha=$CANDIDATE" "$PROV"
grep -Fx "release_repo_sha=$RELEASE" "$PROV"
grep -Fx "artifact_sha256=$EXPECTED_ARTIFACT" "$PROV"
grep -Fx "live_result_sha256=$EXPECTED_LIVE" "$PROV"
[[ $(wc -l < "$PROV") -eq 4 ]] || { echo 'FAIL: unexpected provenance fields' >&2; exit 1; }

if bash scripts/write-release-provenance.sh "$TMP/missing.zip" "$CANDIDATE" "$RELEASE" "$RESULT" >/dev/null 2>&1; then
  echo 'FAIL: missing release artifact was accepted' >&2
  exit 1
fi
if bash scripts/write-release-provenance.sh "$OUT" "$CANDIDATE" "$RELEASE" "$TMP/missing.md" >/dev/null 2>&1; then
  echo 'FAIL: missing live result was accepted' >&2
  exit 1
fi

echo 'PASS: release provenance binds exact candidate/release identities, artifact digest, and verified live-result digest and fails closed on missing inputs.'
