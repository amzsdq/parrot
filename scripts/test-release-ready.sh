#!/usr/bin/env bash
set -euo pipefail
ROOT=$(git rev-parse --show-toplevel)
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT
OUT="$TMP/release.zip"
PAYLOAD="$TMP/payload"
CANDIDATE_SHA=f51e4ba53753dade3bd3f9a64e2b3c50ca05d691
RELEASE_SHA=$(git rev-parse HEAD)
LIVE_SHA=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
mkdir -p "$PAYLOAD"
printf '{"manifest_version":3,"name":"Parrot","version":"0.8.7"}\n' > "$PAYLOAD/manifest.json"
printf 'payload\n' > "$PAYLOAD/content.js"

make_release() {
  rm -f "$OUT" "$OUT.sha256" "$OUT.files.txt" "$OUT.provenance.txt" "$OUT.ready"
  (cd "$PAYLOAD" && zip -q -X -r "$OUT" .)
  unzip -Z1 "$OUT" | LC_ALL=C sort > "$OUT.files.txt"
  sha256sum "$OUT" > "$OUT.sha256"
  ARTIFACT_SHA=$(sha256sum "$OUT" | awk '{print $1}')
  printf 'candidate_sha=%s\nrelease_repo_sha=%s\nartifact_sha256=%s\nlive_result_sha256=%s\n' \
    "$CANDIDATE_SHA" "$RELEASE_SHA" "$ARTIFACT_SHA" "$LIVE_SHA" > "$OUT.provenance.txt"
}

make_release
bash "$ROOT/scripts/publish-release-ready.sh" "$OUT"
[[ -f "$OUT.ready" ]] || { echo 'FAIL: ready marker missing' >&2; exit 1; }
bash "$ROOT/scripts/verify-release-ready.sh" "$OUT"

grep -Fxq 'release_ready=YES' "$OUT.ready" || { echo 'FAIL: ready marker lacks positive state' >&2; exit 1; }
grep -Fxq "artifact_sha256=$ARTIFACT_SHA" "$OUT.ready" || { echo 'FAIL: ready marker lacks artifact binding' >&2; exit 1; }
for sidecar in sha256 files.txt provenance.txt; do
  HASH=$(sha256sum "$OUT.$sidecar" | awk '{print $1}')
  case "$sidecar" in
    sha256) key=checksum_sha256 ;;
    files.txt) key=file_list_sha256 ;;
    provenance.txt) key=provenance_sha256 ;;
  esac
  grep -Fxq "$key=$HASH" "$OUT.ready" || { echo "FAIL: ready marker lacks $sidecar binding" >&2; exit 1; }
done

# Publication is a manifest, not a permanent truth bit: any component mutation
# after .ready was committed must make consumption fail closed.
for target in "$OUT" "$OUT.sha256" "$OUT.files.txt" "$OUT.provenance.txt"; do
  make_release
  bash "$ROOT/scripts/publish-release-ready.sh" "$OUT" >/dev/null
  printf 'post-publish mutation\n' >> "$target"
  if bash "$ROOT/scripts/verify-release-ready.sh" "$OUT" >/dev/null 2>&1; then
    echo "FAIL: post-publish mutation remained consumable: $target" >&2; exit 1
  fi
done

# A forged bundle can recompute .ready hashes after changing a sidecar. The
# consumer must still reject semantic disagreement with the ZIP itself.
make_release
printf 'forged-entry.js\n' > "$OUT.files.txt"
bash "$ROOT/scripts/publish-release-ready.sh" "$OUT" >/dev/null
if bash "$ROOT/scripts/verify-release-ready.sh" "$OUT" >/dev/null 2>&1; then
  echo 'FAIL: self-consistent ready marker accepted forged file-list semantics' >&2; exit 1
fi

make_release
printf '%s  other-release.zip\n' "$ARTIFACT_SHA" > "$OUT.sha256"
bash "$ROOT/scripts/publish-release-ready.sh" "$OUT" >/dev/null
if bash "$ROOT/scripts/verify-release-ready.sh" "$OUT" >/dev/null 2>&1; then
  echo 'FAIL: self-consistent ready marker accepted checksum for another artifact name' >&2; exit 1
fi

# Hash-consistent provenance is still untrusted identity input. A bundle that
# rewrites candidate identity and recomputes .ready must not become consumable.
make_release
sed -i 's/^candidate_sha=.*/candidate_sha=1111111111111111111111111111111111111111/' "$OUT.provenance.txt"
bash "$ROOT/scripts/publish-release-ready.sh" "$OUT" >/dev/null
if bash "$ROOT/scripts/verify-release-ready.sh" "$OUT" >/dev/null 2>&1; then
  echo 'FAIL: self-consistent ready marker accepted wrong candidate provenance' >&2; exit 1
fi

make_release
sed -i 's/^release_repo_sha=.*/release_repo_sha=short/' "$OUT.provenance.txt"
bash "$ROOT/scripts/publish-release-ready.sh" "$OUT" >/dev/null
if bash "$ROOT/scripts/verify-release-ready.sh" "$OUT" >/dev/null 2>&1; then
  echo 'FAIL: self-consistent ready marker accepted malformed release commit identity' >&2; exit 1
fi

# The marker itself is also untrusted input at consumption time.
make_release
bash "$ROOT/scripts/publish-release-ready.sh" "$OUT" >/dev/null
printf 'artifact_sha256=duplicate\n' >> "$OUT.ready"
if bash "$ROOT/scripts/verify-release-ready.sh" "$OUT" >/dev/null 2>&1; then
  echo 'FAIL: duplicate ready-marker identity remained consumable' >&2; exit 1
fi

rm -f "$OUT.ready"
printf 'tampered\n' >> "$OUT"
if bash "$ROOT/scripts/publish-release-ready.sh" "$OUT" >/dev/null 2>&1; then
  echo 'FAIL: tampered artifact became publish-ready' >&2; exit 1
fi
[[ ! -e "$OUT.ready" ]] || { echo 'FAIL: failed publish left ready marker' >&2; exit 1; }

echo 'PASS: readiness is generated last and consumption revalidates byte, semantic, and candidate identity binding.'
