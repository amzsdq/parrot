#!/usr/bin/env bash
set -euo pipefail

OUT=${1:?usage: write-release-provenance.sh <output.zip> <candidate-sha> <release-sha> <live-result>}
CANDIDATE_SHA=${2:?missing candidate sha}
RELEASE_SHA=${3:?missing release sha}
LIVE_RESULT=${4:?missing live result}
PROVENANCE="$OUT.provenance.txt"

[[ -f "$OUT" ]] || { echo "FAIL: release artifact missing: $OUT" >&2; exit 1; }
[[ -f "$LIVE_RESULT" ]] || { echo "FAIL: live result missing: $LIVE_RESULT" >&2; exit 1; }
ARTIFACT_SHA256=$(sha256sum "$OUT" | awk '{print $1}')
LIVE_RESULT_SHA256=$(sha256sum "$LIVE_RESULT" | awk '{print $1}')
printf 'candidate_sha=%s\nrelease_repo_sha=%s\nartifact_sha256=%s\nlive_result_sha256=%s\n' \
  "$CANDIDATE_SHA" "$RELEASE_SHA" "$ARTIFACT_SHA256" "$LIVE_RESULT_SHA256" > "$PROVENANCE"

echo "PASS: wrote release provenance to $PROVENANCE"
