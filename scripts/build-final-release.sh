#!/usr/bin/env bash
set -euo pipefail
RESULT=${1:-docs/LIVE_SMOKE_RESULT.md}
CANDIDATE_SHA=${2:-f51e4ba53753dade3bd3f9a64e2b3c50ca05d691}
VERSION=$(node -e "const m=require('./extension/manifest.json');process.stdout.write(m.version)")
OUT=${3:-parrot-v${VERSION}.zip}
NOTES=${4:-docs/RELEASE_NOTES_DRAFT.md}
RELEASE_SHA=$(git rev-parse HEAD)
PROVENANCE="$OUT.provenance.txt"

case "$OUT" in
  *.zip) ;;
  *) echo "FAIL: release output must end in .zip" >&2; exit 1 ;;
esac

# Fail before touching release outputs when the working tree contains product edits.
# M6 validates committed candidate bytes, not uncommitted extension changes.
if ! git diff --quiet -- extension || ! git diff --cached --quiet -- extension || [ -n "$(git ls-files --others --exclude-standard -- extension)" ]; then
  echo "FAIL: working tree contains uncommitted/untracked extension changes; commit a new candidate and repeat M6" >&2
  git status --short -- extension >&2
  exit 1
fi

echo "Verifying live browser evidence for candidate $CANDIDATE_SHA"
GATE_OUTPUT=$(node scripts/verify-live-smoke-result.mjs "$RESULT" "$CANDIDATE_SHA")
echo "$GATE_OUTPUT"
LIVE_RESULT_SHA256=$(sha256sum "$RESULT" | awk '{print $1}')

# M6 validates the candidate extension tree, not arbitrary later product edits.
# Docs/release-tooling may advance after M5, but any extension/ change requires a
# new candidate and a fresh M6 run rather than silently shipping untested code.
if ! git diff --quiet "$CANDIDATE_SHA" -- extension; then
  echo "FAIL: extension/ differs from M6 candidate $CANDIDATE_SHA; create a new candidate and repeat M6" >&2
  git diff --name-only "$CANDIDATE_SHA" -- extension >&2
  exit 1
fi
echo "PASS: release extension tree is identical to M6 candidate $CANDIDATE_SHA (release repo $RELEASE_SHA)"

if grep -q 'LIMITATION: S9/S10 NOT_OBSERVED' <<<"$GATE_OUTPUT"; then
  if [ ! -f "$NOTES" ]; then
    echo "FAIL: live evidence contains NOT_OBSERVED S9/S10 but release notes file is missing: $NOTES" >&2
    exit 1
  fi
  if ! grep -Eiq 'S9|ambigu' "$NOTES"; then
    echo "FAIL: release notes do not describe the S9/ambiguity limitation" >&2
    exit 1
  fi
  if ! grep -Eiq 'S10|cooldown|rate-limit' "$NOTES"; then
    echo "FAIL: release notes do not describe the S10/cooldown limitation" >&2
    exit 1
  fi
  echo 'PASS: NOT_OBSERVED live limitations are represented in release notes.'
fi
node scripts/verify-repo.mjs
rm -f "$OUT" "$OUT.sha256" "$OUT.files.txt" "$PROVENANCE"
(cd extension && zip -X -r "../$OUT" . -x '*.DS_Store')
unzip -t "$OUT"
unzip -Z1 "$OUT" | LC_ALL=C sort > "$OUT.files.txt"
sha256sum "$OUT" | tee "$OUT.sha256"
unzip -p "$OUT" manifest.json | grep -F "\"version\": \"$VERSION\""
printf 'candidate_sha=%s\nrelease_repo_sha=%s\nlive_result_sha256=%s\n' "$CANDIDATE_SHA" "$RELEASE_SHA" "$LIVE_RESULT_SHA256" > "$PROVENANCE"
echo "PASS: final release artifact built only after candidate-bound authenticated live evidence, candidate-tree identity, and limitation gates."
