# Parrot Baton

Latest-only continuation pointer; full snapshots are mirrored to `docs/DEVELOPMENT_LOG.md`.

CURRENT_VERSION=v0.8.7-reconstruction
STATUS=CONTINUE
WORK_PACKAGE_ID=PARROT-BATON-014
PACKAGE_KIND=LIFECYCLE_EDGE_AUDIT
EXPECTED_ACTIVE_MINUTES=14
NEXT_WAKE_DELAY_MINUTES=14
SHORT_PACKAGE_REASON=NONE
WORK_TIME_MARKER_ISSUE=amzsdq/parrot#1

CURRENT_TASK=
Audit and test lifecycle edge cases that can still cause duplicate sends, stale state, or unsafe routing before live-browser validation.

COMPLETED_PREVIOUS=
- Structural cooldown stack, route cooldown backpressure, popup exact safety repair, and dashboard cooldown diagnostics are implemented and regression-guarded.
- Dashboard active cooldown is operator-visible as structural kind/error + until timestamp and counts as attention; no chat prose is inspected.
- Route State Contract run 35970771375 passed all 22 functional/check steps including the dashboard cooldown contract.
- Added `docs/LIVE_SMOKE_CHECKLIST.md`, a non-fakeable real-browser gate covering unpacked load, exact target resolution, strong receipt, response/interval modes, COMPLETE, WAKE/MESSAGE, ambiguity fencing, non-destructive cooldown observation, and lifecycle/tab states.
- Smoke evidence rules explicitly forbid substituting static CI/mocks for browser proof and forbid persisting assistant/user prose. Cooldown may be NOT_OBSERVED rather than artificially inducing a rate limit.
- Final ZIP/release remains blocked on real browser smoke.

NEXT_ACTION=
1. Audit runner lifecycle on extension/content-script reload: determine whether targets persisted as `running` are automatically resumed or silently stranded; choose and test explicit behavior rather than accidental behavior.
2. Audit pause/resume/stop/delete transitions against in-memory runner tokens and storage changes. Ensure no runner can continue after stop/delete and define how resume re-arms a runner.
3. Audit COMPLETE interaction with running runners: completed target must not continue repeating after background marks it completed.
4. Audit closed/discarded/frozen target tabs and route retry cadence; verify no fallback selects the wrong ChatGPT conversation when exact target URL is absent.
5. Add behavioral tests/contracts for concrete lifecycle gaps found, then run full CI and inspect each step.
6. Keep selector live-validity and final release blocked until `docs/LIVE_SMOKE_CHECKLIST.md` is executed on a real unpacked-extension browser surface.

DONE_CRITERIA=
- persisted-running reload behavior is explicit and tested.
- pause/stop/delete/complete cannot leave a sending runner alive.
- exact-target routing cannot silently fall back to a different conversation.
- full static CI/integration/rebuildability remains green.
- next baton remains ~14 useful minutes unless genuinely externally gated.

DO_NOT_REPEAT=
- popup diagnosis/repair
- temporary privileged repair workflow
- dashboard cooldown work unless a regression is found
- static-CI-as-browser-proof claims
- semantic parsing of assistant/user prose

BLOCKER=
Real ChatGPT browser smoke requires an actual browser/extension execution surface and remains a release gate. Exact later v0.8.6 background/content/dashboard bytes remain unavailable, so reconstruction remains deliberately v0.8.7.

SCHEDULER_RULE=
Preferred/default NEXT_WAKE_DELAY_MINUTES=14. Shorter is exceptional and requires concrete unavoidable SHORT_PACKAGE_REASON.

MEASUREMENT_RULE=
Issue #1 WAKE/START/END comments + direct REST created_at are the sole timing authority.
