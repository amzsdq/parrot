#!/usr/bin/env bash
set -euo pipefail

BUILDER=scripts/build-final-release.sh
PREFLIGHT=scripts/verify-release-preflight.sh
CLEANUP=scripts/prepare-release-output.sh

require_pattern() {
  local file=$1
  local description=$2
  local pattern=$3
  grep -Eq "$pattern" "$file" || {
    echo "FAIL: $file lost $description gate" >&2
    exit 1
  }
}

# Detailed behavior of shared gates is executable-tested separately.
# These structural checks only ensure the production builder still delegates.
require_pattern "$BUILDER" 'shared release preflight invocation' 'verify-release-preflight\.sh "\$CANDIDATE_SHA"'
require_pattern "$PREFLIGHT" 'unstaged extension dirty-tree' 'git diff --quiet -- extension'
require_pattern "$PREFLIGHT" 'staged extension dirty-tree' 'git diff --cached --quiet -- extension'
require_pattern "$PREFLIGHT" 'untracked extension dirty-tree' 'git ls-files --others --exclude-standard -- extension'
require_pattern "$PREFLIGHT" 'candidate-tree identity' 'git diff --quiet "\$CANDIDATE_SHA" -- extension'
require_pattern "$BUILDER" 'immutable candidate materialization' 'materialize-release-candidate\.sh "\$CANDIDATE_SHA" "\$CANDIDATE_SNAPSHOT/tree"'
require_pattern "$BUILDER" 'shared candidate-bound live evidence invocation' 'verify-candidate-live-evidence\.sh "\$RESULT_SNAPSHOT" "\$CANDIDATE_SHA"'
require_pattern "$BUILDER" 'release limitation gate' 'verify-release-limitations\.sh "\$GATE_OUTPUT_FILE" "\$NOTES"'
require_pattern "$BUILDER" 'shared output cleanup invocation' 'prepare-release-output\.sh "\$OUT"'
require_pattern "$CLEANUP" 'stale artifact cleanup' 'rm -f -- "\$OUT" "\$OUT\.sha256" "\$OUT\.files\.txt" "\$PROVENANCE"'
require_pattern "$BUILDER" 'shared archive integrity invocation' 'build-release-archive\.sh "\$OUT" "\$VERSION" "\$CANDIDATE_SNAPSHOT/tree/extension"'
require_pattern "$BUILDER" 'shared provenance writer invocation' 'write-release-provenance\.sh "\$OUT" "\$CANDIDATE_SHA" "\$RELEASE_SHA" "\$RESULT_SNAPSHOT"'

echo 'PASS: final release builder delegates shared gates and archives only the immutable candidate snapshot.'
