# Parrot Baton

Latest-only continuation pointer; full snapshots are mirrored to `docs/DEVELOPMENT_LOG.md`.

CURRENT_VERSION=v0.8.7-reconstruction
STATUS=CONTINUE
WORK_PACKAGE_ID=PARROT-BATON-019
PACKAGE_KIND=LIFECYCLE_RACE_HARNESS_AND_EXACT_HEAD_VERIFICATION
MILESTONE_ID=M2
MILESTONE_PHASE=BUILD
ACTIVE_CRITERION=M2-C6
EXPECTED_ACTIVE_MINUTES=14
NEXT_WAKE_DELAY_MINUTES=14
SHORT_PACKAGE_REASON=NONE
WORK_TIME_MARKER_ISSUE=amzsdq/parrot#1

MILESTONE_SOURCE=docs/MILESTONES.md
MILESTONE_RULE=BATON is a bounded execution slice derived from the first unmet milestone criterion; BATON completion never implies milestone completion.

CURRENT_TASK=
Close M2-C6 with deterministic evidence for startup/storage/manual-start arbitration, then verify the newest response-delay repair at exact head and advance M2-C8 if green.

COMPLETED_PREVIOUS=
- Verified prior exact-head Route State Contract run 35974755563 for commit 6c8570b74d7322655c7f81031d521232e9512cbf: completed/success and every listed step passed, including syntax, route/signal/prompt/repeat/runner policy, cooldown storage, v0.8.7 integration guard, and rebuildability.
- Audited popup start ordering and found a real M2-C7 defect: `persist()` could trigger content `storage.onChanged`, which auto-armed a running response target with delay 0 before popup's explicit `PARROT_START` carrying `delaySec`.
- Added `ParrotRunnerPolicy.autoArmDelayMs(target)` and changed storage/reload auto-arm to use it. Response mode now preserves configured `delaySec`; interval auto-arm remains delay 0 because interval due logic controls dispatch.
- Extended runner-policy tests for response delay, zero/negative clamp, and interval behavior. Existing `shouldArm()` still refuses response auto-arm when `sendImmediately=false`.
- Updated docs/MILESTONES.md: M2-C7 PASS; M2-C6 remains UNVERIFIED until a deterministic race harness proves single effective runner under overlapping storage/manual/startup paths; M2-C8 remains UNVERIFIED until exact-head CI passes after newest changes.

NEXT_ACTION=
1. Build a small deterministic lifecycle/arbitration primitive or harness that exercises overlapping storage auto-arm + explicit `PARROT_START` + startup/reload attempts without a large DOM mock. Require exactly one effective runner token per target/mode.
2. Cover mode transition fencing and stale-token cleanup in the same harness if it stays small; otherwise keep existing mode-transition evidence and focus M2-C6 on duplicate arbitration.
3. Inspect exact-head CI for the newest commits (`341b2307`, `c45372e1`, `eed0bfa5`, milestone commit `65faead0` plus this baton commit lineage). Any failure must be fixed rather than weakening tests.
4. If M2-C6 deterministic evidence and exact-head CI both pass, mark M2 DONE and advance to earliest unmet M3 criterion. If CI is still running, continue useful independent harness/UX fixture work rather than idling.
5. Preserve real Chromium + ChatGPT smoke as M6; static/deterministic evidence is not browser proof.

DONE_CRITERIA=
- deterministic evidence proves storage/manual/startup overlap cannot create more than one effective runner for one target.
- response initial delay and sendImmediately=false semantics remain regression-covered.
- newest exact-head CI is green or an exact failure/blocker is recorded.
- M2 statuses are updated honestly; UNVERIFIED is never promoted without evidence.
- next baton remains ~14 useful minutes unless genuinely externally gated.

DO_NOT_REPEAT=
- popup 53-byte diagnosis/repair
- wrong-tab fallback
- static-CI-as-browser-proof claims
- semantic chat parsing
- claim that `runners.has()` source inspection alone is deterministic race evidence

BLOCKER=
Real ChatGPT browser smoke requires an actual browser/extension execution surface and remains M6 release gate. It does not block deterministic M2 lifecycle verification.

SCHEDULER_RULE=
Preferred/default NEXT_WAKE_DELAY_MINUTES=14. Shorter is exceptional and requires concrete unavoidable SHORT_PACKAGE_REASON.

MEASUREMENT_RULE=
Issue #1 WAKE/START/END comments + direct REST created_at are the sole timing authority.
