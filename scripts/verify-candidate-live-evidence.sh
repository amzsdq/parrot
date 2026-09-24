#!/usr/bin/env bash
set -euo pipefail

RESULT=${1:?usage: verify-candidate-live-evidence.sh RESULT CANDIDATE_SHA}
CANDIDATE_SHA=${2:?usage: verify-candidate-live-evidence.sh RESULT CANDIDATE_SHA}
SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)

# Resolve nested verifier code relative to this helper, not the mutable caller
# working directory. When the final builder runs this helper from frozen
# TOOL_ROOT, the Node verifier therefore comes from the same RELEASE_SHA
# tooling snapshot rather than escaping back into worktree scripts/.
node "$SCRIPT_DIR/verify-live-smoke-result.mjs" "$RESULT" "$CANDIDATE_SHA"
