# Parrot development checkpoint

Status: CONTINUE
Current line: v0.8.7-reconstruction
Current milestone: M6 — Real Chromium + ChatGPT validation / VERIFY
Current criterion: M6-C2

## Execution model
`docs/MILESTONES.md` is single work/progress authority; no BATON. `docs/PARROT_RELAY_GUIDE.md` describes the self-renewing execution convention. M6 remains fail-closed: authenticated real ChatGPT evidence is required and static/headless evidence never substitutes.

## Completed milestones
M0 scope/relay DONE. M1 routing/delivery DONE. M2 runner lifecycle/reload DONE (run 35978969555). M3 dashboard/fleet static UX DONE. M4 popup/templates/cooldown static UX DONE. M5 rebuildable candidate DONE: exact candidate source `f51e4ba53753dade3bd3f9a64e2b3c50ca05d691`; run `35979821480` SUCCESS; NON-RELEASE artifact `10798948865`; Actions artifact digest `sha256:ca6ece70268ebf304cdab16260515911eeea45b6b67d44d981238c93bfdb251c`.

## M6 evidence
- M6-C1 PASS: real Google Chrome loaded exact M5 candidate unpacked extension/dashboard; run `35980470638` SUCCESS.
- M6-C2 remains UNVERIFIED. Existing headless attempts reached an unauthenticated Cloudflare surface and cannot satisfy the authenticated interactive ChatGPT requirement. Do not repeat that path unchanged.
- C2 onward require a supported authenticated interactive Chrome+ChatGPT surface. Checklist/result: `docs/LIVE_SMOKE_CHECKLIST.md`, `docs/LIVE_SMOKE_RESULT_TEMPLATE.md`.
- `scripts/verify-live-smoke-result.mjs` requires exact candidate binding, authenticated-session structural provenance, real ChatGPT target URLs, ISO UTC timestamps, exactly one S1..S11 row, required evidence, decision consistency, and explicit NOT_OBSERVED limitations. Duplicate rows are rejected. Exact-head duplicate-row hardening run `35992843454` succeeded.

## M7 preparation while authenticated browser evidence is pending
- Limitation-note regression is CI-confirmed in run `35993385261`; final-builder structural boundary regression is CI-confirmed in run `35993671018`.
- Release preflight is executable shared production/test logic. `scripts/verify-release-preflight.sh` rejects unstaged, staged, or untracked `extension/` changes and committed candidate-tree drift; `scripts/build-final-release.sh` calls the same preflight.
- `scripts/test-release-preflight.sh` exercises clean-pass plus unstaged, staged, untracked, and committed candidate-drift rejection in an isolated clone.
- Full-history checkout repair is confirmed: Route State Contract run `35994722114` SUCCESS, including `test-release-preflight.sh` and all existing contract tests.
- Output cleanup is now shared executable production/test logic. `scripts/prepare-release-output.sh` validates `.zip` output and removes stale ZIP, checksum, file-list, and provenance before asserting those paths are absent. `build-final-release.sh` delegates to it.
- `scripts/test-release-output-cleanup.sh` creates all four stale outputs, executes the production cleanup, verifies they are gone, and verifies non-ZIP output is rejected. Route State Contract was updated to syntax-check and execute this regression.
- Integration head for the cleanup CI is `d0a04e83570aef7d9cce8b1bb1fb6e9ce006079a`; Route State Contract run `35995112380` is currently in progress. Do not claim this new boundary CI-confirmed until it succeeds.
- No product `extension/` bytes were changed by these release-hardening commits.

## Remaining path
1. Confirm Route State Contract run `35995112380`; repair any exact failure and rerun if needed.
2. If successful, replace the next source-pattern-only release boundary with executable behavior, prioritizing provenance contents/candidate-bound invocation rather than duplicating already executable preflight/cleanup coverage.
3. Obtain a supported authenticated interactive Chrome+ChatGPT surface and execute M6-C2 onward against exact candidate.
4. After M6 PASS, re-verify candidate tree identity, freeze release-repository SHA, run the final builder, persist ZIP/file-list/hash/provenance evidence, and close M7 only when every criterion passes.

## Scope
ChatGPT-first. Reliability/simplification/recoverability before feature expansion. Claude/Gemini/Grok remain deferred.
