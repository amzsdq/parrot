#!/usr/bin/env bash
set -Eeuo pipefail
RESULT=${1:-docs/LIVE_SMOKE_RESULT.md}
CANDIDATE_SHA=${2:-10b053c1a949dcab72f6f74703e9b07c10865e70}
OUT=${3:-parrot-release.zip}
NOTES=${4:-docs/RELEASE_NOTES_DRAFT.md}
RELEASE_SHA=$(git rev-parse HEAD)
LOCK_DIR="$OUT.build.lock"
EVIDENCE="$OUT.live-result.txt"

cleanup_failed_release() {
  local rc=$?
  rm -f -- "$OUT.ready" "$OUT" "$OUT.sha256" "$OUT.files.txt" "$OUT.provenance.txt" "$EVIDENCE"
  exit "$rc"
}
trap cleanup_failed_release ERR

TOOLING_SNAPSHOT=$(mktemp -d)
RESULT_SNAPSHOT=
CANDIDATE_SNAPSHOT=
LOCK_HELD=NO
cleanup_snapshots() {
  [[ -z "$RESULT_SNAPSHOT" ]] || rm -f -- "$RESULT_SNAPSHOT"
  [[ -z "$CANDIDATE_SNAPSHOT" ]] || rm -rf -- "$CANDIDATE_SNAPSHOT"
  [[ "$LOCK_HELD" != YES ]] || rmdir -- "$LOCK_DIR" 2>/dev/null || true
  rm -rf -- "$TOOLING_SNAPSHOT"
}
trap cleanup_snapshots EXIT

git archive "$RELEASE_SHA" -- scripts "$NOTES" | tar -x -C "$TOOLING_SNAPSHOT"
TOOL_ROOT=$TOOLING_SNAPSHOT
run_tool() { bash "$TOOL_ROOT/scripts/$1" "${@:2}"; }

if ! mkdir -- "$LOCK_DIR" 2>/dev/null; then
  echo "FAIL: release output is already being built: $OUT" >&2
  exit 1
fi
LOCK_HELD=YES
rm -f -- "$OUT.ready"

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
# Preserve exactly the immutable bytes that passed the candidate-bound verifier.
cp -- "$RESULT_SNAPSHOT" "$EVIDENCE"
run_tool write-release-provenance.sh "$OUT" "$CANDIDATE_SHA" "$RELEASE_SHA" "$EVIDENCE"
run_tool publish-release-ready.sh "$OUT"
echo "PASS: final release artifact built with durable verified live evidence and marked publish-ready only after all release gates."
trap - ERR
