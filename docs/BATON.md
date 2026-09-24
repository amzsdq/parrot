# Parrot Baton

This file is the canonical immediate continuation pointer for the next Parrot relay wake.
Keep ONLY the latest baton here. Historical baton snapshots belong in `docs/DEVELOPMENT_LOG.md`.

CURRENT_VERSION=v0.8.6
STATUS=CONTINUE
WORK_PACKAGE_ID=PARROT-BATON-003R1
PACKAGE_KIND=EXACT_POPUP_REPAIR_AND_RECONSTRUCTION_BOOTSTRAP
EXPECTED_ACTIVE_MINUTES=14
NEXT_WAKE_DELAY_MINUTES=14
SHORT_PACKAGE_REASON=NONE
WORK_TIME_MARKER_ISSUE=amzsdq/parrot#1

CURRENT_TASK=
Repair popup.js to the exact recovered target, then use remaining capacity to bootstrap the evidence-based v0.8.7 runtime reconstruction path if later exact runtime bytes remain unavailable.

RECOVERED_SOURCE=
Library `parrot_extension_v0.8.0.zip`, 36,229 bytes, SHA-256 4c9d27a0e866fe60802f19717a962034dbfc7c1ba873d116359e4566075dc1ef. Its popup.js is 21,960 bytes and Git blob 04b3a2b425f37ee33de2b7194bd7dbea8aaa93da, exactly the recorded v0.8.6 target.

EXACT_53_BYTE_DIAGNOSIS=
The entire current-vs-target gap is reproduced by exactly four `saveForm()` regressions. Restoring the target forms below to the recovered source yields target blob 04b3a2b...; substituting the CURRENT forms into the target yields exactly 21,907 bytes and current blob b2df626c...:
- TARGET `t.delaySec = Math.max(0, Number(els.delaySec.value || 0));` vs CURRENT `t.delaySec = Number(els.delaySec.value || 0);`
- TARGET `t.intervalMin = Math.max(1, Number(els.intervalMin.value || 11));` vs CURRENT `t.intervalMin = Number(els.intervalMin.value || 1);`
- TARGET `t.maxRepeats = Math.max(0, Number(els.maxRepeats.value || 0));` vs CURRENT `t.maxRepeats = Number(els.maxRepeats.value || 0);`
- TARGET `t.runtimeMin = Math.max(0, Number(els.runtimeMin.value || 0));` vs CURRENT `t.runtimeMin = Number(els.runtimeMin.value || 0);`
This is semantic as well as byte drift: minimum clamps/defaults were lost. Do not investigate newline/encoding further.

NEXT_ACTION=
1. Materialize the recovered v0.8.0 artifact and verify local popup.js blob 04b3a2b... .
2. Replace repository popup.js from authoritative recovered content. The exact desired source is now known; use bounded source reads if the GitHub text-write connector requires the whole file in context.
3. Re-fetch repository popup.js and require exact blob 04b3a2b... . Run node --check on recovered/committed source. Only then certify popup.js complete.
4. If capacity remains, follow docs/RECONSTRUCTION_PLAN_v0.8.7.md. v0.8.0 background/content/dashboard are historical baselines only and MUST NOT be labeled exact v0.8.6.
5. Prefer first reconstruction slice around strong receipt/route-state primitives, with tests.
6. Hand off another preferred ~14-minute useful package.

DONE_CRITERIA=
- popup.js repository blob exactly 04b3a2b425f37ee33de2b7194bd7dbea8aaa93da OR a concrete connector write limitation is demonstrated without corrupting source.
- No v0.8.0 runtime file is mislabeled exact v0.8.6.
- Any v0.8.7 work is coherent and verified.

DO_NOT_REPEAT=
- popup.js discrepancy diagnosis; exact four lines are now proven
- broad Library search for later v0.8.x zips; recent listing/title search found only v0.8.0
- manifest/chatgpt-adapter/dashboard.html/dashboard.css/popup.css/popup.html exact migrations
- v0.8.6 terminal-history pruning implementation
- nine-line historical background stub

BLOCKER=
Full exact v0.8.6 background.js/content.js/dashboard.js bytes remain unavailable. popup.js is NOT blocked: exact source and exact discrepancy are now known. Missing runtime trio should be recovered exactly if possible or reconstructed deliberately as v0.8.7, never falsely certified.

SCHEDULER_RULE=
Preferred/default NEXT_WAKE_DELAY_MINUTES=14. Shorter only for unavoidable external gating with explicit SHORT_PACKAGE_REASON.

MEASUREMENT_RULE=
Use issue #1 WAKE/START/END. Fetch each marker comment id directly through GitHub REST for authoritative created_at. Compute SESSION_ELAPSED=END-WAKE and WORKED=END-START only from GitHub server timestamps.