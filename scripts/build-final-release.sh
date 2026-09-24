#!/usr/bin/env bash
set -euo pipefail
RESULT=${1:-docs/LIVE_SMOKE_RESULT.md}
CANDIDATE_SHA=${2:-f51e4ba53753dade3bd3f9a64e2b3c50ca05d691}
OUT=${3:-parrot-release.zip}
NOTES=${4:-docs/RELEASE_NOTES_DRAFT.md}
RELEASE_SHA=$(git rev-parse HEAD)

bash scripts/prepare-release-output.sh "$OUT"
cleanup_failed_release() {
  local rc=$?
  rm -f -- "$OUT" "$OUT.sha256" "$OUT.files.txt" "$OUT.provenance.txt"
  exit "$rc"
}
trap cleanup_failed_release ERR

bash scripts/verify-release-worktree.sh "$NOTES"
bash scripts/verify-release-preflight.sh "$CANDIDATE_SHA"

# Freeze both mutable inputs before downstream gates. Live evidence is copied
# once; release product bytes are materialized from the exact candidate commit
# rather than re-reading the working tree after preflight.
[[ -f "$RESULT" ]] || { echo "FAIL: live result missing: $RESULT" >&2; exit 1; }
RESULT_SNAPSHOT=$(mktemp)
cp -- "$RESULT" "$RESULT_SNAPSHOT"
CANDIDATE_SNAPSHOT=$(mktemp -d)
cleanup_snapshots() { rm -f -- "$RESULT_SNAPSHOT"; rm -rf -- "$CANDIDATE_SNAPSHOT"; }
trap cleanup_snapshots EXIT
bash scripts/materialize-release-candidate.sh "$CANDIDATE_SHA" "$CANDIDATE_SNAPSHOT/tree"
VERSION=$(node -e "const fs=require('fs');const m=JSON.parse(fs.readFileSync(process.argv[1],'utf8'));process.stdout.write(m.version)" "$CANDIDATE_SNAPSHOT/tree/extension/manifest.json")

echo "Verifying live browser evidence for candidate $CANDIDATE_SHA"
GATE_OUTPUT=$(bash scripts/verify-candidate-live-evidence.sh "$RESULT_SNAPSHOT" "$CANDIDATE_SHA")
echo "$GATE_OUTPUT"

echo "PASS: release extension tree is identical to M6 candidate $CANDIDATE_SHA (release repo $RELEASE_SHA)"

GATE_OUTPUT_FILE=$(mktemp)
printf '%s\n' "$GATE_OUTPUT" > "$GATE_OUTPUT_FILE"
bash scripts/verify-release-limitations.sh "$GATE_OUTPUT_FILE" "$NOTES"
rm -f "$GATE_OUTPUT_FILE"

bash scripts/verify-release-repository.sh
bash scripts/build-release-archive.sh "$OUT" "$VERSION" "$CANDIDATE_SNAPSHOT/tree/extension"
bash scripts/write-release-provenance.sh "$OUT" "$CANDIDATE_SHA" "$RELEASE_SHA" "$RESULT_SNAPSHOT"
echo "PASS: final release artifact built only after candidate-bound authenticated live evidence, immutable candidate-tree identity, and limitation gates."
trap - ERR
