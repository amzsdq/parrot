# Parrot Baton

Latest-only continuation pointer; full snapshots are mirrored to `docs/DEVELOPMENT_LOG.md`.

CURRENT_VERSION=v0.8.7-reconstruction
STATUS=CONTINUE
WORK_PACKAGE_ID=PARROT-BATON-012
PACKAGE_KIND=OPERATOR_DIAGNOSTICS_AND_RELEASE_EVIDENCE
EXPECTED_ACTIVE_MINUTES=14
NEXT_WAKE_DELAY_MINUTES=14
SHORT_PACKAGE_REASON=NONE
WORK_TIME_MARKER_ISSUE=amzsdq/parrot#1

CURRENT_TASK=
Improve operator-visible structural cooldown diagnostics and tighten remaining release evidence without pretending static checks are live-browser proof.

COMPLETED_PREVIOUS=
- Structural cooldown classification, repeat cooldown ladders, response/interval gating, popup-schema compatibility, and routed-send cooldown backpressure are implemented.
- `cooldownEnabled=false` is honored by target runners; canonical persisted attempt field is existing `cooldownStep`, with legacy `cooldownAttempt` read compatibility.
- CI includes structural semantic-boundary and cooldown storage/backpressure contracts.
- Exact popup numeric safety repair completed through a guarded one-shot repair: source occurrence counts were checked, the resulting Git blob was required to equal `04b3a2b425f37ee33de2b7194bd7dbea8aaa93da`, and `node --check` passed before commit.
- Repository `extension/popup.js` now actually reports blob `04b3a2b425f37ee33de2b7194bd7dbea8aaa93da`; four clamps are restored: delay ≥0, interval ≥1/default11, maxRepeats ≥0, runtimeMin ≥0.
- CI now regression-checks those four clamps. Route State Contract run 35970616840 passed after the exact popup repair and guard addition.
- The temporary write-enabled one-shot repair workflow and consumed repair helper were removed after successful use, leaving no unnecessary persistent privileged repair path.
- README provenance was updated to record the exact repaired popup blob.
- Real ChatGPT browser smoke remains honestly unverified because this runtime has no interactive unpacked-extension Chrome execution surface.

NEXT_ACTION=
1. Inspect dashboard worker columns and add a compact structural cooldown diagnostic (kind + remaining/until) only if it improves operator diagnosis without chat prose. Keep `lastError` structural/code-only.
2. Strengthen cooldown reset/migration tests, especially popup disable/start/stop and content success reset; eliminate legacy `cooldownAttempt` writes entirely if Chrome storage compatibility permits, retaining read-only migration fallback as needed.
3. Audit current v0.8.7 static release gates for false-positive claims: selector candidates that have not been live-observed must remain marked unverified, and no CI result may be described as browser proof.
4. Re-run full CI and inspect individual steps after changes.
5. If an actual browser/extension execution surface becomes available, run focused ChatGPT smoke: unpacked load, exact target tab resolution, composer/send strong receipt, one response or interval repeat, and cooldown selector observation if naturally available. Do not induce destructive rate limits merely to test cooldown.
6. Final release ZIP remains gated on real browser smoke; do not mark PROGRAM_COMPLETE before that evidence exists.

DONE_CRITERIA=
- operator cooldown state is diagnosable without semantic chat content or the change is explicitly rejected as low-value.
- cooldown reset/migration semantics have stronger deterministic coverage.
- full static CI/integration/rebuildability remains green.
- browser smoke is either real and recorded or explicitly remains the release blocker.
- next baton remains ~14 useful minutes unless genuinely externally gated.

DO_NOT_REPEAT=
- popup 53-byte diagnosis or popup repair (now closed and regression-guarded)
- temporary privileged repair workflow (removed after use)
- invented claim that static CI proves live ChatGPT selectors
- semantic parsing of assistant/user prose for rate-limit detection
- treating scheduler prearm save as proof of successor wake

BLOCKER=
Real ChatGPT browser smoke requires an actual browser/extension execution surface and remains a release gate. Exact later v0.8.6 background/content/dashboard bytes remain unavailable, so reconstruction remains deliberately v0.8.7.

SCHEDULER_RULE=
Preferred/default NEXT_WAKE_DELAY_MINUTES=14. Shorter is exceptional and requires concrete unavoidable SHORT_PACKAGE_REASON.

MEASUREMENT_RULE=
Issue #1 WAKE/START/END comments + direct REST created_at are the sole timing authority.
