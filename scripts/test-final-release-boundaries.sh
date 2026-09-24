#!/usr/bin/env bash
set -euo pipefail

BUILDER=scripts/build-final-release.sh
PREFLIGHT=scripts/verify-release-preflight.sh

require_pattern() {
  local file=$1
  local description=$2
  local pattern=$3
  grep -Eq "$pattern" "$file" || {
    echo "FAIL: $file lost $description gate" >&2
    exit 1
  }
}

# Dirty-tree and candidate identity are executable-tested in test-release-preflight.sh.
# This structural check only ensures production builder still delegates to that shared gate.
require_pattern "$BUILDER" 'shared release preflight invocation' 'verify-release-preflight\.sh "\$CANDIDATE_SHA"'
require_pattern "$PREFLIGHT" 'unstaged extension dirty-tree' 'git diff --quiet -- extension'
require_pattern "$PREFLIGHT" 'staged extension dirty-tree' 'git diff --cached --quiet -- extension'
require_pattern "$PREFLIGHT" 'untracked extension dirty-tree' 'git ls-files --others --exclude-standard -- extension'
require_pattern "$PREFLIGHT" 'candidate-tree identity' 'git diff --quiet "\$CANDIDATE_SHA" -- extension'
require_pattern "$BUILDER" 'candidate-bound live evidence' 'verify-live-smoke-result\.mjs "\$RESULT" "\$CANDIDATE_SHA"'
require_pattern "$BUILDER" 'release limitation gate' 'verify-release-limitations\.sh "\$GATE_OUTPUT_FILE" "\$NOTES"'
require_pattern "$BUILDER" 'output cleanup before build' 'rm -f "\$OUT" "\$OUT\.sha256" "\$OUT\.files\.txt" "\$PROVENANCE"'
require_pattern "$BUILDER" 'archive integrity check' 'unzip -t "\$OUT"'
require_pattern "$BUILDER" 'artifact checksum' 'sha256sum "\$OUT"'
require_pattern "$BUILDER" 'provenance candidate SHA' 'candidate_sha=%s'
require_pattern "$BUILDER" 'provenance release SHA' 'release_repo_sha=%s'
require_pattern "$BUILDER" 'provenance live-result checksum' 'live_result_sha256=%s'

echo 'PASS: final release builder delegates shared preflight and retains live-evidence, output-integrity, and provenance fail-closed boundaries.'
