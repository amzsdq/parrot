# Parrot development checkpoint

Status: CONTINUE
Current line: v0.8.7-reconstruction
Current milestone: M6 — Real Chromium + ChatGPT validation / VERIFY
Current criterion: M6-C2

## Execution model
`docs/MILESTONES.md` is single work/progress authority; no BATON. `docs/PARROT_RELAY_GUIDE.md` describes the self-renewing execution convention. M6 remains fail-closed: authenticated real ChatGPT evidence is required and static/headless evidence never substitutes.

## Completed milestones
M0 scope/relay DONE. M1 routing/delivery DONE (run 35978969555). M3 dashboard/fleet static UX DONE. M4 popup/templates/cooldown static UX DONE. M5 rebuildable candidate DONE: exact candidate source `f51e4ba53753dade3bd3f9a64e2b3c50ca05d691`; run `35979821480` SUCCESS; NON-RELEASE artifact `10798948865`; Actions artifact digest `sha256:ca6ece70268ebf304cdab16260515911eeea45b6b67d44d981238c93bfdb251c`.

## M6 evidence
- M6-C1 PASS: real Google Chrome loaded exact M5 candidate unpacked extension/dashboard; run `35980470638` SUCCESS.
- M6-C2 remains UNVERIFIED. Existing headless attempts reached an unauthenticated Cloudflare surface and cannot satisfy the authenticated interactive ChatGPT requirement. Do not repeat that path unchanged.
- C2 onward require a supported authenticated interactive Chrome+ChatGPT surface. Checklist/result: `docs/LIVE_SMOKE_CHECKLIST.md`, `docs/LIVE_SMOKE_RESULT_TEMPLATE.md`.
- `scripts/verify-live-smoke-result.mjs` requires exact candidate binding, authenticated-session structural provenance, real ChatGPT target URLs, ISO UTC timestamps, exactly one S1..S11 row, required evidence, decision consistency, and explicit NOT_OBSERVED limitations. Duplicate rows are rejected.

## M7 preparation while authenticated browser evidence is pending
- Release preflight, limitation notes, stale-output cleanup, candidate-bound live verification, archive integrity/checksum, provenance writing, repository verification, tracked tooling/notes verification, and builder-level failure propagation are shared executable production/test boundaries.
- Final preflight is bound to exact M5/M6 candidate `f51e4ba53753dade3bd3f9a64e2b3c50ca05d691`; caller-selected alternatives are rejected. Selected release notes must be tracked by `RELEASE_SHA`. Builder invalidates stale ZIP/checksum/file-list/provenance before gates and removes partial publishable-looking output on every later failure.
- Live evidence TOCTOU is closed: builder freezes caller-owned live-result bytes once and sends the same immutable snapshot to candidate-bound verification and provenance hashing. Provenance records candidate SHA, release-repository SHA, live-result SHA256, and release ZIP SHA256. Route State Contract run `35999409451` SUCCESS confirms this boundary.
- Extension TOCTOU between preflight and archive is closed: `scripts/materialize-release-candidate.sh` materializes `extension/` directly from the exact candidate commit via `git archive`; VERSION and ZIP come only from that immutable snapshot. Route State Contract run `35999918438` SUCCESS confirms this boundary.
- Publishability is explicit: `scripts/publish-release-ready.sh` writes `<release>.ready` only after ZIP/checksum/file-list/provenance are complete and mutually bound. Cleanup invalidates readiness first. Route State Contract run `36000634054` SUCCESS confirmed the readiness regression and full orchestration.
- Release-tooling TOCTOU is closed: `build-final-release.sh` materializes `scripts/` plus selected tracked release notes from `RELEASE_SHA` before delegated gates, then executes every downstream helper through frozen `TOOL_ROOT`; no caller-controlled worktree-tooling bypass exists. `scripts/test-release-tooling-snapshot.sh` mutates a helper after freeze and proves the frozen copy remains byte-identical to `RELEASE_SHA`. Full orchestration commits its executable stub fixtures so the production snapshot path is exercised. Initial run `36001049680` exposed ERR-trap loss through the new `run_tool` function; `set -E` restored fail-closed cleanup propagation. Final Route State Contract run `36001195337` SUCCESS passed tooling snapshot, worktree, all release gates, full orchestration, repo validation, candidate ZIP build/upload, and post-job cleanup.
- Readiness consumption fails closed after publication too. Route State Contract run `36001689948` SUCCESS confirmed post-publish component mutation and duplicate-marker identity are rejected. A further concrete cross-boundary gap was found: hash-consistent `.ready` plus sidecars did not prove that the file-list actually described ZIP contents or that the checksum sidecar named the release artifact. `verify-release-ready.sh` now validates ZIP integrity, recomputes/sorts the ZIP member list and compares it byte-for-byte to `.files.txt`, requires a single checksum row, and requires its filename to identify the release artifact. `test-release-ready.sh` uses a real ZIP and constructs self-consistent forged file-list/checksum bundles that must still be rejected. Hardening commits `d76fd922b5bb2baab4d7a8e48757f9921211808f` and `c8f8f3ec3894ef237d80c318df3a0e3346c44c32`; Route State Contract run `36002087686` SUCCESS passed the semantic-readiness regression plus the full suite and candidate ZIP build/upload.
- Independent compare from exact candidate through checkpoint head `6d35bf343fe0797cf5affd4e38e82f1e6262a74a` is 169 commits ahead with no `extension/` changed files. Product bytes remain unchanged.

## Remaining path
1. Audit only new concrete cross-boundary identity/publication failure modes; candidate/live/tooling/readiness byte and semantic binding are now covered. Do not add source-pattern checks or duplicate already-proven boundaries without a demonstrated failure mode.
2. Obtain a supported authenticated interactive Chrome+ChatGPT surface and execute M6-C2 onward against exact candidate.
3. After M6 PASS, re-verify candidate identity, freeze release-repository SHA, run the final builder, persist ZIP/file-list/hash/provenance/readiness evidence, verify readiness at consumption, and close M7 only when every criterion passes.

## Scope
ChatGPT-first. Reliability/simplification/recoverability before feature expansion. Claude/Gemini/Grok remain deferred.
