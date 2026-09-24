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
