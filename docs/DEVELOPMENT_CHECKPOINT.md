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
- Final preflight is bound to exact M5/M6 candidate `f51e4ba53753dade3bd3f9a64e2b3c50ca05d691`; caller-selected alternatives are rejected. Selected release notes must be tracked by `RELEASE_SHA`. Builder invalidates stale ZIP/checksum/file-list/provenance before gates and removes partial publishable-looking output on every later failure. Tracked release tooling/notes must match `RELEASE_SHA`.
- Live evidence TOCTOU is closed: builder freezes caller-owned live-result bytes once and sends the same immutable snapshot to candidate-bound verification and provenance hashing. Provenance records candidate SHA, release-repository SHA, live-result SHA256, and release ZIP SHA256. Route State Contract run `35999409451` SUCCESS confirms this boundary.
- Extension TOCTOU between preflight and archive is closed: `scripts/materialize-release-candidate.sh` materializes `extension/` directly from the exact candidate commit via `git archive`; `build-final-release.sh` derives VERSION from and archives that immutable snapshot instead of re-reading working-tree `extension/`. Route State Contract run `35999918438` SUCCESS confirms the snapshot boundary and regression.
- Publishability is now explicit rather than inferred from the presence of ZIP/sidecars. `scripts/publish-release-ready.sh` writes `<release>.ready` only after ZIP, checksum, file-list, and provenance all exist, the ZIP checksum matches, and provenance binds the same artifact digest. The marker hashes all four release components and is atomically renamed into place last. Cleanup removes a stale `.ready` before any other stale output; every builder failure removes it. `scripts/test-release-ready.sh`, cleanup regression, and full builder orchestration exercise success, tamper rejection, stale invalidation, and publish-gate failure propagation. Route State Contract run `36000634054` was queued for head `dd2534254f66d07c9b132739e148601e646f2635` when this checkpoint was written; confirm it before promoting this boundary as verified.
- Product `extension/` bytes were not edited by this hardening work.

## Remaining path
1. Confirm Route State Contract run `36000634054`; if it fails, repair the exact executable regression failure.
2. Continue auditing only material provenance/publishable-state hazards. A high-value next target is tooling TOCTOU: `verify-release-worktree.sh` proves scripts match `RELEASE_SHA` once, but later helper invocations still execute mutable working-tree paths. Determine whether release tooling should be materialized/executed from `RELEASE_SHA` or otherwise frozen before gates. Avoid low-value source-pattern checks.
3. Obtain a supported authenticated interactive Chrome+ChatGPT surface and execute M6-C2 onward against exact candidate.
4. After M6 PASS, re-verify candidate identity, freeze release-repository SHA, run the final builder, persist ZIP/file-list/hash/provenance/readiness evidence, and close M7 only when every criterion passes.

## Scope
ChatGPT-first. Reliability/simplification/recoverability before feature expansion. Claude/Gemini/Grok remain deferred.
