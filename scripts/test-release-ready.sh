#!/usr/bin/env bash
set -euo pipefail
ROOT=$(git rev-parse --show-toplevel)
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT
OUT="$TMP/release.zip"
PAYLOAD="$TMP/payload"
CANDIDATE_SHA=f51e4ba53753dade3bd3f9a64e2b3c50ca05d691
RELEASE_SHA=$(git rev-parse HEAD)
mkdir -p "$PAYLOAD"
printf '{"manifest_version":3,"name":"Parrot","version":"0.8.7"}\n' > "$PAYLOAD/manifest.json"
printf 'payload\n' > "$PAYLOAD/content.js"

verify_ready() { bash "$ROOT/scripts/verify-release-ready.sh" "$OUT" "$RELEASE_SHA"; }

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
verify_ready
[[ -f "$OUT.ready" ]]
grep -Fxq "live_evidence_sha256=$LIVE_SHA" "$OUT.ready"

for target in "$OUT" "$OUT.sha256" "$OUT.files.txt" "$OUT.provenance.txt" "$OUT.live-result.txt"; do
  make_release; bash "$ROOT/scripts/publish-release-ready.sh" "$OUT" >/dev/null
  printf 'post-publish mutation\n' >> "$target"
  if verify_ready >/dev/null 2>&1; then echo "FAIL: post-publish mutation remained consumable: $target" >&2; exit 1; fi
done

# Even recomputing provenance and readiness cannot make semantically invalid live evidence consumable.
make_release
sed -i 's/Authenticated ChatGPT session structurally confirmed: YES/Authenticated ChatGPT session structurally confirmed: NO/' "$OUT.live-result.txt"
LIVE_SHA=$(sha256sum "$OUT.live-result.txt" | awk '{print $1}')
sed -i "s/^live_result_sha256=.*/live_result_sha256=$LIVE_SHA/" "$OUT.provenance.txt"
bash "$ROOT/scripts/publish-release-ready.sh" "$OUT" >/dev/null
if verify_ready >/dev/null 2>&1; then echo 'FAIL: self-consistent invalid live evidence remained consumable' >&2; exit 1; fi

make_release
printf 'forged-entry.js\n' > "$OUT.files.txt"
bash "$ROOT/scripts/publish-release-ready.sh" "$OUT" >/dev/null
if verify_ready >/dev/null 2>&1; then echo 'FAIL: accepted forged file-list semantics' >&2; exit 1; fi

make_release
printf '%s  other-release.zip\n' "$ARTIFACT_SHA" > "$OUT.sha256"
bash "$ROOT/scripts/publish-release-ready.sh" "$OUT" >/dev/null
if verify_ready >/dev/null 2>&1; then echo 'FAIL: accepted checksum for another artifact name' >&2; exit 1; fi

make_release
sed -i 's/^candidate_sha=.*/candidate_sha=1111111111111111111111111111111111111111/' "$OUT.provenance.txt"
bash "$ROOT/scripts/publish-release-ready.sh" "$OUT" >/dev/null
if verify_ready >/dev/null 2>&1; then echo 'FAIL: accepted wrong candidate provenance' >&2; exit 1; fi

make_release
sed -i 's/^release_repo_sha=.*/release_repo_sha=short/' "$OUT.provenance.txt"
bash "$ROOT/scripts/publish-release-ready.sh" "$OUT" >/dev/null
if verify_ready >/dev/null 2>&1; then echo 'FAIL: accepted malformed release commit identity' >&2; exit 1; fi

# A syntactically valid forged repository SHA plus recomputed ready hashes must not
# be able to misattribute the release to a different tooling/repository commit.
make_release
FORGED_RELEASE_SHA=1111111111111111111111111111111111111111
sed -i "s/^release_repo_sha=.*/release_repo_sha=$FORGED_RELEASE_SHA/" "$OUT.provenance.txt"
bash "$ROOT/scripts/publish-release-ready.sh" "$OUT" >/dev/null
if verify_ready >/dev/null 2>&1; then echo 'FAIL: accepted self-consistent forged release repository attribution' >&2; exit 1; fi

make_release; bash "$ROOT/scripts/publish-release-ready.sh" "$OUT" >/dev/null
printf 'artifact_sha256=duplicate\n' >> "$OUT.ready"
if verify_ready >/dev/null 2>&1; then echo 'FAIL: duplicate ready-marker identity remained consumable' >&2; exit 1; fi

rm -f "$OUT.ready"; printf 'tampered\n' >> "$OUT"
if bash "$ROOT/scripts/publish-release-ready.sh" "$OUT" >/dev/null 2>&1; then echo 'FAIL: tampered artifact became publish-ready' >&2; exit 1; fi
[[ ! -e "$OUT.ready" ]]

echo 'PASS: readiness preserves durable live evidence and binds release bytes, candidate identity, and trusted release-repository identity.'
