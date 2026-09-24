# Parrot Milestones

Single durable work-supply/progress authority. No BATON layer.

## Lifecycle / stop gates
Every milestone passes `PLAN -> BUILD -> VERIFY -> FIX -> VERIFY ... -> DONE`. UNVERIFIED != PASS. DONE requires all criteria PASS with durable evidence; regression reopens milestone. Never weaken criteria to get DONE. Normal work stops only at ALL_MILESTONES_DONE or verified SUCCESSOR_HANDOFF_COMPLETE; criterion/milestone/test/CI/ZIP/checkpoint/14-minute completion is never a stop condition. Premature termination with runnable work is a relay/runtime defect to repair, not a reason to report failure and stop again.

## Milestone board

### M0 — Product scope and relay contract — DONE
Phase: DONE
- M0-C1 PASS ChatGPT-first scope.
- M0-C2 PASS no semantic chat-content reading.
- M0-C3 PASS structural COMPLETE/WAKE/MESSAGE.
- M0-C4 PASS dashboard-first multi-worker + compact popup direction.
- M0-C5 PASS milestone/checkpoint/GitHub-server-time evidence model.

### M1 — Routing and delivery reliability — DONE
Phase: DONE
- M1-C1 PASS exact normalized target; no first-tab fallback.
- M1-C2 PASS strong structural send receipt.
- M1-C3 PASS ambiguous fail-closed/no auto-retry.
- M1-C4 PASS explicit Retry/Resolve.
- M1-C5 PASS structural signal dedupe.
- M1-C6 PASS static/integration guards.
Regression: wrong-target dispatch, automatic ambiguous resend, or semantic chat-content dependency reopens M1.

### M2 — Runner lifecycle and reload recovery — DONE
Phase: DONE
- M2-C1 PASS exact-URL auto-arm.
- M2-C2 PASS interval auto-arm.
- M2-C3 PASS response auto-arm only when sendImmediately != false.
- M2-C4 PASS deleted/non-running/cross-URL cleanup.
- M2-C5 PASS mode-transition token fencing.
- M2-C6 PASS deterministic runner-registry overlap/cleanup/recovery harness.
- M2-C7 PASS configured response delay/sendImmediately semantics.
- M2-C8 PASS exact-head integration/rebuildability run 35978969555.

### M3 — Multi-worker dashboard and structural fleet UX — DONE
Phase: DONE
Static/deterministic gate here; real browser remains M6.
- M3-C1 PASS scalable A..Z, AA... identities.
- M3-C2 PASS direct exact-target Dashboard Start/Stop without activating worker tab; Open separate; no fallback.
- M3-C3 PASS structural-only fleet state.
- M3-C4 PASS search/filter + 10/25/50 pagination.
- M3-C5 PASS runtime uses tested dashboard-model; 73-worker fixture.
- M3-C6 PASS actionable structural labels, visible feedback, ambiguity Retry/Resolve guards.

### M4 — Popup, templates, cooldown, recovery UX — DONE
Phase: DONE
Static/contract gate here; real viewport/interaction remains M6.
- M4-C1 PASS numeric clamps/defaults.
- M4-C2 PASS configurable onboarding/completion.
- M4-C3 PASS persisted structural cooldown/backpressure.
- M4-C4 PASS compact default overflow contract + overlay editors.
- M4-C5 PASS WAKE/MESSAGE/onboarding config tokens/validators without semantic parsing.
- M4-C6 PASS status/error/cooldown surfaces + actionable dashboard labels.
Evidence includes successful dashboard/fleet/popup UX steps and full corrected suite run 35979625616.

### M5 — Rebuildable candidate package — DONE
Phase: DONE
PLAN: v0.8.7 candidate built from exact fresh checkout `extension/` source; full suite + repository verification; deterministic ZIP integrity/version/content evidence; NON-RELEASE until M6.
- M5-C1 PASS — Actions fresh checkout plus `verify-repo.mjs` proves repository source/references are self-contained for candidate build.
- M5-C2 PASS — exact candidate workflow head `f51e4ba53753dade3bd3f9a64e2b3c50ca05d691`, Actions run `35979821480`, completed SUCCESS across syntax, contracts, runner/dashboard/popup fixtures, cooldown, v0.8.7 integration, and repository verification.
- M5-C3 PASS — workflow `Build candidate ZIP` succeeded: `zip -X`, `unzip -t`, sorted file list, SHA-256 generation, and manifest version 0.8.7 check all passed before artifact upload.
- M5-C4 PASS — candidate was built inside the same fresh Actions checkout after repository verification; no local hidden source is involved.
- M5-C5 PASS — uploaded artifact is explicitly named `parrot-v0.8.7-candidate-NON-RELEASE-f51e4ba53753dade3bd3f9a64e2b3c50ca05d691`; artifact id `10798948865`, Actions artifact digest `sha256:ca6ece70268ebf304cdab16260515911eeea45b6b67d44d981238c93bfdb251c`, expires 2026-10-08. README/checklist also state M6 is mandatory before release.
Note: artifact digest above is the GitHub Actions artifact archive digest; the inner candidate ZIP SHA-256 is generated and included inside the uploaded evidence bundle as `candidate.sha256`.

### M6 — Real Chromium + ChatGPT validation — IN_PROGRESS
Phase: PLAN
PLAN: execute `docs/LIVE_SMOKE_CHECKLIST.md` against the exact candidate source commit. Static CI never substitutes. The checklist now covers dashboard exact-target Start/Stop, strong receipt, response/interval modes, configured delay/sendImmediately=false, reload/single-runner fencing, COMPLETE/WAKE/MESSAGE, ambiguity, structural cooldown, fleet/action feedback, and popup viewport.
- M6-C1 UNVERIFIED — unpacked extension loads in real Chromium.
- M6-C2 UNVERIFIED — Dashboard controls non-active exact matching ChatGPT tabs.
- M6-C3 UNVERIFIED — response/interval modes work in real ChatGPT DOM.
- M6-C4 UNVERIFIED — reload recovery/duplicate-runner fence works.
- M6-C5 UNVERIFIED — COMPLETE/WAKE/MESSAGE runId routing works.
- M6-C6 UNVERIFIED — ambiguity Retry/Resolve without duplicate-send regression; may remain NOT_OBSERVED only if safe ambiguity cannot naturally occur and must then be explicit release limitation.
- M6-C7 UNVERIFIED — popup/dashboard viewport and larger-fleet UX smoke.
- M6-C8 UNVERIFIED — any observed failure reopens affected earlier milestone rather than being waived.
CURRENT WORK:
1. Prepare exact, low-risk live evidence procedure/result template bound to candidate SHA `f51e4ba53753dade3bd3f9a64e2b3c50ca05d691`.
2. Execute real Chromium+ChatGPT smoke when a browser execution surface is available; never fabricate PASS from static evidence.
3. While waiting for that external execution surface, continue independent safe M7 preparation (release instructions/limitations) without marking M6 or M7 DONE.

### M7 — First release delivery — PENDING
Phase: PLAN
- M7-C1 UNVERIFIED — M0..M6 all PASS.
- M7-C2 UNVERIFIED — final release ZIP from verified state.
- M7-C3 UNVERIFIED — README/run instructions match behavior.
- M7-C4 UNVERIFIED — limitations/deferred adapters explicit.
- M7-C5 UNVERIFIED — PROGRAM_COMPLETE only after durable evidence.

## Work selection
Read this file first; take earliest non-DONE milestone and first FAIL/UNVERIFIED criterion. Criterion PASS => next criterion immediately. Milestone DONE => next milestone immediately. If current criterion waits on external evidence, do independent safe preparation that advances later acceptance without falsely closing the blocked criterion. Never create BATON/TODO/STATE work authority.
