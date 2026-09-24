#!/usr/bin/env bash
set -euo pipefail

ROOT=$(pwd)
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT
mkdir -p "$TMP/bin"
cat > "$TMP/bin/node" <<'EOF'
#!/usr/bin/env bash
printf '%s\n' "$@" > "$CAPTURE"
exit "${FAKE_NODE_EXIT:-0}"
EOF
chmod +x "$TMP/bin/node"

export PATH="$TMP/bin:$PATH"
export CAPTURE="$TMP/args"
RESULT='docs/example-live-result.md'
CANDIDATE='0123456789abcdef0123456789abcdef01234567'

bash "$ROOT/scripts/verify-candidate-live-evidence.sh" "$RESULT" "$CANDIDATE"
mapfile -t args < "$CAPTURE"
[[ ${#args[@]} -eq 3 ]]
[[ ${args[0]} == "$ROOT/scripts/verify-live-smoke-result.mjs" ]]
[[ ${args[1]} == "$RESULT" ]]
[[ ${args[2]} == "$CANDIDATE" ]]

export FAKE_NODE_EXIT=23
if bash "$ROOT/scripts/verify-candidate-live-evidence.sh" "$RESULT" "$CANDIDATE" >/dev/null 2>&1; then
  echo 'FAIL: wrapper hid verifier failure' >&2
  exit 1
fi

if bash "$ROOT/scripts/verify-candidate-live-evidence.sh" "$RESULT" >/dev/null 2>&1; then
  echo 'FAIL: wrapper accepted missing candidate SHA' >&2
  exit 1
fi

echo 'PASS: candidate-bound live-evidence wrapper resolves its verifier beside itself, forwards exact result/SHA, and preserves verifier failure.'
