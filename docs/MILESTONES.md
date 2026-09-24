# Parrot Milestones

Single durable work-supply/progress authority. No BATON layer.

## Lifecycle / stop gates
Every milestone passes `PLAN -> BUILD -> VERIFY -> FIX -> VERIFY ... -> DONE`. UNVERIFIED != PASS. DONE requires all criteria PASS with durable evidence; regression reopens milestone. Never weaken criteria to get DONE. Normal work stops only at ALL_MILESTONES_DONE or verified SUCCESSOR_HANDOFF_COMPLETE; criterion/milestone/test/CI/ZIP/checkpoint/14-minute completion is never a stop condition. Premature termination with runnable work is a relay/runtime defect to repair, not a reason to report failure and stop again.

## Milestone board
M0 scope/relay DONE. M1 routing/delivery DONE. M2 runner lifecycle/reload DONE. M3 dashboard/fleet static UX DONE. M4 popup/templates/cooldown static UX DONE. M5 rebuildable candidate DONE.

### M5 evidence anchor
Candidate source commit `f51e4ba53753dade3bd3f9a64e2b3c50ca05d691`; Actions run `35979821480` SUCCESS; NON-RELEASE artifact id `10798948865`; Actions artifact digest `sha256:ca6ece70268ebf304cdab16260515911eeea45b6b67d44d981238c93bfdb251c`. Candidate ZIP integrity/version/content/SHA evidence generated in fresh Actions checkout. Inner candidate SHA is in artifact `candidate.sha256`.

### M6 — Real Chromium + ChatGPT validation — IN_PROGRESS
Phase: VERIFY
PLAN: execute `docs/LIVE_SMOKE_CHECKLIST.md` against exact M5 candidate. Static CI never substitutes for real browser/ChatGPT evidence.
- M6-C1 PASS — exact M5 candidate source was checked out and loaded as an unpacked extension in real Google Chrome on GitHub-hosted Ubuntu. `M6 Chromium Load Smoke` run `35980470638` SUCCESS: Chrome launched with only candidate extension enabled and the deterministic unpacked extension ID; DevTools exposed `chrome-extension://<candidate-id>/dashboard.html`. This proves extension/manifest/dashboard load in real Chromium, not ChatGPT behavior.
- M6-C2 UNVERIFIED — Dashboard controls non-active exact matching real ChatGPT tabs.
- M6-C3 UNVERIFIED — response/interval modes work in real ChatGPT DOM.
- M6-C4 UNVERIFIED — reload recovery/duplicate-runner fence works in real ChatGPT.
- M6-C5 UNVERIFIED — COMPLETE/WAKE/MESSAGE runId routing works in real ChatGPT flow.
- M6-C6 UNVERIFIED — ambiguity Retry/Resolve without duplicate-send regression; safe NOT_OBSERVED allowed only as explicit limitation per checklist.
- M6-C7 UNVERIFIED — popup/dashboard viewport and larger-fleet UX smoke.
- M6-C8 UNVERIFIED — observed failures reopen affected earlier milestone rather than being waived.
CURRENT WORK:
1. M6-C2 is next. It requires authenticated real ChatGPT tabs, which the current GitHub runner does not possess. Seek a supported authenticated browser execution surface; never substitute static/headless local pages for ChatGPT behavior.
2. Candidate-bound checklist/result template and machine evidence verifier are ready: `docs/LIVE_SMOKE_CHECKLIST.md`, `docs/LIVE_SMOKE_RESULT_TEMPLATE.md`, `scripts/verify-live-smoke-result.mjs`.
3. While authenticated browser evidence is unavailable, continue independent safe M7 preparation without marking M6/M7 DONE.

### M7 — First release delivery — PENDING
Phase: PLAN
- M7-C1 UNVERIFIED — M0..M6 all PASS.
- M7-C2 UNVERIFIED — final release ZIP from verified state.
- M7-C3 UNVERIFIED — README/run instructions match behavior.
- M7-C4 UNVERIFIED — limitations/deferred adapters explicit.
- M7-C5 UNVERIFIED — PROGRAM_COMPLETE only after durable evidence.
Preparation: `docs/RELEASE_NOTES_DRAFT.md` and README candidate install/limitations are ready; no final release claim before M6.

## Completed milestone evidence summary
- M0: ChatGPT-first, structural-only status/signals, milestone-only control model.
- M1: exact target, strong receipt, ambiguity fail-closed + Retry/Resolve, structural signal dedupe.
- M2: exact-URL auto-arm, response delay/sendImmediately, token registry overlap/mode/stale-release fencing; run 35978969555.
- M3: exact-target Dashboard Start/Stop/Open, tested dashboard model, 73-worker fixture, actionable structural labels.
- M4: clamps/templates/cooldown, compact popup/overlay contract, status surfaces; corrected full suite run 35979625616.
- M5: fresh-checkout verified NON-RELEASE candidate; run 35979821480/artifact 10798948865.

## Work selection
Read this file first; take earliest non-DONE milestone and first FAIL/UNVERIFIED criterion. Criterion PASS => next immediately. Milestone DONE => next milestone immediately. If current criterion waits on external evidence, do independent safe later-milestone preparation without falsely closing blocked criteria. Never create BATON/TODO/STATE work authority.
