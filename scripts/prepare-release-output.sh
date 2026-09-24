#!/usr/bin/env bash
set -euo pipefail

OUT=${1:?usage: prepare-release-output.sh <release.zip>}
PROVENANCE="$OUT.provenance.txt"
READY="$OUT.ready"

case "$OUT" in
  *.zip) ;;
  *) echo "FAIL: release output must end in .zip" >&2; exit 1 ;;
esac

# Invalidate publishability first. A previous successful marker must disappear
# before any other stale component can be mistaken for the current build.
rm -f -- "$READY"
rm -f -- "$OUT" "$OUT.sha256" "$OUT.files.txt" "$PROVENANCE"

for stale in "$READY" "$OUT" "$OUT.sha256" "$OUT.files.txt" "$PROVENANCE"; do
  if [[ -e "$stale" ]]; then
    echo "FAIL: stale release output remains after cleanup: $stale" >&2
    exit 1
  fi
done

echo "PASS: release output paths are clean and not publish-ready."
