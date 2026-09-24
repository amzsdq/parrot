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