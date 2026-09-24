#!/usr/bin/env bash
set -euo pipefail

OUT=${1:?usage: verify-release-ready.sh <release.zip> <expected-release-repo-sha> <expected-artifact-sha256> <expected-ready-sha256>}
EXPECTED_RELEASE_SHA=${2:?missing trusted expected release repository sha}
EXPECTED_ARTIFACT_SHA=${3:?missing trusted expected release artifact sha256}
EXPECTED_READY_SHA=${4:?missing trusted expected ready marker sha256}
READY="$OUT.ready"
EVIDENCE="$OUT.live-result.txt"
EXPECTED_CANDIDATE=f51e4ba53753dade3bd3f9a64e2b3c50ca05d691
SCRIPT_DIR=$(cd -- "$(dirname -- "$0")" && pwd)

[[ "$EXPECTED_RELEASE_SHA" =~ ^[0-9a-f]{40}$ ]] || { echo 'FAIL: trusted expected release repository sha is not a full commit identity' >&2; exit 1; }
[[ "$EXPECTED_ARTIFACT_SHA" =~ ^[0-9a-f]{64}$ ]] || { echo 'FAIL: trusted expected release artifact sha256 is not a full digest identity' >&2; exit 1; }
[[ "$EXPECTED_READY_SHA" =~ ^[0-9a-f]{64}$ ]] || { echo 'FAIL: trusted expected ready marker sha256 is not a full digest identity' >&2; exit 1; }

for path in "$OUT" "$OUT.sha256" "$OUT.files.txt" "$OUT.provenance.txt" "$EVIDENCE" "$READY"; do
  [[ -f "$path" ]] || { echo "FAIL: publish-ready component missing: $path" >&2; exit 1; }
done

# The artifact digest authenticates ZIP bytes, but not the semantic sidecars.
# The externally trusted ready-marker digest authenticates the hash manifest that
# binds every sidecar. Without this second byte-level anchor an attacker could
# keep the trusted ZIP, forge evidence/provenance, and recompute .ready.
ACTUAL_READY_SHA=$(sha256sum "$READY" | awk '{print $1}')
[[ "$ACTUAL_READY_SHA" == "$EXPECTED_READY_SHA" ]] || { echo 'FAIL: ready marker does not match trusted publication digest' >&2; exit 1; }

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
EVIDENCE_SHA=$(sha256sum "$EVIDENCE" | awk '{print $1}')

[[ "$ARTIFACT_SHA" == "$EXPECTED_ARTIFACT_SHA" ]] || { echo 'FAIL: release artifact does not match trusted expected artifact digest' >&2; exit 1; }
[[ "$(read_one artifact_sha256)" == "$ARTIFACT_SHA" ]] || { echo 'FAIL: ready marker artifact hash mismatch' >&2; exit 1; }
[[ "$(read_one checksum_sha256)" == "$CHECKSUM_SHA" ]] || { echo 'FAIL: ready marker checksum sidecar hash mismatch' >&2; exit 1; }
[[ "$(read_one file_list_sha256)" == "$FILE_LIST_SHA" ]] || { echo 'FAIL: ready marker file-list hash mismatch' >&2; exit 1; }
[[ "$(read_one provenance_sha256)" == "$PROVENANCE_SHA" ]] || { echo 'FAIL: ready marker provenance hash mismatch' >&2; exit 1; }
[[ "$(read_one live_evidence_sha256)" == "$EVIDENCE_SHA" ]] || { echo 'FAIL: ready marker live-evidence hash mismatch' >&2; exit 1; }

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
[[ "$RELEASE_SHA" == "$EXPECTED_RELEASE_SHA" ]] || { echo 'FAIL: provenance release_repo_sha does not match trusted expected release commit' >&2; exit 1; }
[[ "$LIVE_RESULT_SHA" == "$EVIDENCE_SHA" ]] || { echo 'FAIL: provenance live-result identity does not match durable evidence bytes' >&2; exit 1; }
[[ "$PROVENANCE_ARTIFACT_SHA" == "$ARTIFACT_SHA" ]] || { echo 'FAIL: provenance is not bound to artifact' >&2; exit 1; }

bash "$SCRIPT_DIR/verify-candidate-live-evidence.sh" "$EVIDENCE" "$EXPECTED_CANDIDATE" >/dev/null || { echo 'FAIL: durable live evidence no longer passes candidate-bound verification' >&2; exit 1; }

trap - EXIT
rm -f -- "$EXPECTED_LIST"
echo "PASS: publish-ready release matches trusted release commit, artifact digest, and ready-manifest digest; durable live evidence remains mutually, semantically, and candidate-identity bound."
