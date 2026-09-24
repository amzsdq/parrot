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