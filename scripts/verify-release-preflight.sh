#!/usr/bin/env bash
set -euo pipefail

CANDIDATE_SHA=${1:?candidate SHA required}
EXPECTED_CANDIDATE_SHA=f51e4ba53753dade3bd3f9a64e2b3c50ca05d691

# M6 evidence is bound to one exact candidate. Accepting an arbitrary caller-
# supplied commit here would let a final build describe a different candidate
# as if it were the validated M5/M6 artifact.
if [[ "$CANDIDATE_SHA" != "$EXPECTED_CANDIDATE_SHA" ]]; then
  echo "FAIL: final release candidate must be exact M5/M6 candidate $EXPECTED_CANDIDATE_SHA (got $CANDIDATE_SHA)" >&2
  exit 1
fi

if ! git diff --quiet -- extension || ! git diff --cached --quiet -- extension || [ -n "$(git ls-files --others --exclude-standard -- extension)" ]; then
  echo "FAIL: working tree contains uncommitted/untracked extension changes; commit a new candidate and repeat M6" >&2
  git status --short -- extension >&2
  exit 1
fi

if ! git diff --quiet "$CANDIDATE_SHA" -- extension; then
  echo "FAIL: extension/ differs from M6 candidate $CANDIDATE_SHA; create a new candidate and repeat M6" >&2
  git diff --name-only "$CANDIDATE_SHA" -- extension >&2
  exit 1
fi

echo "PASS: release extension tree is clean and identical to M6 candidate $CANDIDATE_SHA"
