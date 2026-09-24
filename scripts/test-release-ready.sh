#!/usr/bin/env bash
set -euo pipefail
ROOT=$(git rev-parse --show-toplevel)
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT
OUT="$TMP/release.zip"

printf 'artifact bytes\n' > "$OUT"
sha256sum "$OUT" > "$OUT.sha256"
printf 'manifest.json\n' > "$OUT.files.txt"
ARTIFACT_SHA=$(sha256sum "$OUT" | awk '{print $1}')
printf 'candidate_sha=test\nrelease_repo_sha=test\nartifact_sha256=%s\nlive_result_sha256=test\n' "$ARTIFACT_SHA" > "$OUT.provenance.txt"

bash "$ROOT/scripts/publish-release-ready.sh" "$OUT"
[[ -f "$OUT.ready" ]] || { echo 'FAIL: ready marker missing' >&2; exit 1; }
grep -Fxq 'release_ready=YES' "$OUT.ready" || { echo 'FAIL: ready marker lacks positive state' >&2; exit 1; }
grep -Fxq "artifact_sha256=$ARTIFACT_SHA" "$OUT.ready" || { echo 'FAIL: ready marker lacks artifact binding' >&2; exit 1; }
for sidecar in sha256 files.txt provenance.txt; do
  HASH=$(sha256sum "$OUT.$sidecar" | awk '{print $1}')
  case "$sidecar" in
    sha256) key=checksum_sha256 ;;
    files.txt) key=file_list_sha256 ;;
    provenance.txt) key=provenance_sha256 ;;
  esac
  grep -Fxq "$key=$HASH" "$OUT.ready" || { echo "FAIL: ready marker lacks $sidecar binding" >&2; exit 1; }
done

rm -f "$OUT.ready"
printf 'tampered\n' >> "$OUT"
if bash "$ROOT/scripts/publish-release-ready.sh" "$OUT" >/dev/null 2>&1; then
  echo 'FAIL: tampered artifact became publish-ready' >&2; exit 1
fi
[[ ! -e "$OUT.ready" ]] || { echo 'FAIL: failed publish left ready marker' >&2; exit 1; }

echo 'PASS: publish-ready marker is committed only for a complete checksum/provenance-bound release.'
