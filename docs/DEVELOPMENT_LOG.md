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
