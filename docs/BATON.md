# Parrot Baton

Latest-only continuation pointer; full snapshots are mirrored to `docs/DEVELOPMENT_LOG.md`.

CURRENT_VERSION=v0.8.7-reconstruction
STATUS=CONTINUE
WORK_PACKAGE_ID=PARROT-BATON-015
PACKAGE_KIND=LIFECYCLE_CORRECTNESS_FIXES
EXPECTED_ACTIVE_MINUTES=14
NEXT_WAKE_DELAY_MINUTES=14
SHORT_PACKAGE_REASON=NONE
WORK_TIME_MARKER_ISSUE=amzsdq/parrot#1

CURRENT_TASK=
Fix three concrete lifecycle/routing correctness gaps found by static audit before doing further feature work.

COMPLETED_PREVIOUS=
- Structural cooldown stack, route backpressure, exact popup repair, dashboard cooldown diagnostics, and non-fakeable live smoke checklist are implemented/recorded.
- Full static CI remained green through dashboard cooldown diagnostic + contract coverage.
- Lifecycle audit found concrete failures rather than merely adding speculative tests.

NEXT_ACTION=
1. FIX INTERVAL START: current popup explicitly sends `PARROT_START` only for response mode with `sendImmediately`; content storage listener only removes stopped runners and never starts interval runners. Therefore a newly started interval target can remain `running` in storage with no runner. Add one deterministic arming path for both modes without duplicate-runner races.
2. FIX RELOAD RESUME: current content startup only flushes ambiguity outbox; persisted targets with `status=running` are not re-armed after content-script/extension reload. Define intentional resume semantics and auto-arm only targets whose normalized URL matches the current ChatGPT conversation, using existing runner fencing.
3. FIX WRONG-TAB FALLBACK: background route dispatch currently uses `tabs.find(c => c.url === target.url) || tabs[0]`. If the exact target conversation is closed but another ChatGPT tab on the same origin is open, this can route to the wrong conversation. Remove fallback-to-first-tab; normalized exact target match is mandatory and absence returns `target_tab_not_open`.
4. Verify pause/stop/delete/COMPLETE storage changes terminate in-memory runner tokens and cannot be immediately auto-rearmed.
5. Add deterministic lifecycle contracts/tests for all three fixes, then run full CI and inspect each step.
6. Keep final release blocked until `docs/LIVE_SMOKE_CHECKLIST.md` executes on a real browser surface.

DONE_CRITERIA=
- interval Start deterministically arms exactly one interval runner.
- reload resume behavior is explicit, URL-scoped, and duplicate-fenced.
- route delivery cannot fall back to a different ChatGPT conversation.
- stop/pause/delete/complete cannot leave or recreate a sending runner.
- full static CI/integration/rebuildability is green.
- next baton remains ~14 useful minutes unless genuinely externally gated.

DO_NOT_REPEAT=
- popup diagnosis/repair
- cooldown/dashboard work unless a regression is found
- static-CI-as-browser-proof claims
- semantic parsing of assistant/user prose
- wrong-tab fallback behavior

BLOCKER=
Real ChatGPT browser smoke requires an actual browser/extension execution surface and remains a release gate. Exact later v0.8.6 background/content/dashboard bytes remain unavailable, so reconstruction remains deliberately v0.8.7.

SCHEDULER_RULE=
Preferred/default NEXT_WAKE_DELAY_MINUTES=14. Shorter is exceptional and requires concrete unavoidable SHORT_PACKAGE_REASON.

MEASUREMENT_RULE=
Issue #1 WAKE/START/END comments + direct REST created_at are the sole timing authority.
