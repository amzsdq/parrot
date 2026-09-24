#!/usr/bin/env bash
set -euo pipefail

CANDIDATE_SHA=${1:?usage: materialize-release-candidate.sh CANDIDATE_SHA DEST_DIR}
DEST_DIR=${2:?usage: materialize-release-candidate.sh CANDIDATE_SHA DEST_DIR}

[[ ! -e "$DEST_DIR" ]] || { echo "ERROR: candidate snapshot destination already exists: $DEST_DIR" >&2; exit 2; }
git cat-file -e "$CANDIDATE_SHA^{commit}" 2>/dev/null || { echo "ERROR: candidate commit not found: $CANDIDATE_SHA" >&2; exit 3; }
git cat-file -e "$CANDIDATE_SHA:extension/manifest.json" 2>/dev/null || { echo "ERROR: candidate extension tree missing: $CANDIDATE_SHA" >&2; exit 4; }

mkdir -p "$DEST_DIR"
git archive --format=tar "$CANDIDATE_SHA" extension | tar -xf - -C "$DEST_DIR"
[[ -f "$DEST_DIR/extension/manifest.json" ]] || { echo "ERROR: materialized candidate manifest missing" >&2; exit 5; }

echo "PASS: materialized immutable release candidate tree from $CANDIDATE_SHA"
