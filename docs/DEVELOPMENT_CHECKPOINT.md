# Parrot development checkpoint

Status: CONTINUE
Current line: v0.8.7-reconstruction
Current milestone: M6 — Real Chromium + ChatGPT validation / VERIFY
Current criterion: M6-C2

## Execution model
`docs/MILESTONES.md` is single work/progress authority; no BATON. PLAN→BUILD→VERIFY→FIX→VERIFY→DONE; UNVERIFIED != PASS. Normal stop only ALL_MILESTONES_DONE or verified SUCCESSOR_HANDOFF_COMPLETE. GitHub issue #1 comments are durable relay/timing evidence.

## Completed milestones
M0 scope/relay DONE. M1 routing/delivery DONE. M2 runner lifecycle/reload DONE (run 35978969555). M3 dashboard/fleet static UX DONE. M4 popup/templates/cooldown static UX DONE. M5 rebuildable candidate DONE: exact candidate source `f51e4ba53753dade3bd3f9a64e2b3c50ca05d691`; run `35979821480` SUCCESS; NON-RELEASE artifact `10798948865`; Actions artifact digest `sha256:ca6ece70268ebf304cdab16260515911eeea45b6b67d44d981238c93bfdb251c`; inner candidate ZIP hash in `candidate.sha256`.

## M6 evidence
- M6-C1 PASS: real Google Chrome loaded exact M5 candidate unpacked extension/dashboard. Actions run `35980470638` SUCCESS. This proves real Chromium extension/manifest/dashboard load only.
- M6-C2 remains UNVERIFIED. Headless Chrome runs `35980886241`, `35980991521`, and callback-compatible retry `35981102115` did not supply valid authenticated ChatGPT-control evidence. The real `https://chatgpt.com/` target was unauthenticated Cloudflare `Just a moment...`; the supposed dashboard DevTools target later evaluated as `chrome-error://chromewebdata/` with `chrome.tabs` unavailable. This is an execution-surface limitation, not a candidate product FAIL. Do not repeat this headless path unchanged.
- C2 onward require a supported interactive/authenticated Chrome+ChatGPT surface that keeps the candidate extension page alive and exposes real conversation tabs. Static/local extension evidence cannot be promoted to PASS.
- Checklist/result: `docs/LIVE_SMOKE_CHECKLIST.md`, `docs/LIVE_SMOKE_RESULT_TEMPLATE.md`.
- Machine gate: `scripts/verify-live-smoke-result.mjs`; self-test is CI-guarded. Live evidence requires exact candidate binding, explicit authenticated-session structural provenance, real ChatGPT target URLs, ISO-8601 UTC Z timestamps, exactly one S1..S11 result row per case, required case evidence, decision consistency, and explicit S9/S10 limitations when NOT_OBSERVED. Duplicate case rows are rejected so contradictory rows cannot be hidden by last-row parsing. Hardening commits: verifier `4a4708d378a3ce119b32b75fda54704d8779a905`, regression test `449840689c20531c452193db917f0b988f545712`; Route State Contract run `35992843454` started for the exact test head.

## M7 preparation while browser evidence is pending
- Final builder is bound to exact M6 candidate `f51e4ba53753dade3bd3f9a64e2b3c50ca05d691`; it rejects dirty/untracked `extension/`, committed candidate-tree drift, non-`.zip` output, invalid live evidence, and stale output/provenance before rebuilding.
- Builder provenance records `candidate_sha`, `release_repo_sha`, and SHA-256 of the exact authenticated live-result file consumed by the build. Release notes document the same evidence chain.
- Fresh compare through duplicate-row hardening head `449840689c20531c452193db917f0b988f545712` is 60 commits ahead of exact candidate and lists **no `extension/` changed files**. Product bytes therefore remain candidate-identical while evidence/release tooling advances.
- Route State Contract run `35986859199` for earlier live-evidence-digest release provenance completed SUCCESS. Duplicate-row hardening exact-head run `35992843454` is pending/in progress and must be checked before treating that hardening as verified.
- `docs/V087_RUNTIME_GAP_AUDIT.md` and `docs/RECONSTRUCTION_PLAN_v0.8.7.md` were stale pre-candidate documents that still described already-implemented runtime work as open. They now explicitly record M5 completion and defer current authority to MILESTONES, removing contradictory release-blocker guidance without weakening M6.
- README and `docs/RELEASE_NOTES_DRAFT.md` document candidate-tree identity, authenticated M6 requirement, deferred adapters, and NOT_OBSERVED limitations. GitHub Releases remains empty; no premature release exists.
- Active `docs/BATON.md`, `docs/TODO.md`, and `docs/STATE.md` are absent. Historical BATON text remains only inside `DEVELOPMENT_LOG.md`, whose header explicitly marks it non-authoritative history.

## Remaining path
1. Obtain a supported authenticated interactive Chrome+ChatGPT execution surface for M6-C2; do not blind-repeat the invalid headless probe.
2. Execute M6-C2 onward against exact candidate; fix/retest observed product failures and reopen affected earlier milestone when required.
3. While M6 evidence is externally unavailable, continue independent M7 acceptance/documentation/release-hardening verification without claiming M6/M7 PASS.
4. Check Route State Contract run `35992843454`; if green, record duplicate-row gate as verified. If red, diagnose/fix/retest rather than waiving it.
5. After M6 PASS, re-verify current `extension/` equals candidate tree, freeze release-repository SHA, run fail-closed final builder, persist ZIP/file-list/hash/provenance evidence, then close M7 only if every criterion passes.

## Scope
ChatGPT-first. Reliability/simplification/recoverability before feature expansion. Claude/Gemini/Grok remain deferred.