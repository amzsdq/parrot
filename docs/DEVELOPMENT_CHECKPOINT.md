# Parrot development checkpoint

Status: CONTINUE
Current line: v0.8.7-reconstruction
Current milestone: M6 — Real Chromium + ChatGPT validation / VERIFY
Current criterion: M6-C2

## Execution model
`docs/MILESTONES.md` is single work/progress authority; no BATON. PLAN→BUILD→VERIFY→FIX→VERIFY→DONE; UNVERIFIED != PASS. Normal stop only ALL_MILESTONES_DONE or verified SUCCESSOR_HANDOFF_COMPLETE. GitHub issue #1 comment created_at is timing authority.

## Completed milestones
M0 scope/relay DONE. M1 routing/delivery DONE. M2 runner lifecycle/reload DONE (run 35978969555). M3 dashboard/fleet static UX DONE. M4 popup/templates/cooldown static UX DONE. M5 rebuildable candidate DONE: exact candidate source `f51e4ba53753dade3bd3f9a64e2b3c50ca05d691`; run `35979821480` SUCCESS; NON-RELEASE artifact `10798948865`; Actions artifact digest `sha256:ca6ece70268ebf304cdab16260515911eeea45b6b67d44d981238c93bfdb251c`; inner candidate SHA in `candidate.sha256`.

## M6 evidence
- M6-C1 PASS: real Google Chrome loaded exact M5 candidate unpacked extension/dashboard. Actions run `35980470638` SUCCESS. This proves real Chromium extension/manifest/dashboard load only.
- M6-C2 remains UNVERIFIED, but the boundary is narrower: headless Chrome runs `35980886241` and `35980991521` successfully (a) restored exact candidate extension tree, (b) launched candidate dashboard, (c) opened and evaluated a real `https://chatgpt.com/` page target, and (d) confirmed the dashboard target has Chrome extension tabs API context. Both failed only at enumerating that ChatGPT tab through `chrome.tabs.query` from the headless Dashboard context. A callback-compatible query retry (`35981102115`) failed at the same final stage. Do not repeat the same headless tabs-query approach unchanged; this environment does not yet prove Dashboard control.
- Therefore C2 onward still require a supported real browser execution surface, preferably an authenticated interactive ChatGPT profile. Static/local extension-page evidence must not be promoted to PASS.
- Checklist/result: `docs/LIVE_SMOKE_CHECKLIST.md`, `docs/LIVE_SMOKE_RESULT_TEMPLATE.md`.
- Machine gate: `scripts/verify-live-smoke-result.mjs`; self-test is CI-guarded. `scripts/cdp-eval.mjs` is available for changed browser diagnostics.
- S9/S10 may be explicit NOT_OBSERVED only per checklist; observed FAIL reopens earlier milestone.

## M7 preparation while browser evidence is pending
- `docs/RELEASE_NOTES_DRAFT.md` and README candidate install/limitations ready.
- `scripts/build-final-release.sh` fail-closes on candidate/source-bound M6 evidence before repository verification and final ZIP/hash/content checks; NOT_OBSERVED limitations must appear in release notes.
- Route State Contract run `35980587537` succeeded with live-evidence verifier self-test and release-builder syntax gate.
- No final release ZIP or PROGRAM_COMPLETE before M6.

## Remaining path
1. Change execution surface/diagnostic for M6-C2; do not blind-repeat headless `chrome.tabs.query` failure.
2. Execute M6-C2 onward against exact candidate; fix/retest observed failures.
3. M6 PASS -> freeze final source -> fail-closed M7 release builder -> durable PROGRAM_COMPLETE evidence.

## Scope
ChatGPT-first. Reliability/simplification/recoverability before feature expansion. Claude/Gemini/Grok remain deferred.
