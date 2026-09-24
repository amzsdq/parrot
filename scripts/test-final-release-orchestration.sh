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

install_success_stubs() {
  stub scripts/verify-release-preflight.sh preflight
  stub scripts/verify-candidate-live-evidence.sh live-evidence "echo 'PASS: fake candidate-bound evidence'"
  stub scripts/verify-release-limitations.sh limitations
  stub scripts/prepare-release-output.sh cleanup 'rm -f -- "$1" "$1.sha256" "$1.files.txt" "$1.provenance.txt"'
  stub scripts/verify-release-repository.sh repository
  stub scripts/build-release-archive.sh archive 'touch "$1" "$1.sha256" "$1.files.txt"'
  stub scripts/write-release-provenance.sh provenance 'touch "$1.provenance.txt"'
}

install_success_stubs
OUT=$TMP/release.zip
bash scripts/build-final-release.sh docs/LIVE_SMOKE_RESULT.md HEAD "$OUT" docs/RELEASE_NOTES_DRAFT.md >/dev/null

mapfile -t CALLS < "$LOG"
EXPECTED=(preflight live-evidence limitations cleanup repository archive provenance)
[[ ${#CALLS[@]} -eq ${#EXPECTED[@]} ]] || { echo "FAIL: expected ${#EXPECTED[@]} delegated calls, got ${#CALLS[@]}" >&2; printf '%s\n' "${CALLS[@]}" >&2; exit 1; }
for i in "${!EXPECTED[@]}"; do
  [[ ${CALLS[$i]%%|*} == "${EXPECTED[$i]}" ]] || { echo "FAIL: call $i expected ${EXPECTED[$i]}, got ${CALLS[$i]}" >&2; exit 1; }
done

grep -Fq 'preflight|HEAD' "$LOG" || { echo 'FAIL: candidate SHA not passed to preflight' >&2; exit 1; }
grep -Fq 'live-evidence|docs/LIVE_SMOKE_RESULT.md HEAD' "$LOG" || { echo 'FAIL: live evidence args not candidate-bound' >&2; exit 1; }
grep -Fq "archive|$OUT" "$LOG" || { echo 'FAIL: archive output path not propagated' >&2; exit 1; }
grep -Fq 'provenance|' "$LOG" || { echo 'FAIL: provenance writer not reached' >&2; exit 1; }

assert_blocked_at() {
  local script=$1 gate=$2 code=$3 expected_calls=$4 stale=${5:-no}
  install_success_stubs
  : > "$LOG"
  stub "$script" "$gate" "exit $code"
  local blocked_out="$TMP/blocked-$gate.zip"
  if [[ $stale == yes ]]; then
    touch "$blocked_out" "$blocked_out.sha256" "$blocked_out.files.txt" "$blocked_out.provenance.txt"
  fi
  set +e
  bash scripts/build-final-release.sh docs/LIVE_SMOKE_RESULT.md HEAD "$blocked_out" docs/RELEASE_NOTES_DRAFT.md >/dev/null 2>&1
  rc=$?
  set -e
  [[ $rc -eq $code ]] || { echo "FAIL: $gate failure exit code not propagated: $rc" >&2; exit 1; }
  [[ $(wc -l < "$LOG") -eq $expected_calls ]] || { echo "FAIL: builder did not stop at $gate" >&2; cat "$LOG" >&2; exit 1; }
  [[ $(tail -n1 "$LOG" | cut -d'|' -f1) == "$gate" ]] || { echo "FAIL: expected final call $gate" >&2; cat "$LOG" >&2; exit 1; }
  if [[ $stale == yes || $expected_calls -ge 6 ]]; then
    for path in "$blocked_out" "$blocked_out.sha256" "$blocked_out.files.txt" "$blocked_out.provenance.txt"; do
      [[ ! -e "$path" ]] || { echo "FAIL: failed $gate left misleading release artifact: $path" >&2; exit 1; }
    done
  fi
}

assert_blocked_at scripts/verify-release-preflight.sh preflight 23 1
assert_blocked_at scripts/verify-candidate-live-evidence.sh live-evidence 24 2
assert_blocked_at scripts/verify-release-limitations.sh limitations 25 3
assert_blocked_at scripts/prepare-release-output.sh cleanup 26 4
assert_blocked_at scripts/verify-release-repository.sh repository 29 5 yes
assert_blocked_at scripts/build-release-archive.sh archive 27 6
assert_blocked_at scripts/write-release-provenance.sh provenance 28 7

echo 'PASS: final release builder delegates gates in order, propagates failures, and removes stale/partial publishable state.'
