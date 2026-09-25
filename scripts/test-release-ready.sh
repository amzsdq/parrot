#!/usr/bin/env bash
set -euo pipefail
ROOT=$(git rev-parse --show-toplevel)
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT
OUT="$TMP/release.zip"
PAYLOAD="$TMP/payload"
CANDIDATE_SHA=10b053c1a949dcab72f6f74703e9b07c10865e70
RELEASE_SHA=$(git rev-parse HEAD)
mkdir -p "$PAYLOAD"
printf '{"manifest_version":3,"name":"Parrot","version":"0.8.7"}\n' > "$PAYLOAD/manifest.json"
printf 'payload\n' > "$PAYLOAD/content.js"
TRUSTED_ARTIFACT_SHA=
TRUSTED_READY_SHA=

verify_ready() { bash "$ROOT/scripts/verify-release-ready.sh" "$OUT" "$RELEASE_SHA" "$TRUSTED_ARTIFACT_SHA" "$TRUSTED_READY_SHA"; }
trust_current_release() {
  TRUSTED_ARTIFACT_SHA=$(sha256sum "$OUT" | awk '{print $1}')
  TRUSTED_READY_SHA=$(sha256sum "$OUT.ready" | awk '{print $1}')
}

make_evidence() {
  local f="$OUT.live-result.txt"
  {
    printf '# result\nCandidate source SHA: `%s`\n' "$CANDIDATE_SHA"
    printf '%s\n' '- Browser + version: Chrome 140' '- OS: Linux' '- Extension loaded from exact candidate source/artifact: YES' '- Authenticated ChatGPT session structurally confirmed: YES' '- Authentication structural evidence (no identity/secrets): account menu/avatar control structurally present' '- UTC start: 2026-09-24T00:00:00Z' '- ChatGPT worker URLs/labels used (URLs only; no chat prose): https://chatgpt.com/c/a, https://chatgpt.com/c/b'
    for i in $(seq 1 11); do
      state=PASS; [[ $i -eq 9 ]] && state=NOT_OBSERVED
      printf '| S%s case | %s | evidence-%s | 2026-09-24T00:00:%02dZ |\n' "$i" "$state" "$i" "$i"
    done
    printf '%s\n' '## Decision' '- Required S1–S8 + S11 all PASS: YES' '- S9: NOT_OBSERVED' '- S10: PASS' '- M6 decision: PASS' '- Explicit limitations carried to release notes: S9 ambiguity not observed safely' '- UTC decision time: 2026-09-24T00:01:00Z'
  } > "$f"
}

make_release() {
  rm -f "$OUT" "$OUT.sha256" "$OUT.files.txt" "$OUT.provenance.txt" "$OUT.live-result.txt" "$OUT.ready"
  (cd "$PAYLOAD" && zip -q -X -r "$OUT" .)
  unzip -Z1 "$OUT" | LC_ALL=C sort > "$OUT.files.txt"
  sha256sum "$OUT" > "$OUT.sha256"
  make_evidence
  ARTIFACT_SHA=$(sha256sum "$OUT" | awk '{print $1}')
  LIVE_SHA=$(sha256sum "$OUT.live-result.txt" | awk '{print $1}')
  printf 'candidate_sha=%s\nrelease_repo_sha=%s\nartifact_sha256=%s\nlive_result_sha256=%s\n' "$CANDIDATE_SHA" "$RELEASE_SHA" "$ARTIFACT_SHA" "$LIVE_SHA" > "$OUT.provenance.txt"
}

make_release
bash "$ROOT/scripts/publish-release-ready.sh" "$OUT"
trust_current_release
verify_ready
[[ -f "$OUT.ready" ]]
grep -Fxq "live_evidence_sha256=$LIVE_SHA" "$OUT.ready"

# Caller-selected publication paths may contain spaces and nested directories.
# The checksum sidecar must preserve the complete artifact name rather than
# tokenizing it on whitespace.
ORIGINAL_OUT=$OUT
OUT="$TMP/nested dir/release with spaces.zip"
mkdir -p "$(dirname "$OUT")"
make_release
bash "$ROOT/scripts/publish-release-ready.sh" "$OUT" >/dev/null
trust_current_release
verify_ready >/dev/null
OUT=$ORIGINAL_OUT

for target in "$OUT" "$OUT.sha256" "$OUT.files.txt" "$OUT.provenance.txt" "$OUT.live-result.txt"; do
  make_release; bash "$ROOT/scripts/publish-release-ready.sh" "$OUT" >/dev/null; trust_current_release
  printf 'post-publish mutation\n' >> "$target"
  if verify_ready >/dev/null 2>&1; then echo "FAIL: post-publish mutation remained consumable: $target" >&2; exit 1; fi
done

# A trusted ZIP digest alone does not authenticate evidence/provenance sidecars.
# Keep the trusted ZIP unchanged, forge semantically valid evidence, recompute all
# bundle-local bindings, and prove the externally trusted .ready digest rejects it.
make_release; bash "$ROOT/scripts/publish-release-ready.sh" "$OUT" >/dev/null; trust_current_release
ORIGINAL_READY_SHA=$TRUSTED_READY_SHA
sed -i 's/account menu\/avatar control structurally present/account menu and workspace control structurally present/' "$OUT.live-result.txt"
LIVE_SHA=$(sha256sum "$OUT.live-result.txt" | awk '{print $1}')
sed -i "s/^live_result_sha256=.*/live_result_sha256=$LIVE_SHA/" "$OUT.provenance.txt"
bash "$ROOT/scripts/publish-release-ready.sh" "$OUT" >/dev/null
TRUSTED_READY_SHA=$ORIGINAL_READY_SHA
if verify_ready >/dev/null 2>&1; then echo 'FAIL: accepted forged sidecars under trusted release ZIP and repository attribution' >&2; exit 1; fi

# Recomputing every bundle-local binding around different release bytes still
# cannot defeat the trusted artifact digest supplied by the publication channel.
make_release; bash "$ROOT/scripts/publish-release-ready.sh" "$OUT" >/dev/null; trust_current_release
printf 'forged payload\n' > "$PAYLOAD/forged.js"
(cd "$PAYLOAD" && zip -q -X -r "$OUT" .)
rm -f "$PAYLOAD/forged.js"
unzip -Z1 "$OUT" | LC_ALL=C sort > "$OUT.files.txt"
sha256sum "$OUT" > "$OUT.sha256"
FORGED_ARTIFACT_SHA=$(sha256sum "$OUT" | awk '{print $1}')
sed -i "s/^artifact_sha256=.*/artifact_sha256=$FORGED_ARTIFACT_SHA/" "$OUT.provenance.txt"
bash "$ROOT/scripts/publish-release-ready.sh" "$OUT" >/dev/null
if verify_ready >/dev/null 2>&1; then echo 'FAIL: accepted self-consistent forged release bytes under trusted repository attribution' >&2; exit 1; fi

make_release; bash "$ROOT/scripts/publish-release-ready.sh" "$OUT" >/dev/null; trust_current_release
sed -i 's/Authenticated ChatGPT session structurally confirmed: YES/Authenticated ChatGPT session structurally confirmed: NO/' "$OUT.live-result.txt"
LIVE_SHA=$(sha256sum "$OUT.live-result.txt" | awk '{print $1}')
sed -i "s/^live_result_sha256=.*/live_result_sha256=$LIVE_SHA/" "$OUT.provenance.txt"
bash "$ROOT/scripts/publish-release-ready.sh" "$OUT" >/dev/null
if verify_ready >/dev/null 2>&1; then echo 'FAIL: self-consistent invalid live evidence remained consumable' >&2; exit 1; fi

make_release; bash "$ROOT/scripts/publish-release-ready.sh" "$OUT" >/dev/null; trust_current_release
printf 'forged-entry.js\n' > "$OUT.files.txt"
bash "$ROOT/scripts/publish-release-ready.sh" "$OUT" >/dev/null
if verify_ready >/dev/null 2>&1; then echo 'FAIL: accepted forged file-list semantics' >&2; exit 1; fi

make_release; bash "$ROOT/scripts/publish-release-ready.sh" "$OUT" >/dev/null; trust_current_release
printf '%s  other-release.zip\n' "$ARTIFACT_SHA" > "$OUT.sha256"
bash "$ROOT/scripts/publish-release-ready.sh" "$OUT" >/dev/null
if verify_ready >/dev/null 2>&1; then echo 'FAIL: accepted checksum for another artifact name' >&2; exit 1; fi

make_release; bash "$ROOT/scripts/publish-release-ready.sh" "$OUT" >/dev/null; trust_current_release
sed -i 's/^candidate_sha=.*/candidate_sha=1111111111111111111111111111111111111111/' "$OUT.provenance.txt"
bash "$ROOT/scripts/publish-release-ready.sh" "$OUT" >/dev/null
if verify_ready >/dev/null 2>&1; then echo 'FAIL: accepted wrong candidate provenance' >&2; exit 1; fi

make_release; bash "$ROOT/scripts/publish-release-ready.sh" "$OUT" >/dev/null; trust_current_release
sed -i 's/^release_repo_sha=.*/release_repo_sha=short/' "$OUT.provenance.txt"
bash "$ROOT/scripts/publish-release-ready.sh" "$OUT" >/dev/null
if verify_ready >/dev/null 2>&1; then echo 'FAIL: accepted malformed release commit identity' >&2; exit 1; fi

make_release; bash "$ROOT/scripts/publish-release-ready.sh" "$OUT" >/dev/null; trust_current_release
FORGED_RELEASE_SHA=1111111111111111111111111111111111111111
sed -i "s/^release_repo_sha=.*/release_repo_sha=$FORGED_RELEASE_SHA/" "$OUT.provenance.txt"
bash "$ROOT/scripts/publish-release-ready.sh" "$OUT" >/dev/null
if verify_ready >/dev/null 2>&1; then echo 'FAIL: accepted self-consistent forged release repository attribution' >&2; exit 1; fi

make_release; bash "$ROOT/scripts/publish-release-ready.sh" "$OUT" >/dev/null; trust_current_release
printf 'artifact_sha256=duplicate\n' >> "$OUT.ready"
if verify_ready >/dev/null 2>&1; then echo 'FAIL: duplicate ready-marker identity remained consumable' >&2; exit 1; fi

make_release; bash "$ROOT/scripts/publish-release-ready.sh" "$OUT" >/dev/null; trust_current_release
rm -f "$OUT.ready"; printf 'tampered\n' >> "$OUT"
if bash "$ROOT/scripts/publish-release-ready.sh" "$OUT" >/dev/null 2>&1; then echo 'FAIL: tampered artifact became publish-ready' >&2; exit 1; fi
[[ ! -e "$OUT.ready" ]]

echo 'PASS: readiness binds release bytes, semantic sidecars, and repository attribution to external trusted identities while preserving durable semantic live evidence.'
