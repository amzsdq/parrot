# Parrot development checkpoint

Status: CONTINUE
Current line: v0.8.7-reconstruction
Current milestone: M5 — Rebuildable candidate package / VERIFY

## Execution model
- `docs/MILESTONES.md` is the single work-supply/progress authority. No active BATON layer.
- Milestones pass `PLAN -> BUILD -> VERIFY -> FIX -> VERIFY ... -> DONE`; UNVERIFIED != PASS.
- Normal stop gates are only ALL_MILESTONES_DONE or verified SUCCESSOR_HANDOFF_COMPLETE.
- Issue #1 GitHub comment `created_at` is timing authority.

## Completed milestones

### M0 — scope/relay contract — DONE
ChatGPT-first, structural signals/status, dashboard-first direction, milestone-only durable control model.

### M1 — routing/delivery reliability — DONE
Exact normalized target routing; no first-tab fallback; strong structural receipt; ambiguity persist-before-notify + fail-closed no-auto-retry + Retry/Resolve; COMPLETE/WAKE/MESSAGE structural runId/event dedupe.

### M2 — runner lifecycle/reload recovery — DONE
- Added `runner-policy.js` exact-URL auto-arm and response delay/sendImmediately policy.
- Added `runner-registry.js` as runtime authority for single effective runner.
- Startup/reload, storage reconciliation and explicit PARROT_START converge through registry admission.
- Mode transition prunes/fences old token; stale release cannot delete replacement.
- Deterministic registry overlap/cleanup/recovery harness is in CI.
- Exact-head integration suite succeeded at commit `4b2f6fd87accec89d07657356c153775607b8540`, Actions run `35978969555`.

### M3 — multi-worker dashboard/static fleet UX — DONE
- Dashboard directly Start/Stops exact matching open ChatGPT workers without activating them; Open is separate.
- Start creates fresh runId/completion URL; Stop persists non-running state so content reconciliation fences runner.
- `dashboard-model.js` owns tested search/filter/attention/pagination/actionable-label logic.
- 73-worker fixture covers pagination, search, running/open/attention filters and labels.
- Ambiguous Retry/Resolve and visible action feedback are source/model guarded.
- Real browser dashboard behavior remains M6, not silently treated as proven here.

### M4 — popup/templates/cooldown/static recovery UX — DONE
- Popup clamps/defaults, configurable onboarding/WAKE/MESSAGE/completion surfaces, cooldown persistence/backpressure retained.
- Default popup overflow is suppressed; advanced editors are fixed overlays.
- `test-popup-ux-contract.mjs` guards compact layout/routing configuration/status surfaces.
- Real viewport/usability remains M6.

## Current M5 evidence
- After dashboard-model refactor, the stale cooldown guard failed once because it still expected dashboard-local `hasCooldown`; product-specific dashboard/popup tests were already PASS. Guard was corrected at `c33447f39397fc482895b7dc781ac917d3bc6f87`; Actions run `35979625616` then completed SUCCESS across the full pre-packaging suite.
- Candidate packaging was added to Route State Contract: deterministic `zip -X`, archive integrity test, sorted content list, SHA-256, manifest version check, and NON-RELEASE artifact upload.
- First packaging attempt at `fbe0b60157fd86f96ff53b45b3ef570bb4bb032c` reached all source/integration/rebuildability checks PASS but failed inside the new packaging shell step; manifest-version verification was simplified in the next workflow commit `f51e4ba53753dade3bd3f9a64e2b3c50ca05d691`. Exact-head packaging CI remains to be observed before M5 can close.
- Candidate remains explicitly NON-RELEASE until M6.

## M6 live gate
`docs/LIVE_SMOKE_CHECKLIST.md` now explicitly covers exact-target dashboard Start/Stop while Dashboard stays active, response/interval execution, configured response delay/sendImmediately=false, reload recovery/single-runner fencing, COMPLETE/WAKE/MESSAGE, ambiguity, structural cooldown, fleet pagination/action feedback, and popup viewport. Static CI never substitutes for this gate.

## Recovered baseline evidence
Recovered Library `parrot_extension_v0.8.0.zip` SHA-256: `4c9d27a0e866fe60802f19717a962034dbfc7c1ba873d116359e4566075dc1ef`.
Important historical blobs: background `c32103090f349f3397ea489594236f2433c55af6`; content `c1e41165d7d5f7fda794aea3f120ec8775782e32`; dashboard `72210244ef1b7f89c0f593d4abda77a72865319d`; recovered popup target `04b3a2b425f37ee33de2b7194bd7dbea8aaa93da`.
Do not label old runtime bytes v0.8.6; they predate strong-receipt/ambiguity behavior.

## Remaining release path
1. Close M5 only after exact candidate-head CI + ZIP integrity/hash/artifact evidence.
2. Execute M6 real Chromium + ChatGPT checklist against exact candidate SHA. Observed failures reopen affected earlier milestones.
3. M7 produces final release ZIP/instructions/limitations only after M6.

## Scope
Prefer reliability, simplification, recoverability, regression fixes, low bootstrap overhead, and sustained useful utilization over feature expansion. Do not add Claude/Gemini/Grok implementations before ChatGPT-first release gate closes.
