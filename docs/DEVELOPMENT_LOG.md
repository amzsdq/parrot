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
- Shorter packages are exceptions only when the next meaningful step is inherently short or externally gated (for example: a brief test, observation window, CI/result wait, or a task that cannot be safely decomposed/extended with adjacent useful work).
- Every package under 14 minutes MUST set SHORT_PACKAGE_REASON to a concrete reason. Do not use convenience, checkpoint completion, or a small subtask boundary as justification.
- Never idle or pad merely to hit 14 minutes. If a 14-minute package finishes early, continue directly related safe useful work from the baton/package scope when available.

CURRENT_TASK=
Close the v0.8.6 repository source-of-truth gap around popup.js, then use remaining package capacity to begin the next missing exact source migration.

NEXT_ACTION=
1. Compare artifact `popup.js` vs repository `extension/popup.js` at byte/line level and identify the exact discrepancy.
2. Reconcile `extension/popup.js` to the artifact when feasible, then verify Git blob/content identity or record concrete normalization evidence if exact identity is connector-impossible.
3. If steps 1-2 finish materially before the 14-minute work package is exhausted, continue directly into exact migration of `background.js`.
4. Run targeted syntax/content verification for every file actually changed.
5. Before handoff, create the next baton with a preferred 14-minute useful-work package. Use a shorter interval only if an unavoidable short/external-gated step is genuinely next, and record SHORT_PACKAGE_REASON.
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
At wake, use the baton target as the continuation interval. Default/preferred NEXT_WAKE_DELAY_MINUTES is 14 because minimizing idle time is a primary relay objective. A value below 14 is allowed only for an inherently short or externally gated next step and MUST have SHORT_PACKAGE_REASON populated. Never shorten merely because a local subtask looks small.

MEASUREMENT_RULE=
Use amzsdq/parrot issue #1 [PARROT_RELAY_WORK_MARKERS]. GitHub comment created_at is the sole timing authority. Each actual wake records WAKE, START, END markers for one unique session. Official SESSION_ELAPSED=END-WAKE and WORKED=END-START. Final chat report must print raw UTC first, KST in parentheses, plus TARGET_ACTIVE_MINUTES and utilization. If authoritative timestamps are missing, print UNKNOWN; never estimate or substitute model/local time.

