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
Restore prompt composition, interval execution, cooldown/error behavior, and canonical dashboard classification on top of the now-tested structural signal discovery + durable routing path.

COMPLETED_PREVIOUS=
- `signal-scanner.js` observes only exact `https://parrot.invalid/...` anchor hrefs; it never reads assistant text semantics.
- Scanner marks a page signal accepted only after background `ok`; transient failure remains retryable. Background signalId dedupe is durable authority.
- Added canonical `signal-protocol.js` parser/template primitive and `scripts/test-signal-protocol.mjs` vectors for COMPLETE/WAKE/MESSAGE, malformed origin/path, missing `to`, and template substitution.
- Background now imports and uses canonical tested `ParrotSignalProtocol` rather than a duplicate parser.
- COMPLETE uses runId; WAKE/MESSAGE use sourceRunId+eventId+to/ref. Durable queue/events dedupe repeated observations by stable signalId.
- COMPLETE marks matching run target completed. WAKE/MESSAGE create durable pending route records and immediately invoke pending-only processing.
- MESSAGE payload uses target template + reference metadata; WAKE uses target wakePrompt.
- Manifest loads structural scanner; CI run 35962901800 passed this wiring. Workflow now also syntax-checks scanner/protocol and runs signal protocol vectors.
- Response-mode `PARROT_START` receiver/repeat runner and strong route receipt path are present and integration-guarded.
- `docs/V087_RUNTIME_GAP_AUDIT.md` remains the release-blocker authority. Static CI is not live-browser proof.

NEXT_ACTION=
1. Reconstruct normal response prompt composition: onboarding template expansion (`SELF`, `WAKE_URL`, `MESSAGE_URL`, `TARGETS`) and completion instruction exact `runId` URL injection. Ensure onboarding is injected at the correct once-per-run lifecycle boundary, not blindly every repeat.
2. Add an integration test around signal dedupe at the durable queue/event layer, not only parser vectors.
3. Reconstruct interval mode with one runner per target and correct intervalMin/maxRepeats/runtime/status semantics. Popup currently does not explicitly PARROT_START interval mode, so establish a coherent storage/background/content wake path and duplicate-runner fence.
4. Reconstruct structural error-surface cooldown handling: Too-many-requests 10→20→40→60 minutes; other transient error UI 2→5→10→20. Do not inspect assistant prose.
5. Load/use canonical route-state classification in dashboard instead of local duplicated `classifyTab` logic.
6. Update gap audit only as each gap is actually closed. Keep all CI gates green.
7. Do not release/build final ZIP until live ChatGPT smoke tests validate selectors, service-worker lifecycle, response runner, signal routing, ambiguity behavior, and dashboard actions.

DONE_CRITERIA=
- onboarding/completion prompt composition is restored and tested.
- durable signal dedupe has regression evidence beyond parser-only tests.
- interval mode and cooldown ladders are operational and duplicate-fenced.
- dashboard structural classification has one canonical implementation.
- CI remains green and gap audit accurately reflects remaining live-browser work.
- next baton remains ~14 useful minutes.

DO_NOT_REPEAT=
- broad Library search for exact v0.8.6 runtime
- popup.js 53-byte diagnosis
- unsafe whole-file popup text replacement
- duplicate signal parser/state implementations
- treating static CI as browser/release proof

BLOCKER=
Exact later runtime bytes remain unavailable. Reconstruction is deliberate v0.8.7. Live browser smoke testing remains a release gate after code-level gaps close.

SCHEDULER_RULE=
Preferred/default NEXT_WAKE_DELAY_MINUTES is 14. Shorter is exceptional and requires a concrete unavoidable SHORT_PACKAGE_REASON.

MEASUREMENT_RULE=
Use issue #1 WAKE/START/END comments and direct REST fetch of each returned comment id. GitHub created_at is the sole timing authority.
