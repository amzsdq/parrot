#!/usr/bin/env bash
set -euo pipefail

OUT=${1:?usage: verify-release-ready.sh <release.zip>}
READY="$OUT.ready"
EXPECTED_CANDIDATE=f51e4ba53753dade3bd3f9a64e2b3c50ca05d691

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

read_provenance_one() {
  local key=$1 count value
  count=$(grep -c "^${key}=" "$OUT.provenance.txt" || true)
  [[ "$count" -eq 1 ]] || { echo "FAIL: provenance must contain exactly one $key" >&2; exit 1; }
  value=$(sed -n "s/^${key}=//p" "$OUT.provenance.txt")
  [[ -n "$value" ]] || { echo "FAIL: provenance has empty $key" >&2; exit 1; }
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

# Revalidate semantics, not only bytes. A self-consistent .ready must not make a
# non-ZIP artifact or forged sidecars/provenance consumable.
unzip -t "$OUT" >/dev/null || { echo 'FAIL: publish-ready artifact is not a valid ZIP' >&2; exit 1; }
EXPECTED_LIST=$(mktemp)
trap 'rm -f -- "$EXPECTED_LIST"' EXIT
unzip -Z1 "$OUT" | LC_ALL=C sort > "$EXPECTED_LIST"
cmp -s "$EXPECTED_LIST" "$OUT.files.txt" || { echo 'FAIL: file-list sidecar does not describe artifact contents' >&2; exit 1; }

EXPECTED=$(awk 'NR==1 {print $1}' "$OUT.sha256")
CHECKSUM_NAME=$(awk 'NR==1 {print $2}' "$OUT.sha256")
[[ $(wc -l < "$OUT.sha256") -eq 1 && -n "$EXPECTED" && "$EXPECTED" == "$ARTIFACT_SHA" ]] || { echo 'FAIL: checksum sidecar is not bound to artifact' >&2; exit 1; }
[[ "$CHECKSUM_NAME" == "$OUT" || "$CHECKSUM_NAME" == "$(basename "$OUT")" ]] || { echo 'FAIL: checksum sidecar names a different artifact' >&2; exit 1; }

CANDIDATE_SHA=$(read_provenance_one candidate_sha)
RELEASE_SHA=$(read_provenance_one release_repo_sha)
PROVENANCE_ARTIFACT_SHA=$(read_provenance_one artifact_sha256)
LIVE_RESULT_SHA=$(read_provenance_one live_result_sha256)
[[ "$CANDIDATE_SHA" == "$EXPECTED_CANDIDATE" ]] || { echo 'FAIL: provenance is not bound to exact M5/M6 candidate' >&2; exit 1; }
[[ "$RELEASE_SHA" =~ ^[0-9a-f]{40}$ ]] || { echo 'FAIL: provenance release_repo_sha is not a full commit identity' >&2; exit 1; }
[[ "$LIVE_RESULT_SHA" =~ ^[0-9a-f]{64}$ ]] || { echo 'FAIL: provenance live_result_sha256 is not a SHA256 identity' >&2; exit 1; }
[[ "$PROVENANCE_ARTIFACT_SHA" == "$ARTIFACT_SHA" ]] || { echo 'FAIL: provenance is not bound to artifact' >&2; exit 1; }

trap - EXIT
rm -f -- "$EXPECTED_LIST"
echo "PASS: publish-ready marker and all release components remain mutually, semantically, and candidate-identity bound."
