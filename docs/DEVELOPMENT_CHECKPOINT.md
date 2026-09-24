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
- Release-tooling TOCTOU is closed at the delegated-helper boundary: `build-final-release.sh` materializes `scripts/` plus selected tracked release notes from `RELEASE_SHA` and runs downstream helpers through frozen `TOOL_ROOT`; Route State Contract run `36001195337` SUCCESS covered that path. A deeper escape was found on audit: frozen `verify-candidate-live-evidence.sh` invoked `node scripts/verify-live-smoke-result.mjs`, resolving the nested Node verifier from mutable process CWD rather than the frozen helper directory. It now resolves the verifier relative to `$0`. `test-release-tooling-snapshot.sh` mutates the worktree Node verifier to unconditional success after snapshot creation and requires deliberately invalid evidence to remain rejected by the frozen helper. Hardening commits `fa582618c7963bf1993d78c6fc8fa14f9f590547` and `e51919668f92d633af4637e9d830720b3645c550`; Route State Contract run `36003597086` was started for the executable regression and must be checked before claiming SUCCESS.
- Readiness consumption fails closed after publication too. Route State Contract run `36001689948` SUCCESS confirmed post-publish component mutation and duplicate-marker identity are rejected. `verify-release-ready.sh` also validates ZIP integrity, recomputes/sorts the ZIP member list against `.files.txt`, requires a single checksum row, and requires its filename to identify the release artifact. Route State Contract run `36002087686` SUCCESS passed self-consistent forged-sidecar regressions plus the full suite.
- Concurrent publication is fail-closed per output path. `build-final-release.sh` acquires atomic `<OUT>.build.lock`; a losing builder cannot mutate active output. Route State Contract run `36002946184` SUCCESS passed non-interference and lock-release regressions.
- Provenance identity is checked at consumption. `verify-release-ready.sh` requires exact M5/M6 candidate identity, one value per identity field, full 40-hex release repository identity, 64-hex live-result SHA256, and artifact digest equality. Route State Contract run `36003113219` SUCCESS passed self-consistent wrong-candidate/malformed-release-SHA regressions.
- Product `extension/` bytes were not edited by this hardening run.

## Remaining path
1. First check Route State Contract run `36003597086`. If it fails, fix the executable nested-tooling regression rather than weakening it.
2. Then audit a still-open concrete provenance boundary: `live_result_sha256` currently names ephemeral evidence bytes but the final release bundle does not persist those bytes, so a later consumer cannot independently re-hash/re-run the live-evidence verifier from the release evidence alone. Decide whether to persist a candidate-bound live-result evidence sidecar and bind it into `.ready`; implement only if the durable-verification benefit justifies the extra release component. Also assess whether `release_repo_sha` needs stronger consumer-time semantic binding than format validation.
3. Obtain a supported authenticated interactive Chrome+ChatGPT surface and execute M6-C2 onward against exact candidate.
4. After M6 PASS, re-verify candidate identity, freeze release-repository SHA, run the final builder, persist release evidence, verify readiness at consumption, and close M7 only when every criterion passes.

## Scope
ChatGPT-first. Reliability/simplification/recoverability before feature expansion. Claude/Gemini/Grok remain deferred.
