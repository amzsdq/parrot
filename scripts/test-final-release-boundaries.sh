#!/usr/bin/env bash
set -euo pipefail

BUILDER=scripts/build-final-release.sh

require_pattern() {
  local description=$1
  local pattern=$2
  grep -Eq "$pattern" "$BUILDER" || {
    echo "FAIL: final builder lost $description gate" >&2
    exit 1
  }
}

# These are release-critical fail-closed boundaries. Keep them explicit and
# regression-tested even while authenticated live evidence is unavailable.
require_pattern 'unstaged extension dirty-tree' 'git diff --quiet -- extension'
require_pattern 'staged extension dirty-tree' 'git diff --cached --quiet -- extension'
require_pattern 'untracked extension dirty-tree' 'git ls-files --others --exclude-standard -- extension'
require_pattern 'candidate-tree identity' 'git diff --quiet "\$CANDIDATE_SHA" -- extension'
require_pattern 'candidate-bound live evidence' 'verify-live-smoke-result\.mjs "\$RESULT" "\$CANDIDATE_SHA"'
require_pattern 'release limitation gate' 'verify-release-limitations\.sh "\$GATE_OUTPUT_FILE" "\$NOTES"'
require_pattern 'output cleanup before build' 'rm -f "\$OUT" "\$OUT\.sha256" "\$OUT\.files\.txt" "\$PROVENANCE"'
require_pattern 'archive integrity check' 'unzip -t "\$OUT"'
require_pattern 'artifact checksum' 'sha256sum "\$OUT"'
require_pattern 'provenance candidate SHA' 'candidate_sha=%s'
require_pattern 'provenance release SHA' 'release_repo_sha=%s'
require_pattern 'provenance live-result checksum' 'live_result_sha256=%s'

echo 'PASS: final release builder retains dirty-tree, candidate-drift, live-evidence, output-integrity, and provenance fail-closed boundaries.'
