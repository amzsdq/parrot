#!/usr/bin/env bash
set -euo pipefail

ROOT=$(git rev-parse --show-toplevel)
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT
git clone -q "$ROOT" "$TMP/repo"
cd "$TMP/repo"

LOG=$TMP/calls.log
export PARROT_TEST_LOG=$LOG

stub() {
  local path=$1 name=$2 body=${3:-}
  cat > "$path" <<EOF
#!/usr/bin/env bash
set -euo pipefail
printf '%s|%s\n' '$name' "\$*" >> "\$PARROT_TEST_LOG"
$body
EOF
  chmod +x "$path"
}

stub scripts/verify-release-preflight.sh preflight
stub scripts/verify-candidate-live-evidence.sh live-evidence "echo 'PASS: fake candidate-bound evidence'"
stub scripts/verify-release-limitations.sh limitations
stub scripts/prepare-release-output.sh cleanup
stub scripts/build-release-archive.sh archive 'touch "$1" "$1.sha256" "$1.files.txt"'
stub scripts/write-release-provenance.sh provenance 'touch "$1.provenance.txt"'

OUT=$TMP/release.zip
bash scripts/build-final-release.sh docs/LIVE_SMOKE_RESULT.md HEAD "$OUT" docs/RELEASE_NOTES_DRAFT.md >/dev/null

mapfile -t CALLS < "$LOG"
EXPECTED=(preflight live-evidence limitations cleanup archive provenance)
[[ ${#CALLS[@]} -eq ${#EXPECTED[@]} ]] || { echo "FAIL: expected ${#EXPECTED[@]} delegated calls, got ${#CALLS[@]}" >&2; printf '%s\n' "${CALLS[@]}" >&2; exit 1; }
for i in "${!EXPECTED[@]}"; do
  [[ ${CALLS[$i]%%|*} == "${EXPECTED[$i]}" ]] || { echo "FAIL: call $i expected ${EXPECTED[$i]}, got ${CALLS[$i]}" >&2; exit 1; }
done

grep -Fq 'preflight|HEAD' "$LOG" || { echo 'FAIL: candidate SHA not passed to preflight' >&2; exit 1; }
grep -Fq 'live-evidence|docs/LIVE_SMOKE_RESULT.md HEAD' "$LOG" || { echo 'FAIL: live evidence args not candidate-bound' >&2; exit 1; }
grep -Fq "archive|$OUT" "$LOG" || { echo 'FAIL: archive output path not propagated' >&2; exit 1; }
grep -Fq 'provenance|' "$LOG" || { echo 'FAIL: provenance writer not reached' >&2; exit 1; }

: > "$LOG"
stub scripts/verify-release-preflight.sh preflight 'exit 23'
set +e
bash scripts/build-final-release.sh docs/LIVE_SMOKE_RESULT.md HEAD "$TMP/blocked.zip" docs/RELEASE_NOTES_DRAFT.md >/dev/null 2>&1
rc=$?
set -e
[[ $rc -eq 23 ]] || { echo "FAIL: preflight failure exit code not propagated: $rc" >&2; exit 1; }
[[ $(wc -l < "$LOG") -eq 1 ]] || { echo 'FAIL: builder continued after preflight failure' >&2; cat "$LOG" >&2; exit 1; }
[[ $(cut -d'|' -f1 "$LOG") == preflight ]] || { echo 'FAIL: unexpected call after blocked preflight' >&2; exit 1; }

echo 'PASS: final release builder delegates gates in order and fails closed on preflight failure.'
