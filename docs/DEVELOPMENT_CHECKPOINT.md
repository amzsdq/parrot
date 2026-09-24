# Parrot development checkpoint

Status: CONTINUE
Current line: v0.8.7-reconstruction
Current milestone: M6 — Real Chromium + ChatGPT validation / VERIFY
Current criterion: M6-C2

## Execution model
`docs/MILESTONES.md` is the single work/progress authority; no BATON layer. Milestones use PLAN→BUILD→VERIFY→FIX→VERIFY→DONE; UNVERIFIED != PASS. Normal stop gates only ALL_MILESTONES_DONE or verified SUCCESSOR_HANDOFF_COMPLETE. GitHub issue #1 comment created_at is timing authority.

## Completed milestones
- M0 scope/relay contract DONE.
- M1 routing/delivery reliability DONE: exact target, strong receipt, ambiguity fail-closed + Retry/Resolve, structural signal dedupe.
- M2 runner lifecycle/reload DONE: exact-URL auto-arm, delay/sendImmediately, token registry overlap/mode/stale-release fencing; run 35978969555.
- M3 dashboard/fleet static UX DONE: exact-target Start/Stop/Open, tested dashboard model, 73-worker fixture, actionable structural labels.
- M4 popup/templates/cooldown static UX DONE: clamps/templates/cooldown, compact overflow/overlay contract, status surfaces.
- M5 rebuildable candidate DONE: exact candidate source `f51e4ba53753dade3bd3f9a64e2b3c50ca05d691`; run `35979821480` SUCCESS; NON-RELEASE artifact `10798948865`; Actions artifact digest `sha256:ca6ece70268ebf304cdab16260515911eeea45b6b67d44d981238c93bfdb251c`; inner candidate SHA is in artifact `candidate.sha256`.

## M6 evidence
- M6-C1 PASS: real Google Chrome on GitHub-hosted Ubuntu loaded the exact M5 candidate as an unpacked extension. After two probe-method failures, the third method derived Chrome's deterministic unpacked extension ID from the exact candidate path, launched Chrome with only that extension enabled, opened its dashboard extension URL, and verified that URL through DevTools. Actions run `35980470638` completed SUCCESS. This proves real Chromium extension/manifest/dashboard loading; it does not prove ChatGPT integration.
- M6-C2..C8 remain UNVERIFIED. C2 next requires authenticated real ChatGPT tabs, unavailable to this GitHub runner.
- Checklist/result: `docs/LIVE_SMOKE_CHECKLIST.md`, `docs/LIVE_SMOKE_RESULT_TEMPLATE.md`.
- Machine gate: `scripts/verify-live-smoke-result.mjs`; self-test `scripts/test-live-smoke-verifier.mjs`.
- S9 ambiguity/S10 cooldown may be explicit NOT_OBSERVED only per checklist; observed FAIL reopens earlier milestone.

## M7 preparation while authenticated browser evidence is pending
- `docs/RELEASE_NOTES_DRAFT.md` and README candidate install/limitations are ready.
- `scripts/build-final-release.sh` is fail-closed: it requires candidate/source-bound M6 evidence verifier PASS before repository verification and final ZIP/hash/content checks.
- No final release ZIP or PROGRAM_COMPLETE claim before M6.

## Remaining release path
1. Execute M6-C2 onward in authenticated real Chromium+ChatGPT against exact candidate; fix/retest any observed failure.
2. When M6 PASS, freeze final source and run fail-closed M7 release builder.
3. PROGRAM_COMPLETE only after M7 durable evidence.

## Scope
ChatGPT-first. Reliability/simplification/recoverability before feature expansion. Claude/Gemini/Grok implementations remain deferred.
