#!/usr/bin/env bash
set -euo pipefail

OUT=${1:?usage: build-release-archive.sh OUT VERSION [EXTENSION_DIR]}
VERSION=${2:?usage: build-release-archive.sh OUT VERSION [EXTENSION_DIR]}
EXTENSION_DIR=${3:-extension}

case "$OUT" in
  *.zip) ;;
  *) echo "ERROR: release archive must end in .zip: $OUT" >&2; exit 2 ;;
esac

[[ -d "$EXTENSION_DIR" ]] || { echo "ERROR: extension directory missing: $EXTENSION_DIR" >&2; exit 3; }
[[ -f "$EXTENSION_DIR/manifest.json" ]] || { echo "ERROR: manifest missing: $EXTENSION_DIR/manifest.json" >&2; exit 4; }

# build-final-release materializes extension/ under a temporary immutable candidate
# snapshot. Resolve the caller's output path before entering that snapshot so the
# archive is written to the requested release location, not beside the temp tree.
case "$OUT" in
  /*) OUT_ABS=$OUT ;;
  *) OUT_ABS=$PWD/$OUT ;;
esac

(cd "$EXTENSION_DIR" && zip -q -X -r "$OUT_ABS" . -x '*.DS_Store')
unzip -t "$OUT" >/dev/null
unzip -Z1 "$OUT" | LC_ALL=C sort > "$OUT.files.txt"
sha256sum "$OUT" > "$OUT.sha256"
unzip -p "$OUT" manifest.json | grep -F "\"version\": \"$VERSION\"" >/dev/null

sha256sum -c "$OUT.sha256" >/dev/null
[[ -s "$OUT.files.txt" ]] || { echo "ERROR: archive file list is empty" >&2; exit 5; }
echo "PASS: release archive integrity, manifest version, file list, and checksum verified."
