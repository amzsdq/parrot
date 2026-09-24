#!/usr/bin/env bash
set -euo pipefail

ROOT=$(git rev-parse --show-toplevel)
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT
OUT="$TMP/parrot-test.zip"

printf 'stale zip\n' > "$OUT"
printf 'stale sha\n' > "$OUT.sha256"
printf 'stale files\n' > "$OUT.files.txt"
printf 'stale provenance\n' > "$OUT.provenance.txt"

bash "$ROOT/scripts/prepare-release-output.sh" "$OUT"

for path in "$OUT" "$OUT.sha256" "$OUT.files.txt" "$OUT.provenance.txt"; do
  [[ ! -e "$path" ]] || { echo "FAIL: cleanup left $path" >&2; exit 1; }
done

if bash "$ROOT/scripts/prepare-release-output.sh" "$TMP/not-a-zip.bin" >/dev/null 2>&1; then
  echo 'FAIL: non-zip release output was accepted' >&2
  exit 1
fi

echo 'PASS: release output cleanup removes stale artifact, checksum, file list, and provenance and rejects non-zip outputs.'
