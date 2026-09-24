#!/usr/bin/env bash
set -euo pipefail
ROOT=$(git rev-parse --show-toplevel)
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT
OUT="$TMP/release.zip"
LOCK="$OUT.build.lock"
READY="$OUT.ready"

# Simulate an active builder that already owns the output path. A losing
# concurrent builder must fail before touching the active builder's state.
mkdir "$LOCK"
printf 'active-builder-ready-sentinel\n' > "$READY"
if bash "$ROOT/scripts/build-final-release.sh" "$TMP/missing-live-result.md" f51e4ba53753dade3bd3f9a64e2b3c50ca05d691 "$OUT" docs/RELEASE_NOTES_DRAFT.md >/dev/null 2>&1; then
  echo 'FAIL: concurrent release builder acquired an already-owned output' >&2
  exit 1
fi
[[ -d "$LOCK" ]] || { echo 'FAIL: losing builder removed another builder lock' >&2; exit 1; }
[[ "$(cat "$READY")" == 'active-builder-ready-sentinel' ]] || { echo 'FAIL: losing builder mutated active builder readiness' >&2; exit 1; }

# Once ownership is released, this invocation may proceed to later gates and
# fail because live evidence is intentionally absent. It must release its own
# lock on every exit path so a failed builder cannot deadlock future recovery.
rmdir "$LOCK"
rm -f "$READY"
if bash "$ROOT/scripts/build-final-release.sh" "$TMP/missing-live-result.md" f51e4ba53753dade3bd3f9a64e2b3c50ca05d691 "$OUT" docs/RELEASE_NOTES_DRAFT.md >/dev/null 2>&1; then
  echo 'FAIL: builder unexpectedly succeeded without live evidence' >&2
  exit 1
fi
[[ ! -e "$LOCK" ]] || { echo 'FAIL: failed builder leaked release lock' >&2; exit 1; }
[[ ! -e "$READY" ]] || { echo 'FAIL: failed builder left publish-ready state' >&2; exit 1; }

echo 'PASS: release publication is single-writer and lock ownership is fail-closed.'
