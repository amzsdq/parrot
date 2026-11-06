#!/usr/bin/env bash
set -euo pipefail
ROOT=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd -P)
TEST=$(mktemp -d)
OWNER="$TEST/.pcbridge-owned-runbook-test"
printf 'PARROT_RUNBOOK_TEST_OWNER_V1\n' > "$OWNER"
cleanup() {
  [[ -f "$OWNER" && $(cat "$OWNER") == PARROT_RUNBOOK_TEST_OWNER_V1 ]] || {
    echo 'FAIL: missing exact temporary test marker; retaining test files' >&2; return 1;
  }
  rm -rf -- "$TEST"
}
trap cleanup EXIT
mkdir -p -- "$TEST/scripts" "$TEST/docs"
cp -- "$ROOT/scripts/verify-release-runbook.sh" "$TEST/scripts/verify-release-runbook.sh"
cp -- "$ROOT/docs/RELEASE_PROCESS.md" "$TEST/docs/RELEASE_PROCESS.md"
bash "$TEST/scripts/verify-release-runbook.sh" | grep -Fq 'PARROT_RELEASE_RUNBOOK_READ'
mv -- "$TEST/docs/RELEASE_PROCESS.md" "$TEST/docs/RELEASE_PROCESS.md.removed"
if bash "$TEST/scripts/verify-release-runbook.sh" >"$TEST/negative.log" 2>&1; then
  echo 'FAIL: release runbook guard permitted missing doc' >&2; exit 1
fi
mv -- "$TEST/docs/RELEASE_PROCESS.md.removed" "$TEST/docs/RELEASE_PROCESS.md"
sed -i 's/Tool failures/Tool check intentionally missing/' "$TEST/docs/RELEASE_PROCESS.md"
if bash "$TEST/scripts/verify-release-runbook.sh" >"$TEST/negative.log" 2>&1; then
  echo 'FAIL: release runbook guard permitted required missing section' >&2; exit 1
fi
grep -Fq 'docs/RELEASE_PROCESS.md' "$ROOT/scripts/build-final-release.sh"
grep -Fq 'bash "$TOOL_ROOT/scripts/verify-release-runbook.sh"' "$ROOT/scripts/build-final-release.sh"
grep -Fq 'verify-release-runbook.sh' "$ROOT/scripts/publish-release-ready.sh"
echo 'PASS: Parrot release build and publication require frozen runbook; malformed/missing source blocked.'
