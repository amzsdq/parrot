# Parrot Milestones

This file is the single durable work-supply and progress authority for Parrot development. There is no BATON layer.

## Lifecycle and stop gates
Every milestone MUST pass `PLAN -> BUILD -> VERIFY -> FIX -> VERIFY ... -> DONE`.
- PLAN defines scope, criteria, evidence, dependencies, and verification path.
- BUILD implements unmet criteria.
- VERIFY records PASS / FAIL / UNVERIFIED from actual evidence. UNVERIFIED is never PASS.
- FIX records failing criterion, evidence/reproduction, cause hypothesis, and corrective change, then returns to BUILD/VERIFY.
- DONE requires every required criterion PASS with durable evidence. Regression reopens the milestone.
- Never weaken criteria to obtain DONE.

Normal work may stop only at `ALL_MILESTONES_DONE` or verified `SUCCESSOR_HANDOFF_COMPLETE`. A criterion, milestone, test, CI run, ZIP, checkpoint, or 14-minute boundary is not a stop condition. If a prior invocation stops early while runnable work remains, repair the relay/runtime mechanism and resume; do not merely report failure and stop again.

## Milestone board

### M0 — Product scope and relay contract — DONE
Phase: DONE
- M0-C1 PASS — ChatGPT-first scope explicit.
- M0-C2 PASS — no semantic reading of chat content.
- M0-C3 PASS — COMPLETE / WAKE / MESSAGE structural routing scope explicit.
- M0-C4 PASS — Dashboard-first multi-worker and compact-popup direction durable.
- M0-C5 PASS — milestone/checkpoint and GitHub server-time evidence model durable.

### M1 — Routing and delivery reliability — DONE
Phase: DONE
- M1-C1 PASS — exact normalized target URL; unsafe same-origin fallback removed.
- M1-C2 PASS — structural strong-send receipt.
- M1-C3 PASS — ambiguous delivery fail-closed; no auto-retry.
- M1-C4 PASS — explicit Retry / Resolve path.
- M1-C5 PASS — structural parrot.invalid COMPLETE / WAKE / MESSAGE dedupe.
- M1-C6 PASS — relevant static/integration CI guards green.
Regression rule: wrong-target dispatch, automatic ambiguous resend, or semantic chat-content dependency reopens M1.

### M2 — Runner lifecycle and reload recovery — DONE
Phase: DONE
PLAN: deterministically prove single-effective-runner behavior across startup/reload, storage reconciliation, explicit PARROT_START, mode transitions, cleanup, and response delay/sendImmediately semantics. Real Chromium remains M6.
- M2-C1 PASS — auto-arm exact normalized URL only.
- M2-C2 PASS — running interval targets auto-arm.
- M2-C3 PASS — running response targets auto-arm only when `sendImmediately !== false`.
- M2-C4 PASS — deleted/non-running/cross-URL targets do not auto-arm; stale authority pruned.
- M2-C5 PASS — response↔interval transitions fence old runner.
- M2-C6 PASS — deterministic runner registry harness proves startup/storage/manual-start overlap admits at most one effective runner; stale release cannot delete replacement; stop/delete cleanup and launch-failure recovery covered.
- M2-C7 PASS — response auto-arm preserves configured delay and sendImmediately=false semantics.
- M2-C8 PASS — exact-head CI job for `4b2f6fd87accec89d07657356c153775607b8540` completed success, including syntax, runner policy, runner registry overlap harness, integration guard, and repo verification.
Evidence: `extension/runner-registry.js`, `scripts/test-runner-registry.mjs`, runtime seam in `extension/content.js`, manifest load ordering, Actions run 35978969555 job 107566048560.

### M3 — Multi-worker dashboard and structural fleet UX — IN_PROGRESS
Phase: FIX
PLAN: validate and repair dashboard usability/action clarity for representative larger fleets while keeping status structural-only.
- M3-C1 PASS — worker identities scale A..Z, AA... without fixed five-worker limit.
- M3-C2 FAIL — dashboard can enumerate matching ChatGPT tabs and open them, but current dashboard row exposes only `열기`; it does not yet provide direct Start/Stop control from the dashboard while dashboard is active.
- M3-C3 PASS — fleet states are structural only.
- M3-C4 PASS — pagination/search/basic multi-worker table controls exist.
- M3-C5 UNVERIFIED — larger-fleet UX clarity against representative multi-worker fixture or real browser scenario.
- M3-C6 UNVERIFIED — error/ambiguous/cooldown states understandable/actionable in actual UI flow.
CURRENT WORK:
1. Add direct dashboard Start/Stop controls for matching ChatGPT worker tabs without activating those tabs.
2. Preserve exact-target routing and storage semantics; Start must use the same PARROT_START runtime path, Stop must durably set target non-running so content reconciliation fences the runner.
3. Add deterministic/static dashboard control guard and representative larger-fleet fixture where practical.
4. VERIFY M3-C2/C5/C6; fix failures before DONE.

### M4 — Popup, templates, cooldown, and recovery UX — PENDING
Resume Phase: VERIFY
PLAN: verify compact popup, configurable routing/onboarding templates, cooldown/recovery clarity, and no unintended default vertical scroll.
- M4-C1 PASS — popup numeric clamps/defaults match recovered authoritative target.
- M4-C2 PASS — configurable onboarding/completion composition exists.
- M4-C3 PASS — rate-limit/transient cooldown policy exists and is persisted structurally.
- M4-C4 UNVERIFIED — no unintended default vertical scrolling at supported popup viewport.
- M4-C5 UNVERIFIED — WAKE/MESSAGE/onboarding configuration flow usable without semantic chat parsing.
- M4-C6 UNVERIFIED — cooldown/recovery behavior understandable in popup/dashboard.

### M5 — Rebuildable candidate package — PENDING
Phase: PLAN
PLAN: define candidate version, repository source boundary, build procedure, ZIP integrity checks, rebuildability proof, and non-release label until M6 passes.
- M5-C1 UNVERIFIED — repository source sufficient without hidden local edits.
- M5-C2 UNVERIFIED — syntax / manifest / contract / integration guards pass.
- M5-C3 UNVERIFIED — candidate ZIP contents/integrity verified.
- M5-C4 UNVERIFIED — rebuildability from fresh repository state demonstrated.
- M5-C5 UNVERIFIED — candidate clearly non-release until M6 passes.

### M6 — Real Chromium + ChatGPT validation — PENDING
Phase: PLAN
PLAN: execute `docs/LIVE_SMOKE_CHECKLIST.md` on actual Chromium + ChatGPT. Static CI never substitutes for M6.
- M6-C1 UNVERIFIED — unpacked extension loads.
- M6-C2 UNVERIFIED — dashboard controls non-active matching ChatGPT tabs.
- M6-C3 UNVERIFIED — response and interval modes execute correctly in real ChatGPT DOM.
- M6-C4 UNVERIFIED — reload recovery and duplicate-runner fencing behave correctly.
- M6-C5 UNVERIFIED — COMPLETE / WAKE / MESSAGE runId routing works.
- M6-C6 UNVERIFIED — ambiguous delivery / retry / resolve observed without duplicate-send regression.
- M6-C7 UNVERIFIED — popup/dashboard viewport and larger-fleet UX smoke pass.
- M6-C8 UNVERIFIED — failures reopen relevant earlier milestone instead of being waived.

### M7 — First release delivery — PENDING
Phase: PLAN
PLAN: final release artifact, README/run instructions, limitations, deferred adapters, and program-complete evidence.
- M7-C1 UNVERIFIED — M0..M6 all required criteria PASS.
- M7-C2 UNVERIFIED — final versioned ZIP from verified repository state.
- M7-C3 UNVERIFIED — README/run instructions match actual behavior.
- M7-C4 UNVERIFIED — known limitations/deferred provider adapters explicit.
- M7-C5 UNVERIFIED — PROGRAM_COMPLETE recorded only after all evidence durable.

## Work selection
1. Read this file first.
2. Find earliest milestone not DONE.
3. Continue its current phase and first FAIL/UNVERIFIED criterion.
4. After a criterion passes, immediately continue to the next unmet criterion.
5. After a milestone becomes DONE, immediately continue to the next non-DONE milestone.
6. This file itself is continuation state; do not create a BATON/TODO/STATE authority.
