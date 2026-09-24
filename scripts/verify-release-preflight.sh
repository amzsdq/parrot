#!/usr/bin/env bash
set -euo pipefail

CANDIDATE_SHA=${1:?candidate SHA required}

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
