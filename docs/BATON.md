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
- Direct `update_file` cannot consume a local file path; Git tree reuse of SHA 04b3... failed 422 because the local Git blob is not yet an object in this GitHub repository. Do not hand-copy or guess the authoritative file merely to force the write.
- Added `extension/route-state.js` with strong receipt classification, ambiguity fencing/reconciliation, manual retry/resolve, active-preserving terminal pruning, and structural discarded/frozen classification.
- Added `scripts/test-route-state.mjs` covering the deterministic vectors in `tests/route-state-contract.json`, including Chrome frozen-property-unsupported semantics.

NEXT_ACTION=
1. Run `node scripts/test-route-state.mjs` against fresh main through an available executable checkout/runtime; fix any deterministic failure before wiring production.
2. Wire `route-state.js` into the appropriate runtime surfaces without duplicating state-machine logic. Preserve ChatGPT-first and no semantic chat-content inspection.
3. First production slice should make periodic dispatch accept only `pending`, make ambiguity reconciliation state-only, and preserve manual retry/resolve boundaries. Do not attempt all dashboard UX in one uncontrolled change.
4. Add/extend deterministic tests around the actual wired production functions, not only the standalone model.
5. For exact popup.js, prefer a byte-preserving GitHub write path that can accept the materialized file/blob. If unavailable, keep the exact local artifact/hash evidence and do not falsely mark repo popup exact.
6. Run repository syntax/rebuildability gates for files changed and hand off another ~14-minute package.

DONE_CRITERIA=
- Standalone route-state contract runner has actual execution evidence, not merely source existence.
- At least one production runtime path uses the shared route-state primitive with deterministic regression evidence, OR a precise integration blocker is recorded.
- Ambiguous records cannot enter automatic dispatch through the integrated slice.
- No reconstructed v0.8.0 runtime is mislabeled byte-exact v0.8.6.
- Exact popup evidence remains preserved until a byte-preserving connector write succeeds.

DO_NOT_REPEAT=
- broad Library search for v0.8.6
- re-investigate popup.js 53-byte cause; authoritative v0.8.0 popup bytes already match target blob
- manifest.json/chatgpt-adapter.js/dashboard.html/dashboard.css/popup.css/popup.html exact migrations
- background.js nine-line historical stub

BLOCKER=
Exact v0.8.6 background.js/content.js/dashboard.js bytes remain unavailable. Exact popup.js bytes ARE available locally, but the current GitHub text connector exposes string replacement rather than a local-file parameter; do not compromise byte certainty. Continue v0.8.7 reconstruction for the missing runtime trio.

SCHEDULER_RULE=
Preferred/default NEXT_WAKE_DELAY_MINUTES is 14. Shorter is exceptional and requires a concrete unavoidable SHORT_PACKAGE_REASON.

MEASUREMENT_RULE=
Use issue #1 WAKE/START/END comments and direct REST fetch of each returned comment id. GitHub created_at is the sole timing authority.