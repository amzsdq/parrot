# Parrot Baton

This file is the canonical immediate continuation pointer for the next Parrot relay wake.
Keep ONLY the latest baton here. Historical baton snapshots are mirrored automatically into `docs/DEVELOPMENT_LOG.md`.

CURRENT_VERSION=v0.8.7-reconstruction
STATUS=CONTINUE
WORK_PACKAGE_ID=PARROT-BATON-006
PACKAGE_KIND=CORE_BEHAVIOR_RECONSTRUCTION
EXPECTED_ACTIVE_MINUTES=14
NEXT_WAKE_DELAY_MINUTES=14
SHORT_PACKAGE_REASON=NONE
WORK_TIME_MARKER_ISSUE=amzsdq/parrot#1

CURRENT_TASK=
Close the highest-risk core behavior gaps left after the first v0.8.7 production routing slice. A green static CI gate is not release evidence until signal discovery, prompt composition, interval/cooldown behavior, and live browser behavior are addressed.

COMPLETED_PREVIOUS=
- Added reconstructed classic MV3 `background.js`, loading canonical route-state + route-queue primitives.
- Added reconstructed `content.js` with user-count/generation strong route receipt, durable ambiguity outbox-before-notify, local ambiguity fence, and state-only background reconciliation.
- Restored popup `PARROT_START` response-mode receiver and repeat runner with running/max-repeat/runtime/generation/delay guards.
- Manifest is deliberately v0.8.7, classic background, and loads route-state before adapter/content.
- Added dashboard controller with worker search/filter/pagination and ambiguous Retry/Resolve controls.
- Expanded GitHub Actions to syntax-check reconstructed runtime and run route-state, route-queue, contract, integration, and rebuildability gates. Run 35962646344 passed all gates; later response-runner commit also passed every substantive gate step in run 35962750376.
- Fixed contract validator to support current schema 1 + schema 2 instead of falsely rejecting the route-state contract.
- Fixed integration guard so combined `importScripts('route-state.js', 'route-queue.js')` is accepted and both primitives are required.
- During an attempted popup exact repair, a whole-file text replacement accidentally wrote a placeholder. This was detected immediately and restored through Git tree/blob identity to prior blob `b2df626c...`; subsequent CI rebuildability passed. Do not repeat whole-file popup replacement without byte-safe source.
- Added `docs/V087_RUNTIME_GAP_AUDIT.md` with explicit release blockers.

NEXT_ACTION=
1. Reconstruct structural COMPLETE/WAKE/MESSAGE signal discovery and durable route/event creation from recovered behavior/contracts. Detect exact `parrot.invalid` anchors/URLs structurally; do not semantically read assistant prose.
2. Ensure dedupe/idempotency by runId/sourceRunId+eventId so repeated DOM observation cannot enqueue duplicate routes.
3. Reconstruct prompt composition: onboarding template, completion instruction with exact runId URL, WAKE prompt, MESSAGE template/reference handling. Preserve the rule that MESSAGE body/reference handling does not turn fleet monitoring into semantic chat reading.
4. Reconstruct interval mode. Popup currently explicitly arms only response mode; provide a durable interval execution path that respects intervalMin/maxRepeats/runtime/status without duplicate runners.
5. Reconstruct documented cooldown/error-UI behavior: Too-many-requests 10→20→40→60 min; other transient errors 2→5→10→20 min. Error detection must stay on dialog/alert/toast UI surfaces, not assistant semantic content.
6. Converge dashboard structural tab classification onto canonical route-state implementation rather than maintaining a hand-coded duplicate.
7. Add deterministic/static tests for each reconstructed seam and keep all existing CI gates green.
8. Do NOT build/release v0.8.7 ZIP yet. Real ChatGPT browser smoke tests remain required after core behavior closes.

DONE_CRITERIA=
- signal discovery creates deduped durable route/events without semantic chat parsing.
- onboarding/completion/WAKE/MESSAGE prompt composition is restored and tested.
- response and interval modes both have coherent runner ownership and limits.
- cooldown ladders are restored from structural error UI evidence.
- dashboard uses canonical structural classification.
- CI remains green and gap audit is reduced honestly.
- next baton remains ~14 useful minutes.

DO_NOT_REPEAT=
- broad Library search for exact v0.8.6 runtime
- popup.js 53-byte diagnosis
- unsafe whole-file popup text replacement
- treating static CI success as live browser/release proof
- duplicate state-machine or tab-classification implementations

BLOCKER=
Exact later runtime bytes remain unavailable, so v0.8.7 reconstruction must stay evidence-driven. Real browser smoke testing cannot be replaced by repository CI and remains a later release gate.

SCHEDULER_RULE=
Preferred/default NEXT_WAKE_DELAY_MINUTES is 14. Shorter is exceptional and requires a concrete unavoidable SHORT_PACKAGE_REASON.

MEASUREMENT_RULE=
Use issue #1 WAKE/START/END comments and direct REST fetch of each returned comment id. GitHub created_at is the sole timing authority.
