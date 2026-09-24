# Parrot Milestones

Single durable work-supply/progress authority. No BATON layer.

## Lifecycle and stop gates
Every milestone passes `PLAN -> BUILD -> VERIFY -> FIX -> VERIFY ... -> DONE`. PLAN defines scope/criteria/evidence/dependencies/path. VERIFY records PASS/FAIL/UNVERIFIED from evidence; UNVERIFIED != PASS. FIX records failure evidence/cause/corrective change. DONE requires every criterion PASS. Never weaken criteria to obtain DONE; regression reopens milestone.

Normal work stops only at `ALL_MILESTONES_DONE` or verified `SUCCESSOR_HANDOFF_COMPLETE`. Criterion/milestone/test/CI/ZIP/checkpoint/14-minute completion is never a stop condition. Premature termination with runnable work is a relay/runtime defect to repair, not a reason to merely report failure and stop again.

## Milestone board

### M0 — Product scope and relay contract — DONE
Phase: DONE
- M0-C1 PASS — ChatGPT-first scope explicit.
- M0-C2 PASS — no semantic reading of chat content.
- M0-C3 PASS — COMPLETE / WAKE / MESSAGE structural routing scope explicit.
- M0-C4 PASS — Dashboard-first multi-worker and compact-popup direction durable.
- M0-C5 PASS — milestone/checkpoint/GitHub-server-time evidence model durable.

### M1 — Routing and delivery reliability — DONE
Phase: DONE
- M1-C1 PASS — exact normalized target URL; unsafe same-origin fallback removed.
- M1-C2 PASS — structural strong-send receipt.
- M1-C3 PASS — ambiguous delivery fail-closed; no auto-retry.
- M1-C4 PASS — explicit Retry / Resolve.
- M1-C5 PASS — structural parrot.invalid COMPLETE / WAKE / MESSAGE dedupe.
- M1-C6 PASS — relevant static/integration guards established.
Regression: wrong-target dispatch, automatic ambiguous resend, or semantic chat-content dependency reopens M1.

### M2 — Runner lifecycle and reload recovery — DONE
Phase: DONE
PLAN: deterministic single-effective-runner behavior across startup/reload, storage reconciliation, explicit PARROT_START, mode transitions, cleanup, response delay/sendImmediately. Real Chromium remains M6.
- M2-C1 PASS — exact-URL auto-arm only.
- M2-C2 PASS — running interval auto-arm.
- M2-C3 PASS — response auto-arm only when sendImmediately != false.
- M2-C4 PASS — deleted/non-running/cross-URL cleanup.
- M2-C5 PASS — mode transitions fence old runner.
- M2-C6 PASS — runner-registry harness proves overlap admission, stale-release fence, cleanup, recovery.
- M2-C7 PASS — response auto-arm preserves delay/sendImmediately semantics.
- M2-C8 PASS — Actions run 35978969555 exact-head integration/rebuildability suite succeeded.
Evidence: `extension/runner-registry.js`, `scripts/test-runner-registry.mjs`, runtime seam in `content.js`.

### M3 — Multi-worker dashboard and structural fleet UX — DONE
Phase: DONE
PLAN: deterministic/static dashboard control/fleet acceptance here; actual Chromium visual/interaction smoke remains explicitly M6-C2/M6-C7, avoiding a circular pre-browser gate.
- M3-C1 PASS — A..Z, AA... identities; no fixed five-worker limit.
- M3-C2 PASS — Dashboard directly Start/Stops exact matching open ChatGPT worker without activating it; Open remains separate; no first-tab fallback. `scripts/test-dashboard-controls.mjs` passed in Actions run 35979556410 step 24.
- M3-C3 PASS — fleet states structural-only.
- M3-C4 PASS — search/filter and 10/25/50 pagination.
- M3-C5 PASS — tested `dashboard-model.js` is used by runtime; 73-worker search/filter/attention/pagination fixture passed in Actions run 35979556410 step 25.
- M3-C6 PASS — actionable structural activity labels, visible action feedback, and ambiguous Retry/Resolve controls are guarded by deterministic source/model tests; real UI smoke remains M6-C7. Actions run 35979556410 dashboard/popup UX steps passed.
Evidence: `extension/dashboard-model.js`, `extension/dashboard.js`, `scripts/test-dashboard-controls.mjs`, `scripts/test-dashboard-fleet.mjs`.

### M4 — Popup, templates, cooldown, and recovery UX — DONE
Phase: DONE
PLAN: static/contract UX acceptance here; real popup/dashboard viewport and interaction smoke remains M6-C7.
- M4-C1 PASS — numeric clamps/defaults preserved.
- M4-C2 PASS — configurable onboarding/completion composition.
- M4-C3 PASS — rate-limit/transient cooldown policy and persisted structural state.
- M4-C4 PASS — default popup CSS explicitly prevents default body scrolling; advanced editors are fixed overlays rather than extending default layout; guarded by `test-popup-ux-contract.mjs`.
- M4-C5 PASS — WAKE/MESSAGE/onboarding configuration surfaces/tokens/validators are present without semantic chat parsing; popup UX contract passed in Actions run 35979556410 step 26.
- M4-C6 PASS — popup exposes status/error/cooldown surfaces and dashboard maps structural errors/cooldowns to actionable labels; actual visual usability remains M6-C7.
Note: Actions run 35979556410 later failed only because `test-cooldown-storage-contract.mjs` still expected the pre-refactor dashboard-local cooldown helper; product/dashboard UX steps passed. The guard was corrected at commit `c33447f39397fc482895b7dc781ac917d3bc6f87` and must be green under M5 before candidate acceptance.

### M5 — Rebuildable candidate package — IN_PROGRESS
Phase: VERIFY
PLAN: candidate version v0.8.7; source boundary=`extension/` at one verified repository commit; run complete CI/static suite; create versioned candidate ZIP from that exact source; verify archive manifest/content hashes/rebuildability; label candidate NON-RELEASE until M6 passes.
- M5-C1 UNVERIFIED — repository source sufficient without hidden local edits.
- M5-C2 UNVERIFIED — syntax / manifest / contract / integration guards all pass at candidate head.
- M5-C3 UNVERIFIED — candidate ZIP contents/integrity verified.
- M5-C4 UNVERIFIED — rebuildability from fresh repository state demonstrated.
- M5-C5 UNVERIFIED — candidate clearly labeled non-release until M6.
CURRENT WORK:
1. Obtain green exact-head CI after corrected cooldown/dashboard guards.
2. Freeze candidate commit SHA; avoid packaging from a moving head.
3. Build `parrot-v0.8.7-candidate.zip` from that exact `extension/` tree and record SHA-256/content list.
4. Re-run rebuildability/integrity evidence against frozen candidate.
5. Mark NON-RELEASE / M6-required explicitly, then M5 DONE and continue M6 planning/evidence collection.

### M6 — Real Chromium + ChatGPT validation — PENDING
Phase: PLAN
PLAN: execute `docs/LIVE_SMOKE_CHECKLIST.md` on actual Chromium + ChatGPT. Static CI never substitutes.
- M6-C1 UNVERIFIED — unpacked extension loads.
- M6-C2 UNVERIFIED — dashboard controls non-active exact matching ChatGPT tabs.
- M6-C3 UNVERIFIED — response/interval modes work in real ChatGPT DOM.
- M6-C4 UNVERIFIED — reload recovery/duplicate-runner fence works.
- M6-C5 UNVERIFIED — COMPLETE / WAKE / MESSAGE runId routing works.
- M6-C6 UNVERIFIED — ambiguity Retry/Resolve without duplicate-send regression.
- M6-C7 UNVERIFIED — popup/dashboard viewport and larger-fleet UX smoke.
- M6-C8 UNVERIFIED — failures reopen affected earlier milestone.

### M7 — First release delivery — PENDING
Phase: PLAN
- M7-C1 UNVERIFIED — M0..M6 all criteria PASS.
- M7-C2 UNVERIFIED — final versioned ZIP from verified state.
- M7-C3 UNVERIFIED — README/run instructions match behavior.
- M7-C4 UNVERIFIED — limitations/deferred adapters explicit.
- M7-C5 UNVERIFIED — PROGRAM_COMPLETE only after durable evidence.

## Work selection
Read this file first; take earliest non-DONE milestone and first FAIL/UNVERIFIED criterion; continue its phase. Criterion PASS => next criterion immediately. Milestone DONE => next milestone immediately. Never create BATON/TODO/STATE work authority.
