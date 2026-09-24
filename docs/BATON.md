# Parrot Baton

Latest-only continuation pointer; full snapshots are mirrored to `docs/DEVELOPMENT_LOG.md`.

CURRENT_VERSION=v0.8.7-reconstruction
STATUS=CONTINUE
WORK_PACKAGE_ID=PARROT-BATON-013
PACKAGE_KIND=FINAL_STATIC_AUDIT_AND_SMOKE_PREP
EXPECTED_ACTIVE_MINUTES=14
NEXT_WAKE_DELAY_MINUTES=14
SHORT_PACKAGE_REASON=NONE
WORK_TIME_MARKER_ISSUE=amzsdq/parrot#1

CURRENT_TASK=
Audit the reconstructed v0.8.7 runtime for remaining static correctness gaps and prepare a precise real-browser smoke checklist/evidence format.

COMPLETED_PREVIOUS=
- Structural cooldown classification, repeat ladders, response/interval gating, popup-schema compatibility, routed-send cooldown backpressure, and popup numeric safety repair are implemented and regression-guarded.
- Exact repaired `popup.js` blob is `04b3a2b425f37ee33de2b7194bd7dbea8aaa93da`.
- Temporary privileged repair machinery was removed after successful exact repair.
- Dashboard now treats active cooldown as attention and shows structural cooldown kind/error code plus `cooldownUntil`; it does not inspect chat message DOM/prose for this diagnostic.
- Cooldown contract test now guards dashboard structural diagnostics in addition to popup clamps, runner storage compatibility, and route backpressure.
- Route State Contract run 35970752260 passed all 22 functional/check steps after the dashboard runtime change; the subsequent contract-only guard run is expected to verify the same diagnostic seam.
- README records current cooldown behavior, expanded verification commands, and repaired popup provenance.
- Real ChatGPT browser smoke remains unverified because this runtime has no interactive unpacked-extension Chrome execution surface.

NEXT_ACTION=
1. Audit background/content/dashboard/popup interactions for state-field drift, stale statuses, and lifecycle edge cases: pause/resume, stop, completion, cooldown expiry, target deletion, closed/discarded/frozen tabs, ambiguous route retry/resolve, and runner restart after extension reload.
2. Add only high-value deterministic tests for concrete gaps found. Prefer behavioral primitives/contracts over brittle source-string checks when feasible.
3. Review structural cooldown selector candidates and clearly separate observed/stable selectors from speculative fallbacks. Do not claim a selector is live-valid without browser evidence.
4. Write/refresh a concise real-browser smoke checklist with exact pass/fail evidence required for unpacked load, target resolution, send strong receipt, response mode, interval mode, COMPLETE/WAKE/MESSAGE routing, ambiguity handling, and non-destructive cooldown observation.
5. Re-run full CI and inspect individual steps. Keep final ZIP/release blocked until browser smoke passes.
6. If an actual Chrome/extension execution surface becomes available, execute the smoke checklist rather than doing more static speculation.

DONE_CRITERIA=
- remaining static lifecycle gaps are either fixed/tested or explicitly recorded.
- live-browser smoke checklist is concrete and non-fakeable.
- full static CI/integration/rebuildability is green.
- browser smoke is either real and recorded or explicitly remains the release blocker.
- next baton remains ~14 useful minutes unless genuinely externally gated.

DO_NOT_REPEAT=
- popup 53-byte diagnosis/repair
- temporary privileged repair workflow
- static-CI-as-browser-proof claims
- semantic parsing of assistant/user prose
- scheduler-prearm-as-successor-wake claims

BLOCKER=
Real ChatGPT browser smoke requires an actual browser/extension execution surface and remains a release gate. Exact later v0.8.6 background/content/dashboard bytes remain unavailable, so reconstruction remains deliberately v0.8.7.

SCHEDULER_RULE=
Preferred/default NEXT_WAKE_DELAY_MINUTES=14. Shorter is exceptional and requires concrete unavoidable SHORT_PACKAGE_REASON.

MEASUREMENT_RULE=
Issue #1 WAKE/START/END comments + direct REST created_at are the sole timing authority.
