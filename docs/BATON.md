# Parrot Baton

Latest-only continuation pointer; full snapshots are mirrored to `docs/DEVELOPMENT_LOG.md`.

CURRENT_VERSION=v0.8.7-reconstruction
STATUS=CONTINUE
WORK_PACKAGE_ID=PARROT-BATON-018
PACKAGE_KIND=LIFECYCLE_RACE_VERIFICATION_AND_CANDIDATE_BUILD
EXPECTED_ACTIVE_MINUTES=14
NEXT_WAKE_DELAY_MINUTES=14
SHORT_PACKAGE_REASON=NONE
WORK_TIME_MARKER_ISSUE=amzsdq/parrot#1

CURRENT_TASK=
Harden the newly wired runner lifecycle against startup/storage/manual-start races, then prepare a repository-only v0.8.7 candidate build if deterministic verification remains green.

COMPLETED_PREVIOUS=
- Wired `ParrotRunnerPolicy.shouldArm(target, location.href)` into content startup after durable ambiguity recovery and into `chrome.storage.onChanged` target reconciliation.
- Automatic arming is exact-normalized-URL only; interval running targets auto-arm; response targets auto-arm only when `sendImmediately!==false`.
- Deleted/non-running targets prune active runner tokens.
- Added `runnerModes` fencing plus token-aware `finally` cleanup so response↔interval mode transitions invalidate the old runner without allowing stale cleanup to delete its replacement.
- Existing `runners.has()` remains the duplicate fence when explicit `PARROT_START` and storage-driven arming overlap.
- Route State Contract run 35974714130 on commit 8e647da7e86e5b83450edea16e736242114e453d passed syntax, route/signal/prompt/repeat/runner tests, contract validation, v0.8.7 integration guard, and rebuildability.
- Extended integration guard to require runner mode-transition fencing at commit 6c8570b74d7322655c7f81031d521232e9512cbf; exact-head CI was queued during handoff and must be checked before treating that guard commit as verified.
- Refreshed `docs/DEVELOPMENT_CHECKPOINT.md` to current v0.8.7 reconstruction state and open release gates.

NEXT_ACTION=
1. Check exact-head CI for `6c8570b74d7322655c7f81031d521232e9512cbf` and inspect all steps; fix any failure rather than weakening the guard.
2. Add deterministic lifecycle coverage for storage-driven startup/reload recovery, duplicate explicit `PARROT_START` + storage arming, running mode transition, deleted/non-running pruning, cross-URL refusal, and response `sendImmediately=false` automatic refusal. Prefer a small testable lifecycle primitive/harness over a large DOM mock.
3. Audit popup `startTarget()` ordering against Chrome storage `onChanged` + `tabs.sendMessage()`. Preserve intended initial delay semantics and ensure only one effective runner. If explicit `PARROT_START` is redundant for interval mode, simplify only with evidence; do not introduce a second lifecycle authority.
4. Run full CI after changes and inspect exact-head results.
5. If static/deterministic gates remain green, build or prepare the repository-only v0.8.7 candidate ZIP path and verify ZIP contents/rebuildability. Do not call it release-ready without real-browser smoke.
6. Keep `docs/LIVE_SMOKE_CHECKLIST.md` as the real Chromium + ChatGPT release gate; static CI is not browser proof.

DONE_CRITERIA=
- exact-head CI for the current lifecycle implementation is green.
- startup/storage/manual-start and mode-transition race semantics have deterministic regression evidence.
- initial delay / `sendImmediately=false` behavior is not accidentally changed by storage auto-arm.
- repository-only candidate build path is verified or left with an exact blocker.
- real-browser smoke remains explicitly open until actually executed.

DO_NOT_REPEAT=
- claim runner-policy existence alone fixes runtime
- wrong-tab fallback
- popup clamp diagnosis/repair
- static-CI-as-browser-proof claims
- semantic chat parsing
- copying v0.8.0 background/content/dashboard and labeling them v0.8.6

BLOCKER=
Real ChatGPT browser smoke requires an actual browser/extension execution surface and remains a release gate. Exact later v0.8.6 background/content/dashboard bytes remain unavailable, so reconstruction remains deliberately v0.8.7.

SCHEDULER_RULE=
Preferred/default NEXT_WAKE_DELAY_MINUTES=14. Shorter is exceptional and requires concrete unavoidable SHORT_PACKAGE_REASON.

MEASUREMENT_RULE=
Issue #1 WAKE/START/END comments + direct REST created_at are the sole timing authority.
