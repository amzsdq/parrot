# Parrot Milestones

This file is the single durable work-supply and progress authority for Parrot development.
There is no BATON layer. Workers resume directly from the first milestone that is not DONE.

## Mandatory milestone lifecycle

Every milestone MUST pass this lifecycle before it may be marked DONE:

`PLAN -> BUILD -> VERIFY -> FIX -> VERIFY ... -> DONE`

Rules:
- PLAN: define scope, deliverables, acceptance criteria, evidence required, and the safest implementation path.
- BUILD: implement the work required by the PLAN. A small subtask finishing is never a stop condition.
- VERIFY: evaluate every required criterion using actual evidence. Record PASS / FAIL / UNVERIFIED per criterion.
- UNVERIFIED is never PASS.
- FIX: for every FAIL, record the failing criterion, reproduction/evidence, cause hypothesis, and the next change. Then return to BUILD/VERIFY.
- DONE: permitted only after all required criteria are PASS and durable evidence exists.
- A later regression reopens the affected milestone.
- Never weaken or reinterpret criteria merely to get DONE.
- Self-evaluation prose is weaker than tests, exact artifacts, browser evidence, or reproducible observations.

## Continuous-work rule

The worker does NOT stop because:
- a criterion finishes;
- a milestone finishes;
- a test/CI/ZIP/checkpoint finishes;
- 14 minutes have elapsed;
- a convenient local work unit ends.

When one criterion finishes, immediately take the next unmet criterion.
When one milestone becomes DONE, immediately continue into the next non-DONE milestone.

Normal work may stop ONLY when:
1. ALL_MILESTONES_DONE — every milestone below is DONE and PROGRAM_COMPLETE evidence is durable; or
2. SUCCESSOR_HANDOFF_COMPLETE — a real successor has awakened, is ready, and durable ownership/generation transfer is complete.

If neither condition is true, continue safe useful work.
A hard external/tool/platform interruption is an abnormal interruption, not a normal completion condition.

## Milestone board

### M0 — Product scope and relay contract — DONE
Phase: DONE

Required criteria:
- M0-C1 PASS — ChatGPT-first scope is explicit.
- M0-C2 PASS — No semantic reading of chat content.
- M0-C3 PASS — COMPLETE / WAKE / MESSAGE structural routing scope is explicit.
- M0-C4 PASS — Dashboard-first multi-worker direction and compact popup direction are durable.
- M0-C5 PASS — milestone/log/checkpoint and GitHub server-time measurement model are durable.

Evidence:
- README.md
- docs/DEVELOPMENT_CHECKPOINT.md
- docs/MILESTONES.md
- issue #1 [PARROT_RELAY_WORK_MARKERS]

### M1 — Routing and delivery reliability — DONE
Phase: DONE

Required criteria:
- M1-C1 PASS — exact normalized target URL required; unsafe same-origin fallback removed.
- M1-C2 PASS — structural strong-send receipt exists.
- M1-C3 PASS — ambiguous delivery is fail-closed and not auto-retried.
- M1-C4 PASS — explicit Retry / Resolve path exists.
- M1-C5 PASS — parrot.invalid COMPLETE / WAKE / MESSAGE signal protocol has durable dedupe.
- M1-C6 PASS — relevant static/integration CI guards are green at verified heads.

Regression rule:
Any wrong-target dispatch, automatic ambiguous resend, or semantic chat-content dependency reopens M1.

### M2 — Runner lifecycle and reload recovery — IN_PROGRESS
Phase: BUILD

PLAN:
- Prove deterministic single-effective-runner behavior across startup/reload, storage reconciliation, explicit PARROT_START, mode transitions, deletion/non-running cleanup, and response sendImmediately/delay semantics.
- Static/deterministic evidence closes M2; real Chromium behavior remains separately required by M6.

Required criteria:
- M2-C1 PASS — automatic arming uses exact normalized URL only.
- M2-C2 PASS — running interval targets auto-arm.
- M2-C3 PASS — running response targets auto-arm only when `sendImmediately !== false`.
- M2-C4 PASS — deleted/non-running/cross-URL targets do not auto-arm and stale runner tokens are pruned.
- M2-C5 PASS — response↔interval transitions fence the old runner and preserve only one effective runner.
- M2-C6 UNVERIFIED — deterministic startup/storage/manual PARROT_START overlap proves at most one effective runner.
- M2-C7 PASS — popup/storage start ordering preserves intended response delay and sendImmediately=false semantics.
- M2-C8 UNVERIFIED — exact-head CI is green after the newest lifecycle/race changes.

CURRENT WORK:
1. Build the deterministic M2-C6 lifecycle/race harness without a large DOM mock.
2. Cover overlapping storage auto-arm + explicit PARROT_START + startup/reload attempts.
3. Preserve existing mode-transition/stale-token evidence and extend only if required.
4. Inspect exact-head CI after newest delay/race changes; fix failures rather than weakening tests.
5. When M2-C6 and M2-C8 are PASS, execute VERIFY for all M2 criteria, mark M2 DONE, and immediately continue into M3.

### M3 — Multi-worker dashboard and structural fleet UX — IN_PROGRESS
Phase: VERIFY

PLAN:
- Validate dashboard usability and action clarity for representative larger fleets while keeping all status structural rather than semantic.

Required criteria:
- M3-C1 PASS — worker identities scale A..Z, AA... without fixed five-worker limit.
- M3-C2 PASS — dashboard can control matching ChatGPT tabs while dashboard is active.
- M3-C3 PASS — fleet states are structural only.
- M3-C4 PASS — pagination/search/basic multi-worker table controls exist.
- M3-C5 UNVERIFIED — larger-fleet UX clarity is validated against a representative multi-worker fixture or real browser scenario.
- M3-C6 UNVERIFIED — error/ambiguous/cooldown states are understandable and actionable in actual UI flow.

### M4 — Popup, templates, cooldown, and recovery UX — IN_PROGRESS
Phase: VERIFY

PLAN:
- Verify compact popup, configurable routing/onboarding templates, cooldown/recovery clarity, and no unintended default vertical scroll.

Required criteria:
- M4-C1 PASS — popup numeric clamps/defaults match recovered authoritative target.
- M4-C2 PASS — configurable onboarding/completion composition exists.
- M4-C3 PASS — rate-limit and transient cooldown policy exists and is persisted structurally.
- M4-C4 UNVERIFIED — popup has no unintended default vertical scrolling at supported viewport.
- M4-C5 UNVERIFIED — WAKE/MESSAGE/onboarding configuration flow is usable without semantic chat parsing.
- M4-C6 UNVERIFIED — cooldown/recovery behavior is understandable in popup/dashboard.

### M5 — Rebuildable candidate package — PENDING
Phase: PLAN

PLAN REQUIREMENTS:
- Define the candidate version, exact repository source boundary, build procedure, ZIP integrity checks, rebuildability proof, and non-release label until M6 passes.

Required criteria:
- M5-C1 UNVERIFIED — repository source is sufficient to build the candidate without hidden local edits.
- M5-C2 UNVERIFIED — node syntax / manifest parse / contract tests / integration guards pass.
- M5-C3 UNVERIFIED — candidate ZIP contents and integrity are verified.
- M5-C4 UNVERIFIED — rebuildability from fresh repository state is demonstrated.
- M5-C5 UNVERIFIED — candidate is clearly labeled non-release until real-browser milestone passes.

### M6 — Real Chromium + ChatGPT validation — PENDING
Phase: PLAN

PLAN REQUIREMENTS:
- Use docs/LIVE_SMOKE_CHECKLIST.md on an actual Chromium + ChatGPT extension execution surface.
- Static CI is never a substitute for this milestone.

Required criteria:
- M6-C1 UNVERIFIED — unpacked extension loads successfully in supported Chromium.
- M6-C2 UNVERIFIED — dashboard controls non-active matching ChatGPT worker tabs.
- M6-C3 UNVERIFIED — response and interval modes execute correctly in real ChatGPT DOM.
- M6-C4 UNVERIFIED — reload recovery and duplicate-runner fencing behave correctly.
- M6-C5 UNVERIFIED — COMPLETE / WAKE / MESSAGE runId routing works in real browser flow.
- M6-C6 UNVERIFIED — ambiguous delivery / retry / resolve flow is observed without duplicate-send regression.
- M6-C7 UNVERIFIED — popup/dashboard viewport and larger-fleet UX smoke checks pass.
- M6-C8 UNVERIFIED — failures reopen the relevant earlier milestone instead of being waived.

### M7 — First release delivery — PENDING
Phase: PLAN

PLAN REQUIREMENTS:
- Define final release artifact, README/run instructions, limitations, deferred adapters, and final program-complete evidence.

Required criteria:
- M7-C1 UNVERIFIED — M0..M6 all required criteria are PASS.
- M7-C2 UNVERIFIED — final versioned ZIP is produced from verified repository state.
- M7-C3 UNVERIFIED — README/run instructions match actual behavior.
- M7-C4 UNVERIFIED — known limitations and deferred provider adapters are explicit.
- M7-C5 UNVERIFIED — PROGRAM_COMPLETE is recorded only after all above evidence is durable.

## Work selection

On each wake:
1. Read this file.
2. Find the earliest milestone not marked DONE.
3. Inspect its Phase and first FAIL/UNVERIFIED required criterion.
4. Continue its PLAN/BUILD/VERIFY/FIX lifecycle from durable evidence.
5. After a criterion passes, immediately continue to the next unmet criterion.
6. After a milestone becomes DONE, immediately continue to the next non-DONE milestone.
7. Do not stop merely to write a handoff document; this file itself is the continuation state.
