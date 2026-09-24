#!/usr/bin/env bash
set -euo pipefail
RESULT=${1:-docs/LIVE_SMOKE_RESULT.md}
CANDIDATE_SHA=${2:-f51e4ba53753dade3bd3f9a64e2b3c50ca05d691}
OUT=${3:-parrot-release.zip}
NOTES=${4:-docs/RELEASE_NOTES_DRAFT.md}
RELEASE_SHA=$(git rev-parse HEAD)

# Invalidate the only publishability marker synchronously before any delegated
# helper runs. The complete stale-output cleanup is then executed from frozen
# RELEASE_SHA tooling below.
rm -f -- "$OUT.ready"
cleanup_failed_release() {
  local rc=$?
  rm -f -- "$OUT.ready" "$OUT" "$OUT.sha256" "$OUT.files.txt" "$OUT.provenance.txt"
  exit "$rc"
}
trap cleanup_failed_release ERR

TOOLING_SNAPSHOT=$(mktemp -d)
RESULT_SNAPSHOT=
CANDIDATE_SNAPSHOT=
cleanup_snapshots() {
  [[ -z "$RESULT_SNAPSHOT" ]] || rm -f -- "$RESULT_SNAPSHOT"
  [[ -z "$CANDIDATE_SNAPSHOT" ]] || rm -rf -- "$CANDIDATE_SNAPSHOT"
  rm -rf -- "$TOOLING_SNAPSHOT"
}
trap cleanup_snapshots EXIT

# Freeze committed release tooling and notes before trusting any downstream
# helper. The frozen verifier proves the mutable worktree matched RELEASE_SHA
# at this boundary; every later helper executes only from this snapshot.
if [[ ${PARROT_TEST_USE_WORKTREE_TOOLING:-0} == 1 ]]; then
  TOOL_ROOT=.
else
  git archive "$RELEASE_SHA" -- scripts "$NOTES" | tar -x -C "$TOOLING_SNAPSHOT"
  TOOL_ROOT=$TOOLING_SNAPSHOT
fi
run_tool() { bash "$TOOL_ROOT/scripts/$1" "${@:2}"; }

run_tool prepare-release-output.sh "$OUT"
run_tool verify-release-worktree.sh "$NOTES"
run_tool verify-release-preflight.sh "$CANDIDATE_SHA"

[[ -f "$RESULT" ]] || { echo "FAIL: live result missing: $RESULT" >&2; exit 1; }
RESULT_SNAPSHOT=$(mktemp)
cp -- "$RESULT" "$RESULT_SNAPSHOT"
CANDIDATE_SNAPSHOT=$(mktemp -d)
run_tool materialize-release-candidate.sh "$CANDIDATE_SHA" "$CANDIDATE_SNAPSHOT/tree"
VERSION=$(node -e "const fs=require('fs');const m=JSON.parse(fs.readFileSync(process.argv[1],'utf8'));process.stdout.write(m.version)" "$CANDIDATE_SNAPSHOT/tree/extension/manifest.json")

echo "Verifying live browser evidence for candidate $CANDIDATE_SHA"
GATE_OUTPUT=$(run_tool verify-candidate-live-evidence.sh "$RESULT_SNAPSHOT" "$CANDIDATE_SHA")
echo "$GATE_OUTPUT"
echo "PASS: release extension tree is identical to M6 candidate $CANDIDATE_SHA (release repo $RELEASE_SHA)"

GATE_OUTPUT_FILE=$(mktemp)
printf '%s\n' "$GATE_OUTPUT" > "$GATE_OUTPUT_FILE"
run_tool verify-release-limitations.sh "$GATE_OUTPUT_FILE" "$NOTES"
rm -f "$GATE_OUTPUT_FILE"

run_tool verify-release-repository.sh
run_tool build-release-archive.sh "$OUT" "$VERSION" "$CANDIDATE_SNAPSHOT/tree/extension"
run_tool write-release-provenance.sh "$OUT" "$CANDIDATE_SHA" "$RELEASE_SHA" "$RESULT_SNAPSHOT"
run_tool publish-release-ready.sh "$OUT"
echo "PASS: final release artifact built and marked publish-ready only after candidate-bound authenticated live evidence, immutable candidate-tree identity, frozen release tooling, and limitation gates."
trap - ERR
