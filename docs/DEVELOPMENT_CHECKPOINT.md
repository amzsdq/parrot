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
- `scripts/verify-live-smoke-result.mjs` requires exact candidate binding, authenticated-session structural provenance, real ChatGPT target URLs, ISO UTC timestamps, exactly one S1..S11 row, required evidence, decision consistency, and explicit NOT_OBSERVED limitations. Duplicate rows are rejected.

## M7 preparation while authenticated browser evidence is pending
- Release preflight, limitation notes, stale-output cleanup, candidate-bound live verification, archive integrity/checksum, provenance writing, repository verification, tracked tooling/notes verification, and builder-level failure propagation are shared executable production/test boundaries.
- Final preflight is bound to exact M5/M6 candidate `f51e4ba53753dade3bd3f9a64e2b3c50ca05d691`; caller-selected alternatives are rejected. Selected release notes must be tracked by `RELEASE_SHA`. Builder invalidates stale ZIP/checksum/file-list/provenance before gates and removes partial publishable-looking output on every later failure. Tracked release tooling/notes must match `RELEASE_SHA`.
- Live evidence TOCTOU is closed: builder freezes caller-owned live-result bytes once and sends the same immutable snapshot to candidate-bound verification and provenance hashing. Provenance records candidate SHA, release-repository SHA, live-result SHA256, and release ZIP SHA256. Route State Contract run `35999409451` SUCCESS confirms this boundary.
- Extension TOCTOU between preflight and archive is closed: `scripts/materialize-release-candidate.sh` materializes `extension/` directly from the exact candidate commit via `git archive`; `build-final-release.sh` derives VERSION from and archives that immutable snapshot instead of re-reading working-tree `extension/`. `scripts/test-release-candidate-snapshot.sh` mutates working-tree `extension/manifest.json` after candidate selection and proves the materialized tree remains committed candidate bytes; reused destinations and unknown commits are rejected. Initial run `35999838425` exposed only a stale structural-test expectation; after aligning that boundary contract, Route State Contract run `35999918438` completed all release snapshot, boundary, orchestration, repository, candidate ZIP and upload steps successfully.
- Independent compare exact candidate `f51e4ba...` -> hardening head `86493f71b941748572a4810fed8e14a49f6570d9` is 143 commits ahead with zero changed `extension/` files. Product bytes remain identical to M5 candidate.

## Remaining path
1. Continue auditing only material provenance/publishable-state hazards beyond exact candidate identity, committed tooling/notes, immutable live evidence, immutable candidate archive input, stale-output cleanup, and archive/provenance failure cleanup. Avoid low-value source-pattern checks.
2. Obtain a supported authenticated interactive Chrome+ChatGPT surface and execute M6-C2 onward against exact candidate.
3. After M6 PASS, re-verify candidate identity, freeze release-repository SHA, run the final builder, persist ZIP/file-list/hash/provenance evidence, and close M7 only when every criterion passes.

## Scope
ChatGPT-first. Reliability/simplification/recoverability before feature expansion. Claude/Gemini/Grok remain deferred.