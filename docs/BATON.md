# Parrot Baton

Latest-only continuation pointer; full snapshots are mirrored to `docs/DEVELOPMENT_LOG.md`.

CURRENT_VERSION=v0.8.7-reconstruction
STATUS=CONTINUE
WORK_PACKAGE_ID=PARROT-BATON-011
PACKAGE_KIND=RELEASE_GATE_HARDENING
EXPECTED_ACTIVE_MINUTES=14
NEXT_WAKE_DELAY_MINUTES=14
SHORT_PACKAGE_REASON=NONE
WORK_TIME_MARKER_ISSUE=amzsdq/parrot#1

CURRENT_TASK=
Close the remaining static release gaps that can be proven without a live browser, while keeping real ChatGPT smoke as a separate non-fakeable gate.

COMPLETED_PREVIOUS=
- Structural cooldown classification is implemented without reading assistant/user prose; deterministic boundary test proves assistant text alone cannot trigger cooldown.
- Repeat policy exposes rate-limit 10→20→40→60 and transient 2→5→10→20 ladders plus due/next transition helpers.
- Response and interval runners now honor `cooldownEnabled`; disabled targets bypass cooldown classification and stale cooldown state is cleared.
- Existing popup `cooldownStep` is now the canonical attempt counter. Runtime reads legacy/new attempt state for migration compatibility, writes `cooldownStep`, and clears it on confirmed success.
- Added `test-cooldown-storage-contract.mjs` and wired it into CI alongside adapter structural-boundary testing.
- Routed WAKE/MESSAGE sends now share target cooldown backpressure: background imports repeat policy, skips tab dispatch while target cooldown is active, persists structural cooldown returned by content, and clears cooldown after confirmed routed delivery.
- Full Route State Contract run 35970470639 passed all 22 functional/check steps including syntax, route/signal/prompt/repeat tests, structural cooldown test, storage/backpressure contract, integration guard, and rebuildability.
- README now documents cooldown semantics and the expanded verification suite.
- Real ChatGPT browser smoke is still NOT claimed; no interactive unpacked-extension Chrome surface is attached to this runtime.

NEXT_ACTION=
1. Repair the known four numeric clamp/default regressions in `popup.js` using a safe exact method; verify resulting content against the recovered target expectations instead of doing unsafe whole-file replacement. Preserve all newer intentional popup behavior if byte-exact target replacement would discard it; if so, treat v0.8.7 semantics as authoritative and add explicit regression tests for the clamps.
2. Strengthen deterministic tests around popup start/stop/disable cooldown resets and content success reset. Remove legacy `cooldownAttempt` only when migration behavior is proven safe for already-stored targets.
3. Inspect dashboard cooldown/attention presentation; add a compact structural cooldown indicator/countdown only if it improves operator diagnosis without chat semantic content.
4. Re-run full CI and inspect every step after any release-gate changes.
5. Attempt real browser smoke only if an actual Chrome/extension execution surface becomes available. Required evidence remains: unpacked extension load, exact target tab resolution, composer/send strong receipt, one response or interval repeat, and no semantic-content monitoring. Never substitute static CI for this gate.
6. Do not generate/finalize release ZIP until the static popup gate and real browser gate are both satisfied.

DONE_CRITERIA=
- popup numeric safety regression is repaired and regression-tested without losing intentional v0.8.7 behavior.
- cooldown reset/migration semantics have deterministic coverage.
- full CI/integration/rebuildability remains green.
- browser smoke is either real and recorded or explicitly remains the release blocker.
- next baton remains ~14 useful minutes unless genuinely externally gated.

DO_NOT_REPEAT=
- unsafe whole-file popup replacement
- invented claim that static CI proves live ChatGPT selectors
- semantic parsing of assistant/user prose for rate-limit detection
- duplicate prompt/repeat/route-state implementations
- treating scheduler prearm save as proof of successor wake

BLOCKER=
Real ChatGPT browser smoke requires an actual browser/extension execution surface and remains a release gate. Exact later v0.8.6 runtime bytes remain unavailable, so reconstruction remains deliberately v0.8.7.

SCHEDULER_RULE=
Preferred/default NEXT_WAKE_DELAY_MINUTES=14. Shorter is exceptional and requires concrete unavoidable SHORT_PACKAGE_REASON.

MEASUREMENT_RULE=
Issue #1 WAKE/START/END comments + direct REST created_at are the sole timing authority.
