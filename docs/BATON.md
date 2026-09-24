# Parrot Baton

This file is the canonical immediate continuation pointer for the next Parrot relay wake.
Keep ONLY the latest baton here. Historical baton snapshots are mirrored automatically into `docs/DEVELOPMENT_LOG.md`.

CURRENT_VERSION=v0.8.7-reconstruction
STATUS=CONTINUE
WORK_PACKAGE_ID=PARROT-BATON-007
PACKAGE_KIND=CORE_BEHAVIOR_RECONSTRUCTION
EXPECTED_ACTIVE_MINUTES=14
NEXT_WAKE_DELAY_MINUTES=14
SHORT_PACKAGE_REASON=NONE
WORK_TIME_MARKER_ISSUE=amzsdq/parrot#1

CURRENT_TASK=
Restore prompt composition, interval execution, cooldown/error behavior, and canonical dashboard classification on top of the now-present structural signal discovery + durable routing path.

COMPLETED_PREVIOUS=
- `signal-scanner.js` observes only exact `https://parrot.invalid/...` anchor hrefs and does not read assistant prose semantics.
- Scanner accepts COMPLETE/WAKE/MESSAGE URL families and sends structural signal metadata to background.
- Scanner now marks a signal accepted in page memory only after background returns `ok`; transient background failure does not permanently suppress retry. Background `signalId` dedupe is the durable idempotency authority.
- Background parses COMPLETE by runId and WAKE/MESSAGE by sourceRunId+eventId+to/ref.
- Repeated DOM observations are deduped against durable events/route records by stable signalId.
- COMPLETE marks matching runId target completed and records a durable event.
- WAKE/MESSAGE create durable pending route records and events, then invoke pending-only queue processing.
- MESSAGE route payload is built from the target template and reference metadata; WAKE uses target wakePrompt.
- Manifest loads signal-scanner in ChatGPT tabs; CI run 35962901800 passed after manifest wiring.
- Response-mode runner and strong route receipt path remain present; repository static/rebuildability gates were green before/through this integration slice.
- Release-gap audit remains authoritative: green CI is not live-browser proof.

NEXT_ACTION=
1. Reconstruct normal prompt composition for response sends: onboarding template expansion (`SELF`, WAKE_URL, MESSAGE_URL, TARGETS) and completion instruction exact `runId` URL injection. Ensure onboarding occurs at the intended lifecycle boundary rather than every repeat if historical behavior requires once-per-run.
2. Add deterministic tests/guard for exact COMPLETE/WAKE/MESSAGE URL parsing and signalId dedupe, including malformed/missing `to` and repeated observations.
3. Reconstruct interval mode with one runner per target and correct intervalMin/maxRepeats/runtime/status semantics. Popup currently does not explicitly PARROT_START interval mode, so choose a coherent storage/background/content wake path and test duplicate-runner fencing.
4. Reconstruct structural error-surface cooldown handling: Too-many-requests 10→20→40→60 minutes; other transient error UI 2→5→10→20. Do not inspect assistant prose.
5. Load/use canonical route-state classification in dashboard rather than local duplicated `classifyTab` logic.
6. Update `docs/V087_RUNTIME_GAP_AUDIT.md` only as gaps are actually closed.
7. Keep CI green. Do not release/build final ZIP until live ChatGPT smoke tests validate selectors, service-worker lifecycle, response runner, signal routing, ambiguity behavior, and dashboard actions.

DONE_CRITERIA=
- normal response prompt composition restores onboarding/completion contracts without semantic monitoring.
- signal parser/dedupe has deterministic regression evidence.
- interval mode and cooldown ladders are operational and fenced from duplicate execution.
- dashboard structural classification has one canonical implementation.
- CI remains green and gap audit accurately reflects remaining live-browser work.
- next baton remains ~14 useful minutes.

DO_NOT_REPEAT=
- broad Library search for exact v0.8.6 runtime
- popup.js 53-byte diagnosis
- unsafe whole-file popup text replacement
- reimplementing structural signal discovery from scratch
- treating static CI as browser/release proof

BLOCKER=
Exact later runtime bytes remain unavailable. Reconstruction is deliberate v0.8.7. Live browser smoke testing remains a release gate after code-level gaps close.

SCHEDULER_RULE=
Preferred/default NEXT_WAKE_DELAY_MINUTES is 14. Shorter is exceptional and requires a concrete unavoidable SHORT_PACKAGE_REASON.

MEASUREMENT_RULE=
Use issue #1 WAKE/START/END comments and direct REST fetch of each returned comment id. GitHub created_at is the sole timing authority.
