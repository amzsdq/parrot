# Parrot Development Log

Append-only relay history. Each completed wake appends the full BATON snapshot that it hands to the next wake.
Do not use this file as the immediate continuation pointer; `docs/BATON.md` is authoritative for the latest baton.

## BATON SNAPSHOT — PARROT-BATON-001

# Parrot Baton

This file is the canonical immediate continuation pointer for the next Parrot relay wake.
Keep ONLY the latest baton here. Historical baton snapshots belong in `docs/DEVELOPMENT_LOG.md`.

CURRENT_VERSION=v0.8.6
STATUS=CONTINUE
WORK_PACKAGE_ID=PARROT-BATON-001
PACKAGE_KIND=IMPLEMENTATION
EXPECTED_ACTIVE_MINUTES=14
NEXT_WAKE_DELAY_MINUTES=14

CURRENT_TASK=
Close the v0.8.6 repository source-of-truth gap around popup.js, then use any remaining package capacity to begin the next missing exact source migration.

NEXT_ACTION=
1. Compare artifact `popup.js` vs repository `extension/popup.js` at byte/line level and identify the exact 53-byte discrepancy.
2. Reconcile `extension/popup.js` to the artifact when feasible, then verify Git blob/content identity or record concrete normalization evidence if exact identity is connector-impossible.
3. If steps 1-2 finish materially before the package is exhausted, begin exact migration of `background.js` only; do not start multiple additional files.
4. Run targeted syntax/content verification for every file actually changed.
5. Update this BATON with exactly one next bounded work package and mirror that full baton snapshot into `docs/DEVELOPMENT_LOG.md`.

DONE_CRITERIA=
- popup.js discrepancy cause is concretely identified, not guessed.
- popup.js is either exact-matched OR a reproducible connector-normalization limitation is demonstrated and recorded.
- Any started background.js migration is left in a clearly verifiable state.
- Next baton is scoped to <=14 expected active minutes.

DO_NOT_REPEAT=
- manifest.json exact migration
- chatgpt-adapter.js exact migration
- dashboard.html exact migration
- dashboard.css exact migration
- popup.css exact migration
- popup.html exact migration
- v0.8.6 terminal-history pruning implementation

BLOCKER=none

SCHEDULER_RULE=
At wake, read this BATON first. Obtain fresh authoritative current time, then prearm the SAME canonical automation by exactly NEXT_WAKE_DELAY_MINUTES. Do not default to 14 when this field is smaller. If the next package genuinely needs only 3 minutes of test/observation, write NEXT_WAKE_DELAY_MINUTES=3. Never pad work to fill 14 minutes; split work packages so expected active work is <=14 minutes.


## BATON SNAPSHOT — PARROT-BATON-001R1

# Parrot Baton

This file is the canonical immediate continuation pointer for the next Parrot relay wake.
Keep ONLY the latest baton here. Historical baton snapshots belong in `docs/DEVELOPMENT_LOG.md`.

CURRENT_VERSION=v0.8.6
STATUS=CONTINUE
WORK_PACKAGE_ID=PARROT-BATON-001R1
PACKAGE_KIND=IMPLEMENTATION
EXPECTED_ACTIVE_MINUTES=14
NEXT_WAKE_DELAY_MINUTES=14
SHORT_PACKAGE_REASON=NONE
WORK_TIME_MARKER_ISSUE=amzsdq/parrot#1

TARGET_POLICY=
- Preferred/default active-work target is 14 minutes to minimize relay idle time.
- Build the next baton to contain roughly 14 minutes of genuinely useful contiguous work whenever such work exists.
- Shorter packages are exceptions only when the next meaningful step is inherently short or externally gated.
- Every package under 14 minutes MUST set SHORT_PACKAGE_REASON to a concrete reason.
- Never idle or pad merely to hit 14 minutes. If a 14-minute package finishes early, continue directly related safe useful work from the baton/package scope when available.

CURRENT_TASK=
Close the v0.8.6 repository source-of-truth gap around popup.js, then use remaining package capacity to begin the next missing exact source migration.

NEXT_ACTION=
1. Compare artifact `popup.js` vs repository `extension/popup.js` at byte/line level and identify the exact discrepancy.
2. Reconcile `extension/popup.js` to the artifact when feasible, then verify Git blob/content identity or record concrete normalization evidence if exact identity is connector-impossible.
3. If steps 1-2 finish materially before the 14-minute work package is exhausted, continue directly into exact migration of `background.js`.
4. Run targeted syntax/content verification for every file actually changed.
5. Before handoff, create the next baton with a preferred 14-minute useful-work package.
6. Replace this BATON with the next snapshot and append the identical full snapshot to `docs/DEVELOPMENT_LOG.md`.

DONE_CRITERIA=
- popup.js discrepancy cause is concretely identified, not guessed.
- popup.js is either exact-matched OR a reproducible connector-normalization limitation is demonstrated and recorded.
- Remaining useful capacity is spent on directly adjacent source migration/verification rather than ending at a convenient subtask boundary.
- Next baton is preferably a 14-minute package; any shorter baton has an explicit unavoidable SHORT_PACKAGE_REASON.

DO_NOT_REPEAT=
- manifest.json exact migration
- chatgpt-adapter.js exact migration
- dashboard.html exact migration
- dashboard.css exact migration
- popup.css exact migration
- popup.html exact migration
- v0.8.6 terminal-history pruning implementation

BLOCKER=none

SCHEDULER_RULE=
At wake, use the baton target as the continuation interval. Default/preferred NEXT_WAKE_DELAY_MINUTES is 14 because minimizing idle time is a primary relay objective. A value below 14 is allowed only for an inherently short or externally gated next step and MUST have SHORT_PACKAGE_REASON populated.

MEASUREMENT_RULE=
Use amzsdq/parrot issue #1 [PARROT_RELAY_WORK_MARKERS]. GitHub comment created_at is the sole timing authority. Each actual wake records WAKE, START, END markers for one unique session. Official SESSION_ELAPSED=END-WAKE and WORKED=END-START. Final chat report must print raw UTC first, KST in parentheses, plus TARGET_ACTIVE_MINUTES and utilization. If authoritative timestamps are missing, print UNKNOWN; never estimate or substitute model/local time.


## BATON SNAPSHOT — PARROT-BATON-002

# Parrot Baton

This file is the canonical immediate continuation pointer for the next Parrot relay wake.
Keep ONLY the latest baton here. Historical baton snapshots belong in `docs/DEVELOPMENT_LOG.md`.

CURRENT_VERSION=v0.8.6
STATUS=CONTINUE
WORK_PACKAGE_ID=PARROT-BATON-002
PACKAGE_KIND=SOURCE_RECOVERY_AND_VERIFICATION
EXPECTED_ACTIVE_MINUTES=14
NEXT_WAKE_DELAY_MINUTES=14
SHORT_PACKAGE_REASON=NONE
WORK_TIME_MARKER_ISSUE=amzsdq/parrot#1

CURRENT_TASK=
Recover an authoritative byte source for the v0.8.6 missing runtime files and close the popup.js exactness question without guessing. Use remaining package capacity to advance the next exact source migration.

NEXT_ACTION=
1. Search available conversation/library/runtime sources specifically for the actual v0.8.6 ZIP or its extracted popup.js/background.js/content.js/dashboard.js bytes. Do not treat design handoff documents as artifact source.
2. If exact popup.js bytes are recovered, compare against repository blob b2df626c1ba3a2cb95b608f55053d122ca6a5b4c and artifact target blob 04b3a2b425f37ee33de2b7194bd7dbea8aaa93da; reconcile only from authoritative bytes.
3. If exact bytes remain unavailable, record that as an artifact-access blocker for byte certification; do NOT infer the missing 53 bytes. Preserve the useful evidence that commit 990a70e only added four blank lines and therefore did not explain the 53-byte artifact-size gap.
4. Recover and migrate one of background.js/content.js/dashboard.js only from authoritative artifact bytes. Never recreate missing runtime files from the old nine-line background.js stub or from prose descriptions.
5. Run syntax/content verification for every file actually changed.
6. Hand off another preferred 14-minute useful package unless the next step is genuinely externally gated.

DONE_CRITERIA=
- Artifact byte availability is decisively established for this runtime.
- No source file is certified exact without authoritative byte/blob evidence.
- Any recovered runtime source is committed and verified, or the precise recovery blocker is durably recorded.
- Next baton remains approximately 14 minutes of useful work.

DO_NOT_REPEAT=
- manifest.json exact migration
- chatgpt-adapter.js exact migration
- dashboard.html exact migration
- dashboard.css exact migration
- popup.css exact migration
- popup.html exact migration
- v0.8.6 terminal-history pruning implementation
- background.js nine-line historical stub (commit 8baedeb) — known incomplete and intentionally removed

BLOCKER=
The v0.8.6 artifact bytes were not discoverable by the current conversation/library search during PARROT-BATON-001R1. This blocks honest byte-exact reconciliation until an authoritative artifact source is recovered. Continue searching available runtime sources before declaring hard block.

SCHEDULER_RULE=
Preferred/default NEXT_WAKE_DELAY_MINUTES is 14 to minimize idle time. Shorter is exceptional and requires a concrete unavoidable SHORT_PACKAGE_REASON.

MEASUREMENT_RULE=
Use amzsdq/parrot issue #1. Create WAKE/START/END comments per session. The normal issue-comment listing currently returns created_at=null through the connector, so authoritative timestamps MUST be recovered by direct GitHub REST fetch of each returned comment id (`/repos/amzsdq/parrot/issues/comments/<id>`), which exposes the real server created_at. Compute SESSION_ELAPSED=END-WAKE and WORKED=END-START only from those server timestamps; never estimate.


## BATON SNAPSHOT — PARROT-BATON-003

# Parrot Baton

This file is the canonical immediate continuation pointer for the next Parrot relay wake.
Keep ONLY the latest baton here. Historical baton snapshots belong in `docs/DEVELOPMENT_LOG.md`.

CURRENT_VERSION=v0.8.6
STATUS=CONTINUE
WORK_PACKAGE_ID=PARROT-BATON-003
PACKAGE_KIND=EXACT_POPUP_REPAIR_AND_RECONSTRUCTION_BOOTSTRAP
EXPECTED_ACTIVE_MINUTES=14
NEXT_WAKE_DELAY_MINUTES=14
SHORT_PACKAGE_REASON=NONE
WORK_TIME_MARKER_ISSUE=amzsdq/parrot#1

CURRENT_TASK=
Use the recovered v0.8.0 Library artifact to repair popup.js to its exact v0.8.6 target bytes, then spend remaining package capacity bootstrapping the evidence-based v0.8.7 runtime reconstruction path if exact later runtime bytes remain unavailable.

RECOVERED_SOURCE=
Library artifact `parrot_extension_v0.8.0.zip`, size 36,229 bytes, SHA-256 4c9d27a0e866fe60802f19717a962034dbfc7c1ba873d116359e4566075dc1ef. Materialized popup.js is 21,960 bytes and Git blob 04b3a2b425f37ee33de2b7194bd7dbea8aaa93da, EXACTLY the recorded v0.8.6 popup.js target. popup.css and popup.html from the same artifact also match their v0.8.6 target blobs, confirming this popup source lineage.

NEXT_ACTION=
1. Locate/materialize Library `parrot_extension_v0.8.0.zip`; verify its popup.js Git blob is `04b3a2b425f37ee33de2b7194bd7dbea8aaa93da` before writing.
2. Replace repository `extension/popup.js` from those authoritative bytes. Because GitHub text write does not accept a local path, read the local source in bounded chunks if needed, then perform one complete replacement; do not hand-edit/guess the 53 missing bytes.
3. Re-fetch repository popup.js and require exact Git blob `04b3a2b425f37ee33de2b7194bd7dbea8aaa93da`; run `node --check` on the recovered local source. Only then mark popup.js migration complete.
4. If capacity remains, use `docs/RECONSTRUCTION_PLAN_v0.8.7.md` plus recovered v0.8.0 runtime source to begin a NEW v0.8.7 reconstruction path. Do not copy v0.8.0 background/content/dashboard and label them v0.8.6: v0.8.0 demonstrably predates strong user-message-count receipts, durable ambiguity outbox, manual retry/resolve, and ambiguity fencing.
5. Prefer the first reconstruction slice that creates testable strong-receipt/route-state primitives; keep product code changes coherent and verifiable.
6. Hand off another preferred ~14-minute useful package.

DONE_CRITERIA=
- popup.js repository blob exactly equals 04b3a2b425f37ee33de2b7194bd7dbea8aaa93da, OR the exact connector limitation preventing the authoritative-byte write is demonstrated without modifying source incorrectly.
- No v0.8.0 runtime file is mislabeled as exact v0.8.6.
- Any v0.8.7 reconstruction work follows the durable plan and has targeted verification.
- Next baton is another useful ~14-minute package unless genuinely externally gated.

DO_NOT_REPEAT=
- broad Library semantic search for v0.8.6; recent Library listing already established only v0.8.0 is retained among v0.8.x artifacts
- manifest.json exact migration
- chatgpt-adapter.js exact migration
- dashboard.html exact migration
- dashboard.css exact migration
- popup.css exact migration
- popup.html exact migration
- v0.8.6 terminal-history pruning implementation
- background.js nine-line historical stub (commit 8baedeb) — known incomplete

BLOCKER=
Full v0.8.6 background.js/content.js/dashboard.js bytes remain unavailable. This no longer blocks popup.js because its exact target bytes were recovered from v0.8.0. For the missing runtime trio, either recover later exact bytes or reconstruct deliberately as v0.8.7 per docs/RECONSTRUCTION_PLAN_v0.8.7.md.

SCHEDULER_RULE=
Preferred/default NEXT_WAKE_DELAY_MINUTES is 14 to minimize idle time. Shorter is exceptional and requires a concrete unavoidable SHORT_PACKAGE_REASON.

MEASUREMENT_RULE=
Use amzsdq/parrot issue #1. Create WAKE/START/END comments per session. Fetch each returned comment id directly through GitHub REST `/repos/amzsdq/parrot/issues/comments/<id>` for authoritative created_at because aggregate comment listing may return null. Compute SESSION_ELAPSED=END-WAKE and WORKED=END-START only from those server timestamps.


## BATON SNAPSHOT — PARROT-BATON-004

# Parrot Baton

This file is the canonical immediate continuation pointer for the next Parrot relay wake.
Keep ONLY the latest baton here. Historical baton snapshots belong in `docs/DEVELOPMENT_LOG.md`.

CURRENT_VERSION=v0.8.6
STATUS=CONTINUE
WORK_PACKAGE_ID=PARROT-BATON-004
PACKAGE_KIND=ROUTE_STATE_INTEGRATION_AND_POPUP_WRITE_RECOVERY
EXPECTED_ACTIVE_MINUTES=14
NEXT_WAKE_DELAY_MINUTES=14
SHORT_PACKAGE_REASON=NONE
WORK_TIME_MARKER_ISSUE=amzsdq/parrot#1

CURRENT_TASK=
Integrate the newly added deterministic v0.8.7 route-state primitives into production runtime in one coherent slice, while preserving the recovered exact popup.js bytes as authoritative evidence and finding a reliable connector path for that exact replacement.

COMPLETED_PREVIOUS=
- Re-materialized Library `parrot_extension_v0.8.0.zip` and re-verified recovered popup.js: 21,960 bytes, `node --check` passes, Git blob `04b3a2b425f37ee33de2b7194bd7dbea8aaa93da`.
- Direct GitHub contents write has no local-file parameter; attempted Git tree reuse of SHA 04b3... failed 422 because the local Git blob is not yet a GitHub repository object. Do not hand-copy/guess bytes merely to force certification.
- Added `extension/route-state.js`: strong receipt classification, ambiguity fencing/reconciliation, manual retry/resolve, active-preserving terminal pruning, discarded/frozen structural classification.
- Added `scripts/test-route-state.mjs` against `tests/route-state-contract.json`.
- Executed the same current route-state implementation in local Node/vm: 11 focused assertions passed (count receipt, generation receipt, composer-only ambiguity, ambiguity fence, manual retry, manual resolve, discarded, frozen, frozen-unsupported, mixed pruning, active-over-cap). Fresh-main script execution remains a separate gate because this runtime cannot network-clone GitHub.
- Inspected recovered v0.8.0 production hot paths: background periodic processing redispatches every non-delivered record; content `waitForDispatchReceipt` incorrectly treats composer-cleared/changed as delivery. These are the exact first integration seams for v0.8.7.

NEXT_ACTION=
1. Wire `route-state.js` into reconstructed production runtime. Recovered v0.8.0 source is reference-only; reconstructed files must be v0.8.7, never claimed byte-exact v0.8.6.
2. Background first slice: periodic dispatch only when `ParrotRouteState.canAutoDispatch(item)`; add ambiguity reconciliation that changes state only; terminal pruning includes delivered+resolved and retains all active records.
3. Content first slice: capture `beforeUserCount`, click once, and accept delivery only on user-count increase or generation start. Composer clear/change alone => durable ambiguity receipt; locally fence queue id before transient notification.
4. Add actual production-path regression tests for those seams, then dashboard Retry/Resolve controls and structural frozen/discarded state.
5. For exact popup.js, continue seeking a byte-preserving GitHub write bridge from the materialized Library file; until it exists, retain the exact hash evidence without false certification.
6. Repair handoff-log integrity: append the full PARROT-BATON-004 snapshot to `docs/DEVELOPMENT_LOG.md`. The current connector exposes full-file replacement rather than append, so this turn updated BATON safely but did not risk truncating the existing append-only history.
7. Run repository syntax/rebuildability gates and hand off another ~14-minute package.

DONE_CRITERIA=
- At least one production runtime path uses shared route-state semantics with deterministic regression evidence, OR a precise integration blocker is recorded.
- Ambiguous records cannot enter automatic dispatch through the integrated slice.
- Strong receipt no longer accepts composer clearing/changing alone.
- No reconstructed v0.8.0 runtime is mislabeled byte-exact v0.8.6.
- DEVELOPMENT_LOG mirror is restored without history loss.
- Exact popup evidence remains preserved until byte-preserving write succeeds.

DO_NOT_REPEAT=
- broad Library search for v0.8.6
- re-investigate popup.js 53-byte cause
- manifest.json/chatgpt-adapter.js/dashboard.html/dashboard.css/popup.css/popup.html exact migrations
- background.js nine-line historical stub

BLOCKER=
Exact v0.8.6 background.js/content.js/dashboard.js bytes remain unavailable. Exact popup.js bytes are available locally but current GitHub write connector does not accept a local file reference. Network git clone is unavailable in the execution container. Continue deliberate v0.8.7 reconstruction from recovered v0.8.0 + verified contracts.

SCHEDULER_RULE=
Preferred/default NEXT_WAKE_DELAY_MINUTES is 14. Shorter is exceptional and requires a concrete unavoidable SHORT_PACKAGE_REASON.

MEASUREMENT_RULE=
Use issue #1 WAKE/START/END comments and direct REST fetch of each returned comment id. GitHub created_at is the sole timing authority.


## BATON SNAPSHOT — PARROT-BATON-005

# Parrot Baton

This file is the canonical immediate continuation pointer for the next Parrot relay wake.
Keep ONLY the latest baton here. Historical baton snapshots are mirrored automatically into `docs/DEVELOPMENT_LOG.md`.

CURRENT_VERSION=v0.8.6
STATUS=CONTINUE
WORK_PACKAGE_ID=PARROT-BATON-005
PACKAGE_KIND=PRODUCTION_RUNTIME_RECONSTRUCTION
EXPECTED_ACTIVE_MINUTES=14
NEXT_WAKE_DELAY_MINUTES=14
SHORT_PACKAGE_REASON=NONE
WORK_TIME_MARKER_ISSUE=amzsdq/parrot#1

CURRENT_TASK=
Turn the now-CI-verified v0.8.7 route-state/route-queue primitives into the first real production runtime slice by reconstructing background/content integration from recovered v0.8.0 source plus verified v0.8.7 contracts.

COMPLETED_PREVIOUS=
- `extension/route-state.js` now implements strong structural receipt classification, pending-only auto-dispatch predicate, ambiguity reconciliation, manual retry/resolve, active-preserving terminal pruning, discarded/frozen classification, and bounded ambiguity outbox operations.
- Ambiguity receipts are allowlist-sanitized before persistence so semantic/unapproved fields cannot leak into the durable receipt/outbox.
- `extension/route-queue.js` adds a storage/dispatch-injected queue integration layer: periodic eligible processing, state-only ambiguity reconciliation, explicit retry, resolve, delivered transition.
- Repository-native GitHub Actions run 35957550973 succeeded after CI first caught and forced repair of a test-runner binding collision. Current CI syntax-checks both primitives/runners and executes route-state + route-queue tests.
- `.github/workflows/mirror-baton-log.yml` successfully appended PARROT-BATON-004 to `docs/DEVELOPMENT_LOG.md`; future unseen BATON ids are mirrored automatically without connector full-file replacement risk.
- `docs/V087_INTEGRATION_SEAMS.md` selects one canonical browser-global state implementation. Reconstructed classic MV3 background should use `importScripts('route-state.js', 'route-queue.js')`; content loads the same `route-state.js` before content.js. Chrome official service-worker docs support importScripts for classic workers.
- A premature simplified dashboard.js reconstruction was critically reviewed and deleted rather than leaving behavior regressions. Reconstruct dashboard only after background/content message contracts are stable.
- Exact popup.js evidence remains: Library v0.8.0 popup is 21,960 bytes, node syntax valid, Git blob 04b3a2b425f37ee33de2b7194bd7dbea8aaa93da. Current repo popup remains b2df626c... until a byte-preserving write bridge exists.

NEXT_ACTION=
1. Reconstruct `extension/background.js` from recovered v0.8.0 behavior as deliberate v0.8.7, not byte-exact v0.8.6. Start with the routing path and preserve existing target/start/cooldown message contracts.
2. Load `route-state.js` + `route-queue.js` with classic `importScripts`. Periodic routing must delegate pending-only eligibility; add handlers for ambiguity receipt reconciliation, `PARROT_ROUTE_RETRY`, and `PARROT_ROUTE_RESOLVE`. Reconciliation must never redeliver.
3. Reconstruct `extension/content.js` from recovered v0.8.0 behavior. Before route click capture `getUserMessageCount`; after one click accept delivered only on user-count increase or generation start. Composer clear/change alone => ambiguous.
4. Persist sanitized ambiguity receipt to bounded `chrome.storage.local` outbox BEFORE transient background notification, then locally fence that queue id from the retry timer. Background ack removes outbox receipt; notification failure leaves it durable.
5. Update manifest coherently only when background/content files are ready: v0.8.7, classic background (remove type=module), and load route-state.js before chatgpt-adapter.js/content.js. Do not leave a half-wired manifest.
6. Run `node scripts/test-route-state.mjs`, `node scripts/test-route-queue.mjs`, `node scripts/validate-v087-integration.mjs`, and repository rebuildability/syntax gates through CI or executable checkout. Fix failures rather than weakening gates.
7. Only after message contracts stabilize, reconstruct dashboard.js from recovered v0.8.0 behavior plus current exact HTML, adding ambiguous Retry/Resolve and structural discarded/frozen states.
8. Continue seeking a byte-preserving popup.js write path, but do not let it block v0.8.7 runtime reconstruction and do not falsely certify current popup exactness.

DONE_CRITERIA=
- background/content production routing path exists and consumes the shared tested primitives.
- ambiguous can never auto-dispatch; reconciliation is state-only; manual retry is explicit.
- content strong receipt excludes composer-only evidence and durable ambiguity evidence survives transient messaging failure.
- manifest/runtime load order is coherent and integration guard passes.
- no v0.8.0 runtime is mislabeled byte-exact v0.8.6.
- next baton remains ~14 useful minutes.

DO_NOT_REPEAT=
- broad Library search for v0.8.6
- popup.js 53-byte diagnosis
- premature dashboard rewrite before background/content contracts
- background.js nine-line historical stub
- duplicate state-machine implementations

BLOCKER=
Exact v0.8.6 background.js/content.js/dashboard.js bytes are unavailable, so these must be reconstructed honestly as v0.8.7. Exact popup bytes are available locally but the current GitHub text connector lacks a local-file write parameter. Neither blocks the deliberate v0.8.7 reconstruction path.

SCHEDULER_RULE=
Preferred/default NEXT_WAKE_DELAY_MINUTES is 14. Shorter is exceptional and requires a concrete unavoidable SHORT_PACKAGE_REASON.

MEASUREMENT_RULE=
Use issue #1 WAKE/START/END comments and direct REST fetch of each returned comment id. GitHub created_at is the sole timing authority.


## BATON SNAPSHOT — PARROT-BATON-006

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



## BATON SNAPSHOT — PARROT-BATON-007

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



## BATON SNAPSHOT — PARROT-BATON-008

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



## BATON SNAPSHOT — PARROT-BATON-009

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



## BATON SNAPSHOT — PARROT-BATON-010

# Parrot Baton

Latest-only continuation pointer; full snapshots are mirrored to `docs/DEVELOPMENT_LOG.md`.

CURRENT_VERSION=v0.8.7-reconstruction
STATUS=CONTINUE
WORK_PACKAGE_ID=PARROT-BATON-010
PACKAGE_KIND=COOLDOWN_COMPAT_AND_BROWSER_GATE
EXPECTED_ACTIVE_MINUTES=14
NEXT_WAKE_DELAY_MINUTES=14
SHORT_PACKAGE_REASON=NONE
WORK_TIME_MARKER_ISSUE=amzsdq/parrot#1

CURRENT_TASK=
Harden the newly wired structural cooldown runtime against existing popup storage semantics, then pursue the highest-value real-browser release evidence available.

COMPLETED_PREVIOUS=
- `chatgpt-adapter.js` now exposes `classifyCooldown()` using structural selectors/attributes only; it does not inspect assistant/user message prose or node text for cooldown classification.
- `repeat-policy.js` now exposes `cooldownDue()` and `nextCooldown()` in addition to the 10→20→40→60 rate-limit and 2→5→10→20 transient ladders; interval eligibility now respects persisted cooldown deadlines.
- `content.js` now checks structural cooldown before sends, persists only kind/attempt/until/error code, blocks while cooldown is active, and clears cooldown state after a confirmed successful send.
- Added deterministic `test-chatgpt-adapter-structure.mjs`; a fake assistant message containing “Too many requests” alone is explicitly NOT classified as cooldown.
- CI now syntax-checks the adapter and runs the structural boundary test. Latest full Route State Contract job for integration guard revision completed all 21 functional/check steps successfully.
- Existing popup schema was inspected after integration. It already has `cooldownEnabled`, `cooldownStep`, and `cooldownUntil`; the new runtime currently uses `cooldownAttempt` rather than the legacy `cooldownStep`. This compatibility mismatch is known and must be normalized before release.
- No real ChatGPT browser smoke was claimed: this runtime has repository/Actions access but no attached interactive Chrome execution surface for loading the unpacked extension and exercising ChatGPT DOM.

NEXT_ACTION=
1. Normalize cooldown storage semantics: honor `cooldownEnabled === false` in both response and interval runners; choose one canonical attempt field (prefer compatibility with existing `cooldownStep`) and migrate/read legacy/new field safely. Ensure popup disable/start/stop resets the same canonical cooldown fields used by content runtime.
2. Add deterministic storage-transition tests covering disabled cooldown, first/second ladder attempts, due gating, success reset, and legacy-field migration. Do not weaken the structural-only boundary test.
3. Re-run the full Route State Contract workflow and inspect individual steps, not merely workflow existence.
4. Inspect dashboard presentation of cooldown/attention state and expose structural cooldown status without storing/rendering chat prose if a small coherent improvement fits the package.
5. Attempt real browser smoke only if an actual browser/extension execution surface is available. Required evidence: unpacked extension loads, target ChatGPT tab is found, composer/send strong receipt works, and one response or interval repeat completes. If unavailable, keep this as an explicit release blocker; never simulate it with static CI.
6. Do not generate a final release ZIP until browser smoke and cooldown compatibility gates pass.

DONE_CRITERIA=
- cooldownEnabled and cooldown attempt/reset fields are consistent across popup/content/repeat policy.
- deterministic cooldown storage/runtime tests and existing structural semantic-boundary tests pass.
- full CI/integration/rebuildability gates pass on the compatibility revision.
- browser smoke is either real and recorded or remains an explicit release blocker.
- next baton is another ~14 useful minutes unless genuinely externally gated.

DO_NOT_REPEAT=
- popup.js 53-byte diagnosis or unsafe whole-file replacement
- invented claim that static CI proves live ChatGPT DOM selectors
- semantic parsing of assistant/user prose for rate-limit detection
- duplicate prompt/repeat/route-state implementations
- treating prearm save as proof of successor wake

BLOCKER=
Real ChatGPT browser smoke remains a release gate and requires an actual browser/extension execution surface. Exact later v0.8.6 runtime bytes remain unavailable, so reconstruction remains deliberately v0.8.7.

SCHEDULER_RULE=
Preferred/default NEXT_WAKE_DELAY_MINUTES=14. Shorter is exceptional and requires concrete unavoidable SHORT_PACKAGE_REASON.

MEASUREMENT_RULE=
Issue #1 WAKE/START/END comments + direct REST created_at are the sole timing authority.



## BATON SNAPSHOT — PARROT-BATON-011

# Parrot Baton

Latest-only continuation pointer; full snapshots are mirrored to `docs/DEVELOPMENT_LOG.md`.

CURRENT_VERSION=v0.8.7-reconstruction
STATUS=CONTINUE
WORK_PACKAGE_ID=PARROT-BATON-011
PACKAGE_KIND=RELEASE_GATE_HARDENING
EXPECTED_ACTIVE_MINUTES=14
NEXT_WAKE_DELAY_MINUTES=14
SHORT_PACKAGE_REASON=NONE
WORK_TIME_MARKER_ISSUE=amzsdq/parrot#1

CURRENT_TASK=
Close the remaining static release gaps that can be proven without a live browser, while keeping real ChatGPT smoke as a separate non-fakeable gate.

COMPLETED_PREVIOUS=
- Structural cooldown classification is implemented without reading assistant/user prose; deterministic boundary test proves assistant text alone cannot trigger cooldown.
- Repeat policy exposes rate-limit 10→20→40→60 and transient 2→5→10→20 ladders plus due/next transition helpers.
- Response and interval runners now honor `cooldownEnabled`; disabled targets bypass cooldown classification and stale cooldown state is cleared.
- Existing popup `cooldownStep` is now the canonical attempt counter. Runtime reads legacy/new attempt state for migration compatibility, writes `cooldownStep`, and clears it on confirmed success.
- Added `test-cooldown-storage-contract.mjs` and wired it into CI alongside adapter structural-boundary testing.
- Routed WAKE/MESSAGE sends now share target cooldown backpressure: background imports repeat policy, skips tab dispatch while target cooldown is active, persists structural cooldown returned by content, and clears cooldown after confirmed routed delivery.
- Full Route State Contract run 35970470639 passed all 22 functional/check steps including syntax, route/signal/prompt/repeat tests, structural cooldown test, storage/backpressure contract, integration guard, and rebuildability.
- README now documents cooldown semantics and the expanded verification suite.
- Real ChatGPT browser smoke is still NOT claimed; no interactive unpacked-extension Chrome surface is attached to this runtime.

NEXT_ACTION=
1. Repair the known four numeric clamp/default regressions in `popup.js` using a safe exact method; verify resulting content against the recovered target expectations instead of doing unsafe whole-file replacement. Preserve all newer intentional popup behavior if byte-exact target replacement would discard it; if so, treat v0.8.7 semantics as authoritative and add explicit regression tests for the clamps.
2. Strengthen deterministic tests around popup start/stop/disable cooldown resets and content success reset. Remove legacy `cooldownAttempt` only when migration behavior is proven safe for already-stored targets.
3. Inspect dashboard cooldown/attention presentation; add a compact structural cooldown indicator/countdown only if it improves operator diagnosis without chat semantic content.
4. Re-run full CI and inspect every step after any release-gate changes.
5. Attempt real browser smoke only if an actual Chrome/extension execution surface becomes available. Required evidence remains: unpacked extension load, exact target tab resolution, composer/send strong receipt, one response or interval repeat, and no semantic-content monitoring. Never substitute static CI for this gate.
6. Do not generate/finalize release ZIP until the static popup gate and real browser gate are both satisfied.

DONE_CRITERIA=
- popup numeric safety regression is repaired and regression-tested without losing intentional v0.8.7 behavior.
- cooldown reset/migration semantics have deterministic coverage.
- full CI/integration/rebuildability remains green.
- browser smoke is either real and recorded or explicitly remains the release blocker.
- next baton remains ~14 useful minutes unless genuinely externally gated.

DO_NOT_REPEAT=
- unsafe whole-file popup replacement
- invented claim that static CI proves live ChatGPT selectors
- semantic parsing of assistant/user prose for rate-limit detection
- duplicate prompt/repeat/route-state implementations
- treating scheduler prearm save as proof of successor wake

BLOCKER=
Real ChatGPT browser smoke requires an actual browser/extension execution surface and remains a release gate. Exact later v0.8.6 runtime bytes remain unavailable, so reconstruction remains deliberately v0.8.7.

SCHEDULER_RULE=
Preferred/default NEXT_WAKE_DELAY_MINUTES=14. Shorter is exceptional and requires concrete unavoidable SHORT_PACKAGE_REASON.

MEASUREMENT_RULE=
Issue #1 WAKE/START/END comments + direct REST created_at are the sole timing authority.

