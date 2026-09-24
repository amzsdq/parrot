# Parrot Milestones

This is the durable project-level work supply for the Parrot canonical relay.
A BATON is only the next bounded execution slice. It MUST be derived from the first unmet criterion of the current milestone; finishing a BATON never implies milestone completion.

## Method

Each milestone advances through:

`CONTRACT -> BUILD -> EVALUATE -> FIX -> BUILD ... -> DONE`

Rules:
- CONTRACT: define concrete deliverables, required criteria, and verification evidence before claiming completion.
- BUILD: implement the next change that satisfies unmet criteria.
- EVALUATE: judge criteria using actual evidence. Record PASS / FAIL / UNVERIFIED per criterion. UNVERIFIED is not PASS.
- FIX: record failed criterion, reproduction/evidence, cause hypothesis, and next change; then return to BUILD.
- DONE: only when every required criterion is PASS and evidence/artifacts are durable.
- A later regression reopens the affected milestone.
- Do not weaken requirements to turn a failure into PASS.
- Self-evaluation text is weaker than tests, browser evidence, exact artifacts, or reproducible observations.

## Current program

### M0 — Product scope and relay contract
Status: DONE
Phase: DONE

Required criteria:
- M0-C1 PASS — ChatGPT-first scope is explicit.
- M0-C2 PASS — No semantic reading of chat content.
- M0-C3 PASS — COMPLETE / WAKE / MESSAGE structural routing scope is explicit.
- M0-C4 PASS — Dashboard-first multi-worker direction and compact popup direction are durable.
- M0-C5 PASS — GitHub BATON / log / checkpoint and server-time measurement model are durable.

Evidence:
- README.md
- docs/DEVELOPMENT_CHECKPOINT.md
- docs/BATON.md
- issue #1 [PARROT_RELAY_WORK_MARKERS]

### M1 — Routing and delivery reliability
Status: DONE
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

### M2 — Runner lifecycle and reload recovery
Status: IN_PROGRESS
Phase: BUILD

Required criteria:
- M2-C1 PASS — automatic arming uses exact normalized URL only.
- M2-C2 PASS — running interval targets auto-arm.
- M2-C3 PASS — running response targets auto-arm only when `sendImmediately !== false`.
- M2-C4 PASS — deleted/non-running/cross-URL targets do not auto-arm and stale runner tokens are pruned.
- M2-C5 PASS — response↔interval transitions fence the old runner and preserve only one effective runner.
- M2-C6 UNVERIFIED — startup/storage/manual `PARROT_START` races have deterministic regression evidence.
- M2-C7 UNVERIFIED — popup start ordering preserves intended initial delay and `sendImmediately=false` semantics.
- M2-C8 UNVERIFIED — exact-head CI is green after the newest lifecycle race/ordering changes.

Current next criterion:
M2-C6, then M2-C7, then M2-C8.

### M3 — Multi-worker dashboard and structural fleet UX
Status: IN_PROGRESS
Phase: EVALUATE

Required criteria:
- M3-C1 PASS — worker identities scale A..Z, AA... without fixed five-worker limit.
- M3-C2 PASS — dashboard can control matching ChatGPT tabs while dashboard is active.
- M3-C3 PASS — fleet states are structural only.
- M3-C4 PASS — pagination/search/basic multi-worker table controls exist.
- M3-C5 UNVERIFIED — larger-fleet UX clarity is validated against a representative multi-worker fixture or real browser scenario.
- M3-C6 UNVERIFIED — error/ambiguous/cooldown states are understandable and actionable in actual UI flow.

### M4 — Popup, templates, cooldown, and recovery UX
Status: IN_PROGRESS
Phase: EVALUATE

Required criteria:
- M4-C1 PASS — popup numeric clamps/defaults match recovered authoritative target.
- M4-C2 PASS — configurable onboarding/completion composition exists.
- M4-C3 PASS — rate-limit and transient cooldown policy exists and is persisted structurally.
- M4-C4 UNVERIFIED — popup has no unintended default vertical scrolling at supported viewport.
- M4-C5 UNVERIFIED — WAKE/MESSAGE/onboarding configuration flow is usable without semantic chat parsing.
- M4-C6 UNVERIFIED — cooldown/recovery behavior is understandable in popup/dashboard.

### M5 — Rebuildable candidate package
Status: PENDING
Phase: CONTRACT

Required criteria:
- M5-C1 — repository source is sufficient to build the candidate without hidden local edits.
- M5-C2 — node syntax / manifest parse / contract tests / integration guards pass.
- M5-C3 — candidate ZIP contents and integrity are verified.
- M5-C4 — rebuildability from fresh repository state is demonstrated.
- M5-C5 — candidate is clearly labeled non-release until real-browser milestone passes.

### M6 — Real Chromium + ChatGPT validation
Status: PENDING
Phase: CONTRACT

Required criteria:
- M6-C1 — unpacked extension loads successfully in supported Chromium.
- M6-C2 — dashboard controls non-active matching ChatGPT worker tabs.
- M6-C3 — response and interval modes execute correctly in real ChatGPT DOM.
- M6-C4 — reload recovery and duplicate-runner fencing behave correctly.
- M6-C5 — COMPLETE / WAKE / MESSAGE runId routing works in real browser flow.
- M6-C6 — ambiguous delivery / retry / resolve flow is observed without duplicate-send regression.
- M6-C7 — popup/dashboard viewport and larger-fleet UX smoke checks pass.
- M6-C8 — failures are recorded and reopen the relevant earlier milestone instead of being waived.

Primary checklist:
- docs/LIVE_SMOKE_CHECKLIST.md

### M7 — First release delivery
Status: PENDING
Phase: CONTRACT

Required criteria:
- M7-C1 — M0..M6 all required criteria are PASS.
- M7-C2 — final versioned ZIP is produced from verified repository state.
- M7-C3 — README/run instructions match actual behavior.
- M7-C4 — known limitations and deferred provider adapters are explicit.
- M7-C5 — PROGRAM_COMPLETE is recorded only after all above evidence is durable.

## Relay selection rule

On each wake:
1. Read this file after BATON.
2. Find the earliest milestone that is not DONE.
3. Within it, select the first required criterion that is FAIL or UNVERIFIED, respecting phase.
4. BATON must contain a coherent ~14-minute useful-work slice aimed at advancing that criterion.
5. If that criterion is completed early, continue to the next criterion in the same milestone, then the next milestone if the current one becomes DONE.
6. BATON completion alone is never a stop condition.
