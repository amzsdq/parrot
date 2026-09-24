#!/usr/bin/env bash
set -euo pipefail

ROOT=$(git rev-parse --show-toplevel)
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT
git clone -q "$ROOT" "$TMP/repo"
cd "$TMP/repo"
git config user.name parrot-test
git config user.email parrot-test@example.invalid

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
  stub scripts/prepare-release-output.sh cleanup 'rm -f -- "$1.ready" "$1" "$1.sha256" "$1.files.txt" "$1.provenance.txt"'
  stub scripts/verify-release-worktree.sh worktree
  stub scripts/verify-release-preflight.sh preflight
  stub scripts/verify-candidate-live-evidence.sh live-evidence "echo 'PASS: fake candidate-bound evidence'"
  stub scripts/verify-release-limitations.sh limitations
  stub scripts/verify-release-repository.sh repository
  stub scripts/build-release-archive.sh archive 'touch "$1" "$1.sha256" "$1.files.txt"'
  stub scripts/write-release-provenance.sh provenance 'touch "$1.provenance.txt"'
  stub scripts/publish-release-ready.sh publish 'touch "$1.ready"'
}

commit_fixture() {
  git add scripts
  git commit -q --amend --no-edit
}

install_success_stubs
commit_fixture
OUT=$TMP/release.zip
RESULT=$TMP/live-result.md
printf 'verified evidence bytes\n' > "$RESULT"
bash scripts/build-final-release.sh "$RESULT" HEAD "$OUT" docs/RELEASE_NOTES_DRAFT.md >/dev/null

mapfile -t CALLS < "$LOG"
EXPECTED=(cleanup worktree preflight live-evidence limitations repository archive provenance publish)
[[ ${#CALLS[@]} -eq ${#EXPECTED[@]} ]] || { echo "FAIL: expected ${#EXPECTED[@]} delegated calls, got ${#CALLS[@]}" >&2; printf '%s\n' "${CALLS[@]}" >&2; exit 1; }
for i in "${!EXPECTED[@]}"; do
  [[ ${CALLS[$i]%%|*} == "${EXPECTED[$i]}" ]] || { echo "FAIL: call $i expected ${EXPECTED[$i]}, got ${CALLS[$i]}" >&2; exit 1; }
done
[[ -f "$OUT.ready" ]] || { echo 'FAIL: successful builder did not publish readiness last' >&2; exit 1; }

grep -Fq 'worktree|docs/RELEASE_NOTES_DRAFT.md' "$LOG" || { echo 'FAIL: release notes not passed to worktree gate' >&2; exit 1; }
grep -Fq 'preflight|HEAD' "$LOG" || { echo 'FAIL: candidate SHA not passed to preflight' >&2; exit 1; }
LIVE_ARG=$(grep '^live-evidence|' "$LOG" | cut -d'|' -f2- | awk '{print $1}')
PROV_RESULT_ARG=$(grep '^provenance|' "$LOG" | awk -F'|' '{print $2}' | awk '{print $4}')
[[ -n "$LIVE_ARG" && "$LIVE_ARG" == "$PROV_RESULT_ARG" ]] || { echo 'FAIL: verification and provenance did not receive the same live-result snapshot' >&2; cat "$LOG" >&2; exit 1; }
[[ "$LIVE_ARG" != "$RESULT" ]] || { echo 'FAIL: builder passed mutable caller live-result path directly to release gates' >&2; exit 1; }
grep -Fq "archive|$OUT" "$LOG" || { echo 'FAIL: archive output path not propagated' >&2; exit 1; }

install_success_stubs
: > "$LOG"
printf 'original evidence\n' > "$RESULT"
export PARROT_MUTABLE_RESULT=$RESULT
stub scripts/verify-candidate-live-evidence.sh live-evidence 'printf "changed after snapshot\n" > "$PARROT_MUTABLE_RESULT"; echo "PASS: fake candidate-bound evidence"'
stub scripts/write-release-provenance.sh provenance 'grep -Fxq "original evidence" "$4" || { echo "FAIL: provenance did not receive verified snapshot bytes" >&2; exit 41; }; touch "$1.provenance.txt"'
commit_fixture
bash scripts/build-final-release.sh "$RESULT" HEAD "$TMP/toctou.zip" docs/RELEASE_NOTES_DRAFT.md >/dev/null
[[ $(cat "$RESULT") == 'changed after snapshot' ]] || { echo 'FAIL: mutation fixture did not execute' >&2; exit 1; }

assert_blocked_at() {
  local script=$1 gate=$2 code=$3 expected_calls=$4 stale=${5:-yes}
  install_success_stubs
  : > "$LOG"
  stub "$script" "$gate" "exit $code"
  commit_fixture
  local blocked_out="$TMP/blocked-$gate.zip"
  if [[ $stale == yes ]]; then
    touch "$blocked_out.ready" "$blocked_out" "$blocked_out.sha256" "$blocked_out.files.txt" "$blocked_out.provenance.txt"
  fi
  set +e
  bash scripts/build-final-release.sh "$RESULT" HEAD "$blocked_out" docs/RELEASE_NOTES_DRAFT.md >/dev/null 2>&1
  rc=$?
  set -e
  [[ $rc -eq $code ]] || { echo "FAIL: $gate failure exit code not propagated: $rc" >&2; exit 1; }
  [[ $(wc -l < "$LOG") -eq $expected_calls ]] || { echo "FAIL: builder did not stop at $gate" >&2; cat "$LOG" >&2; exit 1; }
  [[ $(tail -n1 "$LOG" | cut -d'|' -f1) == "$gate" ]] || { echo "FAIL: expected final call $gate" >&2; cat "$LOG" >&2; exit 1; }
  if [[ $stale == yes && $gate != cleanup ]]; then
    for path in "$blocked_out.ready" "$blocked_out" "$blocked_out.sha256" "$blocked_out.files.txt" "$blocked_out.provenance.txt"; do
      [[ ! -e "$path" ]] || { echo "FAIL: failed $gate left stale/partial publishable release state: $path" >&2; exit 1; }
    done
  fi
}

assert_blocked_at scripts/prepare-release-output.sh cleanup 26 1 no
assert_blocked_at scripts/verify-release-worktree.sh worktree 30 2
assert_blocked_at scripts/verify-release-preflight.sh preflight 23 3
assert_blocked_at scripts/verify-candidate-live-evidence.sh live-evidence 24 4
assert_blocked_at scripts/verify-release-limitations.sh limitations 25 5
assert_blocked_at scripts/verify-release-repository.sh repository 29 6
assert_blocked_at scripts/build-release-archive.sh archive 27 7
assert_blocked_at scripts/write-release-provenance.sh provenance 28 8
assert_blocked_at scripts/publish-release-ready.sh publish 31 9

echo 'PASS: final release builder executes committed frozen tooling, publishes readiness last, propagates every gate failure, and leaves no misleading publishable state.'
