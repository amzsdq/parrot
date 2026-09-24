# Parrot Baton

Latest-only continuation pointer; full snapshots are mirrored to `docs/DEVELOPMENT_LOG.md`.

CURRENT_VERSION=v0.8.7-reconstruction
STATUS=CONTINUE
WORK_PACKAGE_ID=PARROT-BATON-008
PACKAGE_KIND=CORE_BEHAVIOR_RECONSTRUCTION
EXPECTED_ACTIVE_MINUTES=14
NEXT_WAKE_DELAY_MINUTES=14
SHORT_PACKAGE_REASON=NONE
WORK_TIME_MARKER_ISSUE=amzsdq/parrot#1

CURRENT_TASK=
Wire tested prompt/repeat policy primitives into runtime, then close interval/cooldown/dashboard gaps.

COMPLETED_PREVIOUS=
- Structural href-only COMPLETE/WAKE/MESSAGE discovery and durable signalId-deduped route/event creation are implemented; no assistant-prose semantic monitoring.
- `signal-protocol.js` is canonical in background and parser/template vectors pass CI.
- Response-mode runner, strong user-count/generation receipt, ambiguity outbox-before-notify, and pending-only queue path are present.
- `prompt-compose.js` + `test-prompt-compose.mjs` define/test once-first-send onboarding directory/URL patterns and exact completion instruction composition. CI run 35963240023 passed all gates including prompt vectors.
- `repeat-policy.js` + `test-repeat-policy.mjs` define max-repeat/runtime stop rules, interval due calculation, rate-limit cooldown 10→20→40→60 minutes, and transient cooldown 2→5→10→20 minutes. CI run 35963331882 passed syntax, all policy vectors, contracts, integration guard, and rebuildability.
- Gap audit marks signal discovery closed and prompt composition staged-but-not-wired.
- popup.js remains safely at restored blob `b2df626c...`; known four-clamp exact repair remains open and requires byte-safe editing.

NEXT_ACTION=
1. Load `prompt-compose.js` before content and replace raw response `target.prompt` send with `ParrotPromptCompose.compose(target, allTargets, {firstSend: sentCount===0})`; integration-guard the popup→composer→content seam.
2. Load/use `repeat-policy.js` in runtime. Reconstruct interval mode with one runner per target and duplicate fencing; respect intervalMin/maxRepeats/runtime/status.
3. Detect cooldown only from structural error UI surfaces (dialog/alert/toast), classify rate-limit vs transient, and apply the tested ladders. Never inspect assistant prose.
4. Converge dashboard tab classification onto canonical route-state primitive.
5. Add deterministic integration guards for the newly wired seams and keep exact-head CI green.
6. Update gap audit only when gaps actually close. Do not build/release final ZIP until real ChatGPT browser smoke tests validate send/receipt, signal discovery, cross-tab routing, ambiguity, service-worker lifecycle, both repeat modes, cooldown, and dashboard actions.

DONE_CRITERIA=
- prompt composer and repeat policy are runtime-wired and integration-tested.
- interval and cooldown behavior are operational and duplicate-fenced.
- dashboard structural classification is canonicalized.
- CI remains green; gap audit honest; next baton ~14 useful minutes.

DO_NOT_REPEAT=
- broad Library search for exact v0.8.6 runtime
- popup.js 53-byte diagnosis
- unsafe whole-file popup replacement
- duplicate signal/state/policy implementations
- treating static CI as live browser/release proof

BLOCKER=
Exact later runtime bytes remain unavailable; reconstruction is deliberately v0.8.7. Real browser smoke testing remains a release gate.

SCHEDULER_RULE=
Preferred/default NEXT_WAKE_DELAY_MINUTES=14. Shorter is exceptional and requires concrete unavoidable SHORT_PACKAGE_REASON.

MEASUREMENT_RULE=
Issue #1 WAKE/START/END comments + direct REST created_at are the sole timing authority.
