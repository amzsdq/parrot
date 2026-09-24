# Parrot development checkpoint

Status: CONTINUE
Current line: v0.8.7-reconstruction
Current milestone: M6 — Real Chromium + ChatGPT validation / VERIFY
Current criterion: M6-C2

## Execution model
`docs/MILESTONES.md` is single work/progress authority; no BATON. PLAN→BUILD→VERIFY→FIX→VERIFY→DONE; UNVERIFIED != PASS. Normal stop only ALL_MILESTONES_DONE or verified SUCCESSOR_HANDOFF_COMPLETE. GitHub issue #1 comment created_at is timing authority.

## Completed milestones
M0 scope/relay DONE. M1 routing/delivery DONE. M2 runner lifecycle/reload DONE (run 35978969555). M3 dashboard/fleet static UX DONE. M4 popup/templates/cooldown static UX DONE. M5 rebuildable candidate DONE: exact candidate source `f51e4ba53753dade3bd3f9a64e2b3c50ca05d691`; run `35979821480` SUCCESS; NON-RELEASE artifact `10798948865`; Actions artifact digest `sha256:ca6ece70268ebf304cdab16260515911eeea45b6b67d44d981238c93bfdb251c`; inner candidate ZIP hash in `candidate.sha256`.

## M6 evidence
- M6-C1 PASS: real Google Chrome loaded exact M5 candidate unpacked extension/dashboard. Actions run `35980470638` SUCCESS. This proves real Chromium extension/manifest/dashboard load only.
- M6-C2 remains UNVERIFIED. Headless Chrome runs `35980886241`, `35980991521`, and callback-compatible retry `35981102115` changed the diagnostic but did not supply valid ChatGPT-control evidence. Latest logs show the real `https://chatgpt.com/` target was unauthenticated Cloudflare `Just a moment...`, and the supposed dashboard DevTools target later evaluated as `chrome-error://chromewebdata/` with `chrome.tabs` unavailable. Therefore the final tabs-query failure is an execution-surface limitation, not a candidate product FAIL. Do not repeat this headless path unchanged.
- C2 onward require a supported interactive/authenticated Chrome+ChatGPT surface that keeps the candidate extension page alive and exposes real conversation tabs. Static/local extension evidence cannot be promoted to PASS.
- Checklist/result: `docs/LIVE_SMOKE_CHECKLIST.md`, `docs/LIVE_SMOKE_RESULT_TEMPLATE.md`.
- Machine gate: `scripts/verify-live-smoke-result.mjs`; self-test is CI-guarded. `scripts/cdp-eval.mjs` remains diagnostic-only.
- S9/S10 may be explicit NOT_OBSERVED only per checklist; observed FAIL reopens earlier milestone.

## M7 preparation while browser evidence is pending
- `scripts/verify-live-smoke-result.mjs` validates environment provenance, required case evidence, S9/S10 explicit limitation handling, decision-summary consistency, and UTC decision time. Exact-head Route State Contract run `35983716086` for `49a9da4fecdc9afa2fd99bc45fba311cebe3246b` completed SUCCESS.
- Final builder is bound to exact M6 candidate `f51e4ba53753dade3bd3f9a64e2b3c50ca05d691`, records release-repository SHA separately, and fail-closes if committed `extension/` differs from candidate. Independent compare through main `584d25633a4d320ed73f27a900098fa46b4006e2` is 39 commits ahead with no `extension/` changed files; current manifest blob SHA also exactly matches candidate.
- Additional release hardening at `dd128d09ea3476775b5838ee0ca213d89ec5a69f`: final builder now rejects staged, unstaged, or untracked `extension/` changes before packaging, restricts output to `.zip`, and removes stale provenance before rebuilding. This closes the gap where a dirty working tree could otherwise package bytes not represented by the recorded release repository SHA. CI for this exact commit was not yet visible at checkpoint time; do not call that hardening verified until a matching run succeeds.
- `docs/RELEASE_NOTES_DRAFT.md` and README document candidate-tree identity and provenance requirements. GitHub Releases remains empty; no release was accidentally published.
- Obsolete `.github/workflows/mirror-baton-log.yml` was removed after the BATON layer was retired.
- No final release ZIP or PROGRAM_COMPLETE before M6.

## Remaining path
1. Change execution surface for M6-C2 to authenticated interactive Chrome+ChatGPT; do not blind-repeat the invalid headless dashboard/tab-query probe.
2. Execute M6-C2 onward against exact candidate; fix/retest observed product failures.
3. While M6 evidence is externally unavailable, continue independent M7 acceptance/documentation hardening without claiming M6/M7 PASS.
4. Verify CI for release-hardening commit `dd128d09...`; if it fails, fix/retest rather than waiving.
5. M6 PASS -> verify current `extension/` equals M6 candidate tree -> freeze release-repository SHA -> fail-closed M7 release builder -> durable PROGRAM_COMPLETE evidence.

## Scope
ChatGPT-first. Reliability/simplification/recoverability before feature expansion. Claude/Gemini/Grok remain deferred.
