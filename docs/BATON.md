# Parrot Baton

Latest-only continuation pointer; full snapshots are mirrored to `docs/DEVELOPMENT_LOG.md`.

CURRENT_VERSION=v0.8.7-reconstruction
STATUS=CONTINUE
WORK_PACKAGE_ID=PARROT-BATON-009
PACKAGE_KIND=COOLDOWN_AND_LIVE_VALIDATION
EXPECTED_ACTIVE_MINUTES=14
NEXT_WAKE_DELAY_MINUTES=14
SHORT_PACKAGE_REASON=NONE
WORK_TIME_MARKER_ISSUE=amzsdq/parrot#1

CURRENT_TASK=
Finish structural cooldown integration and prepare/execute the highest-value real ChatGPT smoke validation without weakening semantic-content boundaries.

COMPLETED_PREVIOUS=
- `prompt-compose.js` and `repeat-policy.js` are now loaded before `content.js` by the manifest.
- Response-mode sends now call `ParrotPromptCompose.compose(target, allTargets, {firstSend: sentCount===0})`, so onboarding is first-send-only while completion instruction remains canonical.
- Interval mode is reconstructed with one runner per target, duplicate runner fencing, `ParrotRepeatPolicy.intervalDue`, and shared max-repeat/runtime stop policy.
- Dashboard now loads `route-state.js` and uses canonical `ParrotRouteState.classifyTabStructure(tab)` rather than maintaining a second tab-state classifier.
- Integration guard now asserts prompt/repeat manifest ordering and runtime seams. Initial guard change exposed an obsolete response-only textual assertion; corrected guard then passed all syntax/unit/contract/integration/rebuildability steps in Actions run 35968690544.
- No final ZIP/release claim has been made; real browser smoke remains a release gate.

NEXT_ACTION=
1. Add structural-only cooldown detection to `chatgpt-adapter.js`: inspect error UI surfaces such as dialog/alert/toast structure/labels, never assistant message prose. Return a narrow classification (`rate_limit`, `transient`, or none) with no captured chat text.
2. Wire content runners to `ParrotRepeatPolicy.cooldownMinutes`; persist only cooldown kind/attempt/until/error code. Rate-limit ladder 10→20→40→60 minutes; transient 2→5→10→20 minutes. Reset attempt after a confirmed successful send.
3. Add deterministic tests/integration guards proving cooldown blocks send until due and does not inspect assistant prose.
4. Inspect current popup target schema before writing; ensure cooldown fields do not conflict with saved settings and that response/interval start still targets the correct matching ChatGPT tab.
5. If a usable browser execution path is available, perform focused real ChatGPT smoke tests for composer/send receipt and one repeat mode without destructive broad testing. Record exact evidence; otherwise leave browser smoke explicitly open rather than simulating it.
6. Keep CI green and update reconstruction/gap evidence only for genuinely closed gaps. Do not generate final release ZIP until browser gates pass.

DONE_CRITERIA=
- structural cooldown classification and tested runtime gating are implemented without semantic chat reading.
- repeat success clears/reduces cooldown state correctly and duplicate runners remain fenced.
- current CI/integration/rebuildability gates pass.
- browser smoke evidence is either real and recorded or honestly remains an explicit release blocker.
- next baton is another ~14 useful minutes unless genuinely externally gated.

DO_NOT_REPEAT=
- popup.js 53-byte diagnosis or unsafe whole-file replacement
- duplicate prompt/repeat/route-state implementations
- response-only interval rejection
- local dashboard tab classifier separate from route-state
- treating static CI as live browser/release proof

BLOCKER=
Exact later v0.8.6 runtime bytes remain unavailable, so reconstruction remains deliberately v0.8.7. Real ChatGPT browser smoke testing remains a release gate.

SCHEDULER_RULE=
Preferred/default NEXT_WAKE_DELAY_MINUTES=14. Shorter is exceptional and requires concrete unavoidable SHORT_PACKAGE_REASON.

MEASUREMENT_RULE=
Issue #1 WAKE/START/END comments + direct REST created_at are the sole timing authority.
