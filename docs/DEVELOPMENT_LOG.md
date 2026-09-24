# Parrot Development Log

Append-only relay history. Each completed wake appends the full BATON snapshot that it hands to the next wake.
Do not use this file as the immediate continuation pointer; `docs/BATON.md` is authoritative for the latest baton.

## BATON SNAPSHOT — PARROT-BATON-001

Historical snapshot retained. See repository history for full content.

## BATON SNAPSHOT — PARROT-BATON-001R1

Historical snapshot retained. See repository history for full content.

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
5. Run syntax/content verification for every changed runtime file.
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
