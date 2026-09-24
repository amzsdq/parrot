#!/usr/bin/env bash
set -euo pipefail
ROOT=$(pwd)
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT
mkdir -p "$TMP/extension"
cat > "$TMP/extension/manifest.json" <<'JSON'
{
  "manifest_version": 3,
  "name": "Archive Test",
  "version": "9.8.7"
}
JSON
printf 'payload\n' > "$TMP/extension/background.js"
printf 'ignored\n' > "$TMP/extension/.DS_Store"

cd "$TMP"
bash "$ROOT/scripts/build-release-archive.sh" artifact.zip 9.8.7 extension >/dev/null
[[ -s artifact.zip ]]
[[ -s artifact.zip.files.txt ]]
[[ -s artifact.zip.sha256 ]]
sha256sum -c artifact.zip.sha256 >/dev/null
unzip -Z1 artifact.zip | grep -Fx 'manifest.json' >/dev/null
unzip -Z1 artifact.zip | grep -Fx 'background.js' >/dev/null
if unzip -Z1 artifact.zip | grep -Fx '.DS_Store' >/dev/null; then
  echo 'ERROR: .DS_Store leaked into release archive' >&2
  exit 1
fi

# Final release builds archive an immutable candidate snapshot that is not the
# caller's working directory. The requested output must still be written exactly
# where the caller asked, rather than beside the snapshot tree.
mkdir -p "$TMP/snapshot/tree/extension" "$TMP/publish"
cp "$TMP/extension/manifest.json" "$TMP/snapshot/tree/extension/manifest.json"
cp "$TMP/extension/background.js" "$TMP/snapshot/tree/extension/background.js"
SNAPSHOT_OUT="$TMP/publish/from-snapshot.zip"
bash "$ROOT/scripts/build-release-archive.sh" "$SNAPSHOT_OUT" 9.8.7 "$TMP/snapshot/tree/extension" >/dev/null
[[ -s "$SNAPSHOT_OUT" && -s "$SNAPSHOT_OUT.files.txt" && -s "$SNAPSHOT_OUT.sha256" ]]
[[ ! -e "$TMP/snapshot/tree/from-snapshot.zip" ]] || { echo 'ERROR: archive escaped requested output path into candidate snapshot' >&2; exit 1; }
sha256sum -c "$SNAPSHOT_OUT.sha256" >/dev/null

if bash "$ROOT/scripts/build-release-archive.sh" wrong-version.zip 0.0.0 extension >/dev/null 2>&1; then
  echo 'ERROR: wrong manifest version was accepted' >&2
  exit 1
fi
if bash "$ROOT/scripts/build-release-archive.sh" artifact.tar 9.8.7 extension >/dev/null 2>&1; then
  echo 'ERROR: non-ZIP output was accepted' >&2
  exit 1
fi
printf 'tamper' >> artifact.zip
if sha256sum -c artifact.zip.sha256 >/dev/null 2>&1; then
  echo 'ERROR: checksum verification accepted a tampered archive' >&2
  exit 1
fi
echo 'PASS: release archive executable regression.'
