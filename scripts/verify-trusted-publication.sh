#!/usr/bin/env bash
set -euo pipefail

RECORD=${1:-}
if [[ -z "$RECORD" || ! -f "$RECORD" ]]; then
  echo "usage: verify-trusted-publication.sh <publication-record>" >&2
  exit 2
fi

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
PARSED=$(node "$SCRIPT_DIR/verify-publication-record.mjs" "$RECORD")
RELEASE_REPO_SHA=$(node -e 'const x=JSON.parse(process.argv[1]); process.stdout.write(x.release_repo_sha)' "$PARSED")

# The record bytes themselves are the attestation subject. gh therefore verifies
# the subject digest before returning success. Repository, signer repository,
# predicate type, and source commit are pinned independently of record contents.
gh attestation verify "$RECORD" \
  --repo amzsdq/parrot \
  --signer-repo amzsdq/parrot \
  --predicate-type https://slsa.dev/provenance/v1 \
  --source-digest "$RELEASE_REPO_SHA" \
  --format json >/dev/null

printf '%s\n' "$PARSED"
