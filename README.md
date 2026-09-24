# Parrot / 앵무새

ChatGPT 대화를 반복 실행하고 `COMPLETE`, `WAKE`, `MESSAGE` 신호를 처리하는 로컬 Chrome Extension입니다. 실제 provider adapter는 현재 ChatGPT만 지원합니다. Claude / Gemini / Grok은 adapter boundary만 유지하며 아직 구현하지 않습니다.

## Status
`v0.8.7` candidate exists, but it is **NON-RELEASE** until the real Chromium + authenticated ChatGPT M6 smoke gate passes. Static CI is not a browser-compatibility claim.

## Candidate install for M6 testing
1. Use the candidate bound to source commit `f51e4ba53753dade3bd3f9a64e2b3c50ca05d691` / Actions run `35979821480`.
2. Extract it so `manifest.json` is directly inside the selected extension directory.
3. In Chromium/Chrome extension management, enable Developer mode and choose **Load unpacked**.
4. Use an authenticated real ChatGPT profile, open the popup, register/configure conversation targets, and use Dashboard for fleet control.
5. Execute `docs/LIVE_SMOKE_CHECKLIST.md`; record only structural evidence in `docs/LIVE_SMOKE_RESULT_TEMPLATE.md`, never chat prose, account identity, cookies, tokens, or credentials. Authentication must be explicitly confirmed using non-secret structural UI evidence; a ChatGPT URL alone is insufficient.
6. Any observed failure blocks release and reopens the affected earlier milestone.

## Capabilities
- Worker identity A..Z, AA... with no fixed five-worker limit.
- Dashboard search/filter/10·25·50 pagination and direct exact-target Start/Stop/Open while Dashboard remains active.
- Structural fleet attention states including discarded/frozen/error/cooldown; no semantic chat-prose status parsing.
- Strong send receipt requires new user-message DOM count or assistant generation start, not click/composer change alone.
- Unconfirmed routed sends become durable `ambiguous`, automatic resend is fenced, Dashboard Retry/Resolve is explicit.
- Ambiguity receipt persists to bounded local outbox before background notification.
- Structural cooldown backpressure: rate-limit 10→20→40→60 minutes; transient 2→5→10→20 minutes.
- Token-fenced single effective runner across startup/reload, storage reconciliation, explicit PARROT_START, and mode transitions.
- Configurable onboarding/completion/WAKE/MESSAGE templates; compact popup with overlay editors.

## Protocol
```text
COMPLETE
https://parrot.invalid/complete/<runId>

WAKE
https://parrot.invalid/wake/<sourceRunId>/<eventId>?to=<targetRouteId>

MESSAGE
https://parrot.invalid/message/<sourceRunId>/<eventId>?to=<targetRouteId>&ref=<reference>
```
`MESSAGE.ref` is an explicit reference such as a GitHub URL/document ID. Parrot does not fetch or semantically read surrounding chat prose.

## Repository verification
Run from repository root:
```text
node scripts/test-route-state.mjs
node scripts/test-route-queue.mjs
node scripts/test-signal-protocol.mjs
node scripts/test-prompt-compose.mjs
node scripts/test-repeat-policy.mjs
node scripts/test-runner-policy.mjs
node scripts/test-runner-registry.mjs
node scripts/test-dashboard-controls.mjs
node scripts/test-dashboard-fleet.mjs
node scripts/test-popup-ux-contract.mjs
node scripts/test-chatgpt-adapter-structure.mjs
node scripts/test-cooldown-storage-contract.mjs
node scripts/test-live-smoke-verifier.mjs
node scripts/validate-contracts.mjs
node scripts/validate-v087-integration.mjs
node scripts/verify-repo.mjs
```
GitHub Actions `Route State Contract` runs these gates and builds a versioned NON-RELEASE candidate evidence artifact after they pass. The candidate build uses deterministic `zip -X`, archive integrity testing, sorted file listing, SHA-256 generation, and manifest-version verification.

## Final-release provenance
M6 is bound to exact candidate source `f51e4ba53753dade3bd3f9a64e2b3c50ca05d691`. Documentation and release-tooling may advance after that candidate, but the shipped `extension/` tree must remain unchanged from the M6 candidate. `scripts/build-final-release.sh <live-result> <candidate-sha>` verifies the live result against that candidate and fails closed if the current extension tree differs. Any post-candidate extension change requires a new candidate and fresh M6 validation. The final build emits candidate SHA and release-repository SHA provenance alongside the ZIP.

## Reconstruction provenance
Exact later v0.8.6 runtime bytes were not recovered, so v0.8.7 is a deliberate reconstruction from recovered behavior plus verified contracts, not a byte-exact v0.8.6 claim. Recovered popup numeric clamp/default regressions were repaired and guarded.

## Known limitations before release
- Claude/Gemini/Grok provider implementations are deferred.
- Real behavior depends on current ChatGPT DOM/control structure; M6 must validate the exact candidate on an authenticated real ChatGPT session.
- Ambiguity and genuine rate-limit states may not be safely/naturally observable during smoke. If not observed, they remain explicit release limitations rather than being called PASS.
- Candidate Actions artifacts are temporary test/evidence bundles, not final release artifacts.

## Development state
`docs/MILESTONES.md` is the single work/progress authority; no active BATON layer. `docs/DEVELOPMENT_CHECKPOINT.md` is durable summary/evidence; `docs/DEVELOPMENT_LOG.md` is historical evidence only.

## Principles
ChatGPT-first; dashboard-first management; compact popup; reliability/simplification/recoverability before feature growth; exact runId COMPLETE; structural WAKE/MESSAGE; no semantic chat reading; authoritative references before material UX/API/architecture changes.
