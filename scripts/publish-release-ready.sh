#!/usr/bin/env bash
set -euo pipefail

OUT=${1:?usage: publish-release-ready.sh <release.zip>}
READY="$OUT.ready"

for path in "$OUT" "$OUT.sha256" "$OUT.files.txt" "$OUT.provenance.txt"; do
  [[ -f "$path" ]] || { echo "FAIL: release component missing before publish: $path" >&2; exit 1; }
done

EXPECTED=$(awk 'NR==1 {print $1}' "$OUT.sha256")
ACTUAL=$(sha256sum "$OUT" | awk '{print $1}')
[[ -n "$EXPECTED" && "$EXPECTED" == "$ACTUAL" ]] || { echo "FAIL: release artifact checksum mismatch before publish" >&2; exit 1; }
grep -Fxq "artifact_sha256=$ACTUAL" "$OUT.provenance.txt" || { echo "FAIL: provenance is not bound to release artifact before publish" >&2; exit 1; }

TMP_READY="$READY.tmp.$$"
trap 'rm -f -- "$TMP_READY"' EXIT
printf 'release_ready=YES\nartifact_sha256=%s\nchecksum_sha256=%s\nfile_list_sha256=%s\nprovenance_sha256=%s\n' \
  "$ACTUAL" \
  "$(sha256sum "$OUT.sha256" | awk '{print $1}')" \
  "$(sha256sum "$OUT.files.txt" | awk '{print $1}')" \
  "$(sha256sum "$OUT.provenance.txt" | awk '{print $1}')" > "$TMP_READY"
mv -- "$TMP_READY" "$READY"
trap - EXIT

echo "PASS: release publish-ready marker committed last at $READY"
