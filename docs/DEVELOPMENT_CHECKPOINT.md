# Parrot development checkpoint

Status: CONTINUE
Current line: v0.8.7-reconstruction

## Milestone execution model

- `docs/MILESTONES.md` is the durable program-level work supply above BATON.
- The relay uses `CONTRACT -> BUILD -> EVALUATE -> FIX -> DONE`.
- Criteria are recorded as PASS / FAIL / UNVERIFIED; UNVERIFIED is never treated as PASS.
- `docs/BATON.md` remains the latest-only ~14-minute tactical slice, but every baton must identify `MILESTONE_ID`, `MILESTONE_PHASE`, and `ACTIVE_CRITERION` and be derived from the earliest unmet required milestone criterion.
- Finishing one baton is not a stop condition. If a criterion finishes early, continue to the next criterion/milestone while useful work remains.
- No separate mutable `STATE.json` is introduced because BATON + MILESTONES + DEVELOPMENT_CHECKPOINT already cover immediate, program, and durable-summary state; duplicating mutable state would increase reconciliation risk.

## Relay / evidence model

- `docs/BATON.md` is latest-only and is read first on every wake.
- `docs/DEVELOPMENT_LOG.md` is append-only full baton history.
- Normal package target is ~14 useful active minutes; shorter packages require a concrete unavoidable `SHORT_PACKAGE_REASON`.
- Issue #1 `[PARROT_RELAY_WORK_MARKERS]` WAKE/START/END comments are the sole timing authority. Fetch the concrete comment REST resource when connector comment listings omit `created_at`.

## Current implementation state

The repository is now deliberately reconstructing the missing later runtime as v0.8.7 rather than claiming byte-exact v0.8.6 source.

Verified/implemented:

- ChatGPT-first provider boundary; Claude/Gemini/Grok implementations remain out of scope.
- Dashboard supports scalable worker labels A…Z, AA…, cross-tab control, pagination, and structural fleet states.
- Exact normalized target URL is mandatory for routing; the unsafe same-origin `tabs[0]` fallback was removed and CI-guarded.
- Strong structural delivery receipt uses user-message count / generation evidence rather than semantic chat parsing.
- Ambiguous delivery is persisted before notification, fenced from automatic retry, and exposed through explicit Retry/Resolve flows.
- COMPLETE / WAKE / MESSAGE use structural `parrot.invalid` signal links with durable signal-id dedupe.
- Prompt composition is separated into `prompt-compose.js`.
- Repeat/cooldown policy is separated into `repeat-policy.js`; rate-limit ladder is 10→20→40→60 minutes and transient ladder is 2→5→10→20 minutes.
- Popup numeric clamps/defaults were restored to the recovered authoritative popup target blob `04b3a2b425f37ee33de2b7194bd7dbea8aaa93da`.
- `runner-policy.js` defines exact-URL automatic arming: running interval targets auto-arm; running response targets auto-arm only when `sendImmediately !== false`; paused/stopped/completed/cross-URL targets do not.
- Content runtime now consumes `ParrotRunnerPolicy.shouldArm()` on startup after ambiguity recovery and on target storage changes. Existing `runners.has()` fences duplicate explicit `PARROT_START` + storage arming.
- Content runtime prunes deleted/non-running targets and now tracks runner mode separately so a running response↔interval mode transition fences the old token and arms the new mode without allowing the old runner to delete the replacement.
- Runner loops use token-aware `finally` cleanup so thrown failures do not permanently strand a runner id.

## Latest verification evidence

- Commit `8e647da7e86e5b83450edea16e736242114e453d` (`Fence runner mode transitions`) passed Route State Contract run `35974714130`.
- That run passed syntax checks for runtime modules plus route-state, route-queue, signal, prompt, repeat, runner-policy, adapter-structure, cooldown-storage, contract validation, v0.8.7 integration validation, and repository rebuildability checks.
- `scripts/validate-v087-integration.mjs` additionally guards actual runner-policy use, storage reconciliation, startup-after-ambiguity ordering, and runner mode fencing. The guard itself is committed at `6c8570b74d7322655c7f81031d521232e9512cbf`; its exact-head CI must be checked before claiming that last guard commit verified.

## Recovered baseline evidence

Recovered Library `parrot_extension_v0.8.0.zip` SHA-256: `4c9d27a0e866fe60802f19717a962034dbfc7c1ba873d116359e4566075dc1ef`.

Important Git blobs:

- v0.8.0 `background.js`: `c32103090f349f3397ea489594236f2433c55af6`
- v0.8.0 `content.js`: `c1e41165d7d5f7fda794aea3f120ec8775782e32`
- v0.8.0 `dashboard.js`: `72210244ef1b7f89c0f593d4abda77a72865319d`
- recovered authoritative popup target: `04b3a2b425f37ee33de2b7194bd7dbea8aaa93da`

Do not copy the old background/content/dashboard bytes and label them v0.8.6; they predate the strong-receipt/ambiguity behavior.

## Release gates still open

1. Verify exact-head CI after the latest lifecycle guard change.
2. Add stronger deterministic lifecycle coverage around startup/storage/manual-start races and mode transitions where feasible without pretending static tests are browser proof.
3. Audit popup explicit `PARROT_START` versus storage-driven arming so initial delay / `sendImmediately=false` semantics remain deterministic; keep one effective runner via token fencing.
4. Build a repository-only v0.8.7 candidate ZIP and verify ZIP integrity/rebuildability.
5. Execute `docs/LIVE_SMOKE_CHECKLIST.md` on a real Chromium + ChatGPT extension surface. Static CI is not a substitute for this release gate.

## Reference rationale

Chrome Storage documents `storage.onChanged` as the event for reacting to stored option/state changes, which supports storage-driven lifecycle reconciliation. Chrome Tabs documents `tabs.sendMessage()` as content-script messaging, retained for explicit control where needed. Runtime/message passing remains structural control only; Parrot does not semantically read assistant/user chat text.

## Scope

Prefer reliability, simplification, recoverability, regression fixes, low bootstrap overhead, and sustained useful utilization over feature expansion. Do not add Claude/Gemini/Grok implementations before the ChatGPT-first release gate is closed.
