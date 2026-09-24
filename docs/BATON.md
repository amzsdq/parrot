# Parrot Baton

Latest-only continuation pointer; full snapshots are mirrored to `docs/DEVELOPMENT_LOG.md`.

CURRENT_VERSION=v0.8.7-reconstruction
STATUS=CONTINUE
WORK_PACKAGE_ID=PARROT-BATON-010
PACKAGE_KIND=COOLDOWN_COMPAT_AND_BROWSER_GATE
EXPECTED_ACTIVE_MINUTES=14
NEXT_WAKE_DELAY_MINUTES=14
SHORT_PACKAGE_REASON=NONE
WORK_TIME_MARKER_ISSUE=amzsdq/parrot#1

CURRENT_TASK=
Harden the newly wired structural cooldown runtime against existing popup storage semantics, then pursue the highest-value real-browser release evidence available.

COMPLETED_PREVIOUS=
- `chatgpt-adapter.js` now exposes `classifyCooldown()` using structural selectors/attributes only; it does not inspect assistant/user message prose or node text for cooldown classification.
- `repeat-policy.js` now exposes `cooldownDue()` and `nextCooldown()` in addition to the 10→20→40→60 rate-limit and 2→5→10→20 transient ladders; interval eligibility now respects persisted cooldown deadlines.
- `content.js` now checks structural cooldown before sends, persists only kind/attempt/until/error code, blocks while cooldown is active, and clears cooldown state after a confirmed successful send.
- Added deterministic `test-chatgpt-adapter-structure.mjs`; a fake assistant message containing “Too many requests” alone is explicitly NOT classified as cooldown.
- CI now syntax-checks the adapter and runs the structural boundary test. Latest full Route State Contract job for integration guard revision completed all 21 functional/check steps successfully.
- Existing popup schema was inspected after integration. It already has `cooldownEnabled`, `cooldownStep`, and `cooldownUntil`; the new runtime currently uses `cooldownAttempt` rather than the legacy `cooldownStep`. This compatibility mismatch is known and must be normalized before release.
- No real ChatGPT browser smoke was claimed: this runtime has repository/Actions access but no attached interactive Chrome execution surface for loading the unpacked extension and exercising ChatGPT DOM.

NEXT_ACTION=
1. Normalize cooldown storage semantics: honor `cooldownEnabled === false` in both response and interval runners; choose one canonical attempt field (prefer compatibility with existing `cooldownStep`) and migrate/read legacy/new field safely. Ensure popup disable/start/stop resets the same canonical cooldown fields used by content runtime.
2. Add deterministic storage-transition tests covering disabled cooldown, first/second ladder attempts, due gating, success reset, and legacy-field migration. Do not weaken the structural-only boundary test.
3. Re-run the full Route State Contract workflow and inspect individual steps, not merely workflow existence.
4. Inspect dashboard presentation of cooldown/attention state and expose structural cooldown status without storing/rendering chat prose if a small coherent improvement fits the package.
5. Attempt real browser smoke only if an actual browser/extension execution surface is available. Required evidence: unpacked extension loads, target ChatGPT tab is found, composer/send strong receipt works, and one response or interval repeat completes. If unavailable, keep this as an explicit release blocker; never simulate it with static CI.
6. Do not generate a final release ZIP until browser smoke and cooldown compatibility gates pass.

DONE_CRITERIA=
- cooldownEnabled and cooldown attempt/reset fields are consistent across popup/content/repeat policy.
- deterministic cooldown storage/runtime tests and existing structural semantic-boundary tests pass.
- full CI/integration/rebuildability gates pass on the compatibility revision.
- browser smoke is either real and recorded or remains an explicit release blocker.
- next baton is another ~14 useful minutes unless genuinely externally gated.

DO_NOT_REPEAT=
- popup.js 53-byte diagnosis or unsafe whole-file replacement
- invented claim that static CI proves live ChatGPT DOM selectors
- semantic parsing of assistant/user prose for rate-limit detection
- duplicate prompt/repeat/route-state implementations
- treating prearm save as proof of successor wake

BLOCKER=
Real ChatGPT browser smoke remains a release gate and requires an actual browser/extension execution surface. Exact later v0.8.6 runtime bytes remain unavailable, so reconstruction remains deliberately v0.8.7.

SCHEDULER_RULE=
Preferred/default NEXT_WAKE_DELAY_MINUTES=14. Shorter is exceptional and requires concrete unavoidable SHORT_PACKAGE_REASON.

MEASUREMENT_RULE=
Issue #1 WAKE/START/END comments + direct REST created_at are the sole timing authority.
