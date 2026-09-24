# Parrot / 앵무새

ChatGPT 대화를 반복 실행하고 `COMPLETE`, `WAKE`, `MESSAGE` 신호를 처리하는 로컬 Chrome Extension입니다. 현재 실제 provider adapter는 ChatGPT만 지원합니다. Claude / Gemini / Grok은 adapter boundary만 유지하며 아직 구현하지 않습니다.

## Current version

`v0.8.7` reconstruction in progress. Static/repository gates are not a release claim; real Chromium + ChatGPT smoke remains required before release.

## Current capabilities

- Worker identity: `A`, `B`, `C` … `Z`, `AA` …; fixed five-worker limit 없음.
- Dashboard is an extension control plane independent of the active ChatGPT tab. It can search/filter/page workers and directly Start/Stop an exact matching open ChatGPT worker without activating that tab; `열기` remains an explicit separate action.
- Dashboard fleet model supports 10/25/50 pagination and structural attention filtering; discarded/frozen tabs are distinct structural states.
- Live status never semantically reads chat prose.
- Normal repeat sends and WAKE/MESSAGE delivery require a strong receipt: new user-message DOM count or assistant generation start, not merely click/composer change.
- Unconfirmed routed sends become durable `ambiguous`, are fenced from automatic resend, and expose explicit Dashboard Retry/Resolve actions.
- Ambiguity receipt is persisted to bounded `chrome.storage.local` outbox before background notification.
- `delivered` and manually `resolved` routes are terminal history.
- Structural cooldown classification never reads assistant/user prose. Persisted cooldown deadlines gate both repeat runners and routed sends.
- Cooldown ladder: rate-limit 10→20→40→60 minutes; transient 2→5→10→20 minutes. Targets may disable cooldown handling.
- Runner ownership is fenced by a token registry: startup/reload, storage reconciliation, explicit `PARROT_START`, and mode transitions cannot retain two effective runners for one target.

## Protocol

```text
COMPLETE
https://parrot.invalid/complete/<runId>

WAKE
https://parrot.invalid/wake/<sourceRunId>/<eventId>?to=<targetRouteId>

MESSAGE
https://parrot.invalid/message/<sourceRunId>/<eventId>?to=<targetRouteId>&ref=<reference>
```

`MESSAGE.ref` is an explicit reference such as a GitHub URL or document ID. Parrot does not fetch or semantically read surrounding chat prose.

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
node scripts/validate-contracts.mjs
node scripts/validate-v087-integration.mjs
node scripts/verify-repo.mjs
```

GitHub Actions `Route State Contract` runs these production integration/rebuildability gates. Contract/static success and real-browser success are intentionally separate claims.

## v0.8.7 reconstruction status

Exact v0.8.6 `background.js`, `content.js`, `dashboard.js` bytes were not recovered, so this runtime is not claimed byte-exact v0.8.6. The repository reconstructs v0.8.7 from recovered behavior plus later verified contracts.

Current production slice:
- classic MV3 background with route/signal/repeat primitives;
- pending-only routed delivery plus structural cooldown backpressure;
- durable ambiguity outbox and explicit Retry/Resolve;
- strong structural send receipt in `content.js`;
- response/interval runner lifecycle with exact-URL auto-arm, delay/sendImmediately policy, and token-fenced single-runner registry;
- dashboard direct exact-target Start/Stop/Open, fleet search/filter/pagination, actionable structural activity labels, and ambiguity actions;
- compact popup with overlay editors for completion/onboarding/WAKE/MESSAGE/advanced settings.

Real browser gate: `docs/LIVE_SMOKE_CHECKLIST.md`. Repository/static gates never substitute for it.

## popup.js provenance

Recovered numeric clamp/default regressions were repaired. CI checks delay ≥ 0, interval ≥ 1, maxRepeats ≥ 0, runtimeMin ≥ 0 plus cooldown/storage contracts.

## Development state

`docs/MILESTONES.md` is the single durable work-supply/progress authority. There is no active BATON layer. `docs/DEVELOPMENT_CHECKPOINT.md` is durable summary/evidence and `docs/DEVELOPMENT_LOG.md` is historical evidence only.

## Development principles

- ChatGPT-first
- dashboard-first management
- compact popup, no default vertical scrolling
- reliability / simplification / regression fixes before feature growth
- COMPLETE via exact `parrot.invalid` runId link
- WAKE / MESSAGE routing without semantic chat reading
- authoritative references before material UX/API/architecture changes
