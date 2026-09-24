# Parrot Baton

Latest-only continuation pointer; full snapshots are mirrored to `docs/DEVELOPMENT_LOG.md`.

CURRENT_VERSION=v0.8.7-reconstruction
STATUS=CONTINUE
WORK_PACKAGE_ID=PARROT-BATON-016
PACKAGE_KIND=RUNNER_ARMING_AND_RELOAD
EXPECTED_ACTIVE_MINUTES=14
NEXT_WAKE_DELAY_MINUTES=14
SHORT_PACKAGE_REASON=NONE
WORK_TIME_MARKER_ISSUE=amzsdq/parrot#1

CURRENT_TASK=
Fix interval arming and persisted-running reload behavior without creating duplicate runners or cross-conversation sends.

COMPLETED_PREVIOUS=
- Exact-target routing bug is fixed: background normalizes target/tab URLs and requires an exact normalized match. The previous same-origin `|| tabs[0]` fallback is removed.
- CI contract explicitly rejects `||tabs[0]` and requires normalized exact target selection. Route State Contract run 35970974030 passed all 22 functional/check steps after the fix.
- Popup lifecycle UI has Start / Pause / Stop but no separate Resume action. Start creates a new runId and resets counters/state; Pause is therefore not currently an explicit resumable-run UX contract.
- Storage changes already remove in-memory runner tokens when a target becomes non-running, so pause/stop/delete/COMPLETE can fence an existing loop. The missing side is deterministic arming/re-arming.

NEXT_ACTION=
1. FIX INTERVAL START: popup currently sends `PARROT_START` only for response mode with `sendImmediately`; interval Start can persist `status=running` without creating a runner. Add a deterministic arming path for interval mode.
2. FIX RELOAD RESUME: on content-script startup, inspect persisted running targets and arm only the target(s) whose normalized URL exactly matches the current ChatGPT conversation. Use `runners.has` fencing so explicit `PARROT_START` and storage-triggered arming cannot duplicate a runner.
3. Define response `sendImmediately=false` semantics explicitly; do not accidentally auto-send it during generic reload recovery.
4. On `chrome.storage.onChanged`, after removing non-running tokens, arm newly-running matching targets only when mode semantics permit. Never arm targets for another conversation URL.
5. Add deterministic lifecycle tests/contracts for interval Start, reload matching, duplicate fence, stop/delete/complete non-rearm, and no cross-URL arming. Run full CI and inspect each step.
6. Keep final release blocked until `docs/LIVE_SMOKE_CHECKLIST.md` executes on a real browser surface.

DONE_CRITERIA=
- interval Start arms exactly one runner.
- persisted-running reload behavior is explicit, exact-URL-scoped, and duplicate-fenced.
- response sendImmediately=false is not accidentally converted to auto-send.
- non-running/deleted/completed targets cannot be re-armed.
- full static CI/integration/rebuildability is green.
- next baton remains ~14 useful minutes unless genuinely externally gated.

DO_NOT_REPEAT=
- wrong-tab fallback (fixed and guarded)
- popup diagnosis/repair
- cooldown/dashboard work unless regression found
- static-CI-as-browser-proof claims
- semantic parsing of assistant/user prose

BLOCKER=
Real ChatGPT browser smoke requires an actual browser/extension execution surface and remains a release gate. Exact later v0.8.6 background/content/dashboard bytes remain unavailable, so reconstruction remains deliberately v0.8.7.

SCHEDULER_RULE=
Preferred/default NEXT_WAKE_DELAY_MINUTES=14. Shorter is exceptional and requires concrete unavoidable SHORT_PACKAGE_REASON.

MEASUREMENT_RULE=
Issue #1 WAKE/START/END comments + direct REST created_at are the sole timing authority.
