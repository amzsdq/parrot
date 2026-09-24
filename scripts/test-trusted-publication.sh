#!/usr/bin/env bash
set -euo pipefail
ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

SHA=1111111111111111111111111111111111111111
cat >"$TMP/record.txt" <<EOF
schema=parrot-release-publication-v1
release_repo_sha=$SHA
artifact_sha256=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
ready_sha256=bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
EOF

mkdir "$TMP/bin"
cat >"$TMP/bin/gh" <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
printf '%s\n' "$@" >"$GH_ARGS"
[[ " $* " == *" attestation verify "* ]]
[[ " $* " == *" --repo amzsdq/parrot "* ]]
[[ " $* " == *" --signer-repo amzsdq/parrot "* ]]
[[ " $* " == *" --predicate-type https://slsa.dev/provenance/v1 "* ]]
[[ " $* " == *" --source-digest 1111111111111111111111111111111111111111 "* ]]
[[ " $* " == *" --source-ref refs/heads/main "* ]]
[[ "$3" == "$EXPECTED_RECORD" ]]
EOF
chmod +x "$TMP/bin/gh"
export GH_ARGS="$TMP/args" EXPECTED_RECORD="$TMP/record.txt"
PATH="$TMP/bin:$PATH" bash "$ROOT/scripts/verify-trusted-publication.sh" "$TMP/record.txt" >"$TMP/out"
grep -F '"release_repo_sha":"1111111111111111111111111111111111111111"' "$TMP/out" >/dev/null

# A cryptographic verifier failure must propagate fail-closed.
cat >"$TMP/bin/gh" <<'EOF'
#!/usr/bin/env bash
exit 1
EOF
chmod +x "$TMP/bin/gh"
if PATH="$TMP/bin:$PATH" bash "$ROOT/scripts/verify-trusted-publication.sh" "$TMP/record.txt" >/dev/null 2>&1; then
  echo 'FAIL: accepted record after attestation verification failure' >&2
  exit 1
fi

# Invalid record bytes must fail before gh can bless anything.
cp "$TMP/record.txt" "$TMP/bad.txt"
printf 'unknown=x\n' >>"$TMP/bad.txt"
cat >"$TMP/bin/gh" <<'EOF'
#!/usr/bin/env bash
exit 0
EOF
chmod +x "$TMP/bin/gh"
if PATH="$TMP/bin:$PATH" bash "$ROOT/scripts/verify-trusted-publication.sh" "$TMP/bad.txt" >/dev/null 2>&1; then
  echo 'FAIL: accepted malformed publication record' >&2
  exit 1
fi

echo 'trusted publication adapter regression: PASS'
