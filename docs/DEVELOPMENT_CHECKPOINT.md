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
- Release-tooling TOCTOU is now closed in production: `build-final-release.sh` materializes `scripts/` plus selected tracked release notes from `RELEASE_SHA` before delegated gates, then executes every downstream helper through frozen `TOOL_ROOT`. There is no caller-controlled worktree-tooling bypass. `scripts/test-release-tooling-snapshot.sh` mutates a worktree helper after freeze and proves the frozen helper remains byte-identical to `RELEASE_SHA`; full orchestration now commits its stub fixtures so it exercises the same frozen-tooling path. Initial run `36001049680` exposed ERR-trap loss through the new `run_tool` function; `set -E` fixed cleanup propagation. Run `36001195337` has passed tooling snapshot, worktree, all release gates, full orchestration, repo validation, and candidate ZIP build; only final artifact-upload/post-job completion was still in progress at checkpoint write time.
- Product `extension/` bytes were not edited by this hardening work.

## Remaining path
1. Confirm Route State Contract run `36001195337` reaches final SUCCESS; if final upload/post-job fails, repair that exact failure without weakening the frozen-tooling boundary.
2. Continue auditing only material provenance/publishable-state hazards. Do not add low-value source-pattern checks. Candidate tree, live evidence, release tooling/notes, artifact/live hashes, stale-output cleanup, and explicit readiness are now frozen/bound; prioritize any remaining cross-boundary identity or publication race with a concrete failure mode.
3. Obtain a supported authenticated interactive Chrome+ChatGPT surface and execute M6-C2 onward against exact candidate.
4. After M6 PASS, re-verify candidate identity, freeze release-repository SHA, run the final builder, persist ZIP/file-list/hash/provenance/readiness evidence, and close M7 only when every criterion passes.

## Scope
ChatGPT-first. Reliability/simplification/recoverability before feature expansion. Claude/Gemini/Grok remain deferred.
