#!/usr/bin/env bash
set -euo pipefail

OUT=${1:?usage: verify-release-ready.sh <release.zip>}
READY="$OUT.ready"

for path in "$OUT" "$OUT.sha256" "$OUT.files.txt" "$OUT.provenance.txt" "$READY"; do
  [[ -f "$path" ]] || { echo "FAIL: publish-ready component missing: $path" >&2; exit 1; }
done

read_one() {
  local key=$1 count value
  count=$(grep -c "^${key}=" "$READY" || true)
  [[ "$count" -eq 1 ]] || { echo "FAIL: ready marker must contain exactly one $key" >&2; exit 1; }
  value=$(sed -n "s/^${key}=//p" "$READY")
  [[ -n "$value" ]] || { echo "FAIL: ready marker has empty $key" >&2; exit 1; }
  printf '%s' "$value"
}

[[ "$(read_one release_ready)" == YES ]] || { echo 'FAIL: release_ready is not YES' >&2; exit 1; }
ARTIFACT_SHA=$(sha256sum "$OUT" | awk '{print $1}')
CHECKSUM_SHA=$(sha256sum "$OUT.sha256" | awk '{print $1}')
FILE_LIST_SHA=$(sha256sum "$OUT.files.txt" | awk '{print $1}')
PROVENANCE_SHA=$(sha256sum "$OUT.provenance.txt" | awk '{print $1}')

[[ "$(read_one artifact_sha256)" == "$ARTIFACT_SHA" ]] || { echo 'FAIL: ready marker artifact hash mismatch' >&2; exit 1; }
[[ "$(read_one checksum_sha256)" == "$CHECKSUM_SHA" ]] || { echo 'FAIL: ready marker checksum sidecar hash mismatch' >&2; exit 1; }
[[ "$(read_one file_list_sha256)" == "$FILE_LIST_SHA" ]] || { echo 'FAIL: ready marker file-list hash mismatch' >&2; exit 1; }
[[ "$(read_one provenance_sha256)" == "$PROVENANCE_SHA" ]] || { echo 'FAIL: ready marker provenance hash mismatch' >&2; exit 1; }

EXPECTED=$(awk 'NR==1 {print $1}' "$OUT.sha256")
[[ -n "$EXPECTED" && "$EXPECTED" == "$ARTIFACT_SHA" ]] || { echo 'FAIL: checksum sidecar is not bound to artifact' >&2; exit 1; }
grep -Fxq "artifact_sha256=$ARTIFACT_SHA" "$OUT.provenance.txt" || { echo 'FAIL: provenance is not bound to artifact' >&2; exit 1; }

echo "PASS: publish-ready marker and all release components remain mutually bound."
