# Parrot development checkpoint

Status: CONTINUE
Current line: v0.8.7-reconstruction
Current milestone: M6 — Real Chromium + ChatGPT validation / PLAN

## Execution model
- `docs/MILESTONES.md` is the single work/progress authority; no BATON layer.
- `PLAN -> BUILD -> VERIFY -> FIX -> VERIFY ... -> DONE`; UNVERIFIED != PASS.
- Normal stop gates only ALL_MILESTONES_DONE or verified SUCCESSOR_HANDOFF_COMPLETE.
- GitHub issue #1 comment `created_at` is timing authority.

## Completed milestones
- M0 scope/relay contract — DONE.
- M1 routing/delivery reliability — DONE: exact target, strong receipt, ambiguity fail-closed + Retry/Resolve, structural signal dedupe.
- M2 runner lifecycle/reload — DONE: exact-URL auto-arm, configured delay/sendImmediately policy, token registry, overlap/mode-transition/stale-release fencing; exact-head run 35978969555 succeeded.
- M3 dashboard/fleet static UX — DONE: exact-target Start/Stop/Open, tested dashboard model, 73-worker fixture, actionable structural labels/ambiguity actions. Real browser remains M6.
- M4 popup/templates/cooldown static UX — DONE: clamps/defaults, routing templates, structural cooldown, compact overflow/overlay contract, status surfaces. Real viewport remains M6.
- M5 rebuildable candidate — DONE: exact candidate workflow head `f51e4ba53753dade3bd3f9a64e2b3c50ca05d691`, Actions run `35979821480` SUCCESS. Candidate build step passed deterministic ZIP creation, `unzip -t`, sorted content list, SHA-256 generation, manifest version check, then uploaded NON-RELEASE artifact id `10798948865`; Actions artifact digest `sha256:ca6ece70268ebf304cdab16260515911eeea45b6b67d44d981238c93bfdb251c`. Inner candidate SHA-256 is included in artifact evidence as `candidate.sha256`.

## Current M6 gate
- Static CI cannot satisfy M6.
- Candidate-bound checklist: `docs/LIVE_SMOKE_CHECKLIST.md`.
- Candidate-bound result form: `docs/LIVE_SMOKE_RESULT_TEMPLATE.md`.
- Required real cases: unpacked load; exact-target Dashboard control while Dashboard active; strong receipt; response/interval; configured delay/sendImmediately=false; reload/single-runner fence; COMPLETE; WAKE/MESSAGE; fleet/action feedback/popup viewport.
- S9 ambiguity and S10 genuine cooldown may be NOT_OBSERVED only when unsafe/unavailable to reproduce naturally; this remains an explicit limitation, not PASS.
- Any observed FAIL reopens affected earlier milestone.
- This automation runtime currently has GitHub/scheduler tools but no real authenticated Chromium+ChatGPT execution surface; therefore M6 remains UNVERIFIED rather than being falsely closed from static evidence.

## M7 preparation already completed while M6 awaits external browser evidence
- `docs/RELEASE_NOTES_DRAFT.md` records candidate install procedure, v0.8.7 capabilities, deferred provider adapters, browser-DOM dependency, ambiguity/cooldown observation limitations, and final release checklist.
- README now includes candidate install/test instructions and explicitly labels candidate NON-RELEASE.
- M7 remains PENDING; no final release ZIP or PROGRAM_COMPLETE claim before M6.

## Recovered baseline evidence
Recovered Library `parrot_extension_v0.8.0.zip` SHA-256: `4c9d27a0e866fe60802f19717a962034dbfc7c1ba873d116359e4566075dc1ef`. Historical blobs: background `c32103090f349f3397ea489594236f2433c55af6`; content `c1e41165d7d5f7fda794aea3f120ec8775782e32`; dashboard `72210244ef1b7f89c0f593d4abda77a72865319d`; popup target `04b3a2b425f37ee33de2b7194bd7dbea8aaa93da`. Do not label old runtime bytes v0.8.6.

## Remaining release path
1. Execute M6 real browser checklist against exact candidate source/artifact; fix/retest any failure.
2. When M6 PASS, freeze final source and produce M7 release ZIP/instructions/limitations.
3. PROGRAM_COMPLETE only after M7 durable evidence.

## Scope
ChatGPT-first. Prefer reliability/simplification/recoverability/regression fixes over feature expansion. Do not add Claude/Gemini/Grok implementations before ChatGPT-first release gate closes.
