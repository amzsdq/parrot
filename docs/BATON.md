# Parrot Baton

Latest-only continuation pointer; full snapshots are mirrored to `docs/DEVELOPMENT_LOG.md`.

CURRENT_VERSION=v0.8.7-reconstruction
STATUS=CONTINUE
WORK_PACKAGE_ID=PARROT-BATON-017
PACKAGE_KIND=RUNNER_POLICY_INTEGRATION
EXPECTED_ACTIVE_MINUTES=14
NEXT_WAKE_DELAY_MINUTES=14
SHORT_PACKAGE_REASON=NONE
WORK_TIME_MARKER_ISSUE=amzsdq/parrot#1

CURRENT_TASK=
Wire the now-tested runner arming policy into content runtime to fix interval Start and exact-URL reload recovery without duplicate runners.

COMPLETED_PREVIOUS=
- Wrong-tab route fallback is fixed and CI-guarded; exact normalized target URL is mandatory.
- Added pure `runner-policy.js` with `normalizeUrl()` and `shouldArm(target,currentUrl)`: only status=running + exact normalized URL; interval=true; response=true only when `sendImmediately!==false`; paused/completed/cross-URL=false.
- Added deterministic `test-runner-policy.mjs` vectors for interval, response immediate/non-immediate, paused, completed, cross-URL, and query/hash normalization.
- CI now syntax-checks and runs runner policy tests. Route State Contract run 35971065641 passed all 24 functional/check steps.
- Manifest now loads `runner-policy.js` before `content.js`; policy is ready to wire but content runtime has NOT yet been changed to use it. Do not falsely mark interval/reload fixed yet.

NEXT_ACTION=
1. In content runtime, add one `armMatchingRunningTargets()` path using `ParrotRunnerPolicy.shouldArm(target, location.href)` and existing `startRunner()` fence.
2. Call it once at content startup after durable ambiguity recovery and on relevant `chrome.storage.onChanged` transitions. Existing `runners.has` must prevent explicit PARROT_START + storage arming duplicates.
3. Ensure non-running/deleted/completed targets first remove runner tokens and are never re-armed. Response `sendImmediately=false` must remain unarmed by automatic policy.
4. Decide whether popup should explicitly send `PARROT_START` for interval mode after generic storage arming exists; prefer one canonical arming path and keep explicit message only if it materially improves deterministic startup without duplicate semantics.
5. Extend integration/lifecycle contract to require runner-policy load-before-content and actual content usage, then run full CI and inspect every step.
6. Keep final release blocked until `docs/LIVE_SMOKE_CHECKLIST.md` executes on a real browser surface.

DONE_CRITERIA=
- interval Start creates exactly one runner.
- running exact-URL target recovers after content reload.
- cross-URL/non-running/completed/sendImmediately=false targets do not auto-arm.
- duplicate arming is fenced.
- full static CI/integration/rebuildability is green.
- next baton remains ~14 useful minutes unless genuinely externally gated.

DO_NOT_REPEAT=
- claim runner-policy existence alone fixes runtime (it is not wired yet)
- wrong-tab fallback
- popup diagnosis/repair
- static-CI-as-browser-proof claims
- semantic chat parsing

BLOCKER=
Real ChatGPT browser smoke requires an actual browser/extension execution surface and remains a release gate. Exact later v0.8.6 background/content/dashboard bytes remain unavailable, so reconstruction remains deliberately v0.8.7.

SCHEDULER_RULE=
Preferred/default NEXT_WAKE_DELAY_MINUTES=14. Shorter is exceptional and requires concrete unavoidable SHORT_PACKAGE_REASON.

MEASUREMENT_RULE=
Issue #1 WAKE/START/END comments + direct REST created_at are the sole timing authority.
