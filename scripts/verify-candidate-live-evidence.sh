#!/usr/bin/env bash
set -euo pipefail

RESULT=${1:?usage: verify-candidate-live-evidence.sh RESULT CANDIDATE_SHA}
CANDIDATE_SHA=${2:?usage: verify-candidate-live-evidence.sh RESULT CANDIDATE_SHA}

node scripts/verify-live-smoke-result.mjs "$RESULT" "$CANDIDATE_SHA"
