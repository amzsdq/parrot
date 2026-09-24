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
# predicate type, source commit, and canonical source ref are pinned independently
# of record contents. The source-ref pin prevents an alternate branch/tag pointing
# at the same commit from satisfying the canonical-main release authorization.
gh attestation verify "$RECORD" \
  --repo amzsdq/parrot \
  --signer-repo amzsdq/parrot \
  --predicate-type https://slsa.dev/provenance/v1 \
  --source-digest "$RELEASE_REPO_SHA" \
  --source-ref refs/heads/main \
  --format json >/dev/null

printf '%s\n' "$PARSED"
