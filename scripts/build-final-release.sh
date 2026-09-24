#!/usr/bin/env bash
set -euo pipefail
RESULT=${1:-docs/LIVE_SMOKE_RESULT.md}
CANDIDATE_SHA=${2:-f51e4ba53753dade3bd3f9a64e2b3c50ca05d691}
VERSION=$(node -e "const m=require('./extension/manifest.json');process.stdout.write(m.version)")
OUT=${3:-parrot-v${VERSION}.zip}
NOTES=${4:-docs/RELEASE_NOTES_DRAFT.md}
RELEASE_SHA=$(git rev-parse HEAD)

# Invalidate any previous publishable-looking output before this attempt starts.
# A failed attempt must never leave artifacts that can be mistaken for its result.
bash scripts/prepare-release-output.sh "$OUT"
cleanup_failed_release() {
  local rc=$?
  rm -f -- "$OUT" "$OUT.sha256" "$OUT.files.txt" "$OUT.provenance.txt"
  exit "$rc"
}
trap cleanup_failed_release ERR

# Provenance records RELEASE_SHA, so the release machinery and notes used by
# this attempt must actually be the committed bytes identified by that SHA.
bash scripts/verify-release-worktree.sh "$NOTES"
bash scripts/verify-release-preflight.sh "$CANDIDATE_SHA"

# Freeze the external live-evidence bytes once. Verification and provenance
# must consume the same immutable snapshot; otherwise RESULT could change
# between the gate and provenance hashing and misrepresent what was verified.
[[ -f "$RESULT" ]] || { echo "FAIL: live result missing: $RESULT" >&2; exit 1; }
RESULT_SNAPSHOT=$(mktemp)
cp -- "$RESULT" "$RESULT_SNAPSHOT"
cleanup_result_snapshot() { rm -f -- "$RESULT_SNAPSHOT"; }
trap cleanup_result_snapshot EXIT

echo "Verifying live browser evidence for candidate $CANDIDATE_SHA"
GATE_OUTPUT=$(bash scripts/verify-candidate-live-evidence.sh "$RESULT_SNAPSHOT" "$CANDIDATE_SHA")
echo "$GATE_OUTPUT"

echo "PASS: release extension tree is identical to M6 candidate $CANDIDATE_SHA (release repo $RELEASE_SHA)"

GATE_OUTPUT_FILE=$(mktemp)
printf '%s\n' "$GATE_OUTPUT" > "$GATE_OUTPUT_FILE"
bash scripts/verify-release-limitations.sh "$GATE_OUTPUT_FILE" "$NOTES"
rm -f "$GATE_OUTPUT_FILE"

bash scripts/verify-release-repository.sh
bash scripts/build-release-archive.sh "$OUT" "$VERSION" extension
bash scripts/write-release-provenance.sh "$OUT" "$CANDIDATE_SHA" "$RELEASE_SHA" "$RESULT_SNAPSHOT"
echo "PASS: final release artifact built only after candidate-bound authenticated live evidence, candidate-tree identity, and limitation gates."
trap - ERR
