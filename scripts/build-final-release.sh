#!/usr/bin/env bash
set -euo pipefail
RESULT=${1:-docs/LIVE_SMOKE_RESULT.md}
SOURCE_SHA=${2:-$(git rev-parse HEAD)}
VERSION=$(node -e "const m=require('./extension/manifest.json');process.stdout.write(m.version)")
OUT=${3:-parrot-v${VERSION}.zip}
NOTES=${4:-docs/RELEASE_NOTES_DRAFT.md}

echo "Verifying live browser evidence for source $SOURCE_SHA"
GATE_OUTPUT=$(node scripts/verify-live-smoke-result.mjs "$RESULT" "$SOURCE_SHA")
echo "$GATE_OUTPUT"
if grep -q 'LIMITATION: S9/S10 NOT_OBSERVED' <<<"$GATE_OUTPUT"; then
  test -f "$NOTES"
  grep -Eq 'S9|ambigu' "$NOTES"
  grep -Eq 'S10|cooldown|rate-limit' "$NOTES"
  echo 'PASS: NOT_OBSERVED live limitations are represented in release notes.'
fi
node scripts/verify-repo.mjs
rm -f "$OUT" "$OUT.sha256" "$OUT.files.txt"
(cd extension && zip -X -r "../$OUT" . -x '*.DS_Store')
unzip -t "$OUT"
unzip -Z1 "$OUT" | LC_ALL=C sort > "$OUT.files.txt"
sha256sum "$OUT" | tee "$OUT.sha256"
unzip -p "$OUT" manifest.json | grep -F "\"version\": \"$VERSION\""
echo "PASS: final release artifact built only after candidate-bound live evidence and limitation gates."
