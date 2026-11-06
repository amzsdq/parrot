#!/usr/bin/env bash
set -euo pipefail
# Fail closed before release artifacts, using files from the frozen release SHA.
# This reads policy bytes only; it grants no Chrome/PC permission.
ROOT=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd -P)
GUIDE="$ROOT/docs/RELEASE_PROCESS.md"
[[ -f "$GUIDE" && ! -L "$GUIDE" ]] || { echo 'FAIL: required Parrot deployment runbook absent' >&2; exit 40; }
for section in 'mandatory pre-read' 'Provenance and release gates' 'Tool failures' 'Acceptance record'; do
  grep -Fiq -- "$section" "$GUIDE" || { echo "FAIL: Parrot runbook missing section: $section" >&2; exit 41; }
done
grep -Fq 'PCBridge/blob/main/docs/DEPLOYMENT_METHOD_ROUTER.md' "$GUIDE" || { echo 'FAIL: shared deployment router not linked' >&2; exit 42; }
[[ -s "$GUIDE" ]] || { echo 'FAIL: empty deployment runbook' >&2; exit 43; }
DIGEST=$(sha256sum -- "$GUIDE" | awk '{print $1}')
[[ "$DIGEST" =~ ^[a-f0-9]{64}$ ]] || { echo 'FAIL: runbook hash unreadable' >&2; exit 44; }
printf 'PASS: PARROT_RELEASE_RUNBOOK_READ sha256=%s (no authority granted)\n' "$DIGEST"
