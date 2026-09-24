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