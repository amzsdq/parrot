# Parrot Baton

This file is the canonical immediate continuation pointer for the next Parrot relay wake. Keep ONLY the latest baton here; history is mirrored to `docs/DEVELOPMENT_LOG.md`.

CURRENT_VERSION=v0.8.7-reconstruction
STATUS=CONTINUE
WORK_PACKAGE_ID=PARROT-BATON-008
PACKAGE_KIND=CORE_BEHAVIOR_RECONSTRUCTION
EXPECTED_ACTIVE_MINUTES=14
NEXT_WAKE_DELAY_MINUTES=14
SHORT_PACKAGE_REASON=NONE
WORK_TIME_MARKER_ISSUE=amzsdq/parrot#1

CURRENT_TASK=
Wire the now-staged/tested prompt composer into response execution, then restore interval execution and structural cooldown behavior.

COMPLETED_PREVIOUS=
- Structural `parrot.invalid` signal scanner + durable COMPLETE/WAKE/MESSAGE ingestion are present without assistant-prose semantic reading.
- Canonical `signal-protocol.js` is used by background and has CI parser/template vectors; stable signalId dedupes repeated observations.
- Response-mode runner and strong receipt/ambiguity-outbox path are present.
- Added canonical `prompt-compose.js`: deterministic SELF/TARGETS directory, WAKE/MESSAGE URL patterns, once-per-run onboarding composition, and exact completion-signal instruction composition.
- Added `test-prompt-compose.mjs`; workflow now syntax-checks and executes prompt composition vectors in addition to route/signal/rebuildability gates. Latest prompt-compose workflow was queued at handoff; verify exact-head result before relying on it.
- Gap audit now correctly marks signal discovery closed and prompt composition staged-but-not-wired.
- popup.js remains safely restored to pre-attempt blob after the earlier failed whole-file replacement; exact four-clamp repair is still open and must use a byte-safe method.

NEXT_ACTION=
1. Verify latest exact-head CI including `test-prompt-compose.mjs`. If it fails, repair the actual contract rather than weakening tests.
2. Load `prompt-compose.js` before `content.js` and make response runner call `ParrotPromptCompose.compose(target, allTargets, {firstSend: sentCount===0})` instead of raw `target.prompt`. Confirm onboarding appears only on first send while completion instruction remains on each work prompt as intended.
3. Add integration guard proving popup target fields → composer → content send are connected.
4. Reconstruct interval mode with one runner per target and intervalMin/maxRepeats/runtime/status semantics; establish a storage/background/content wake path because popup currently explicitly arms only response mode. Fence duplicate runners.
5. Reconstruct error-surface cooldown ladders: Too-many-requests 10→20→40→60 minutes; other transient error UI 2→5→10→20. Use dialog/alert/toast structural surfaces, never assistant prose.
6. Converge dashboard tab classification onto canonical route-state primitive.
7. Update `docs/V087_RUNTIME_GAP_AUDIT.md` only when each gap is actually closed. Keep CI green.
8. Do not build/release final ZIP until live ChatGPT browser smoke tests cover selectors, send/receipt, signal discovery, cross-tab routing, ambiguity, service-worker lifecycle, repeat modes, cooldown, and dashboard actions.

DONE_CRITERIA=
- prompt composer is wired and tested end-to-end at code/contract level.
- interval mode and cooldown ladders are operational and duplicate-fenced.
- dashboard structural classification has one canonical implementation.
- CI remains green; gap audit is honest; next baton is ~14 useful minutes.

DO_NOT_REPEAT=
- broad Library search for exact v0.8.6 runtime
- popup.js 53-byte diagnosis
- unsafe whole-file popup replacement
- duplicate signal parser/state implementations
- treating static CI as live browser/release proof

BLOCKER=
Exact later runtime bytes remain unavailable, so reconstruction is deliberately v0.8.7. Real browser smoke testing remains a release gate.

SCHEDULER_RULE=
Preferred/default NEXT_WAKE_DELAY_MINUTES is 14. Shorter is exceptional and requires a concrete unavoidable SHORT_PACKAGE_REASON.

MEASUREMENT_RULE=
Use issue #1 WAKE/START/END comments and direct REST fetch of returned comment ids. GitHub created_at is the sole timing authority.
