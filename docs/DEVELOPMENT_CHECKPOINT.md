# Parrot development checkpoint

Status: CONTINUE
Current line: v0.8.7-reconstruction
Current milestone: M6 — Real Chromium + ChatGPT validation / VERIFY
Current criterion: M6-C2

## Execution model
`docs/MILESTONES.md` is single work/progress authority; no BATON. `docs/PARROT_RELAY_GUIDE.md` describes the self-renewing execution convention. M6 remains fail-closed: authenticated real ChatGPT evidence is required and static/headless evidence never substitutes.

## Completed milestones
M0 scope/relay DONE. M1 routing/delivery DONE. M2 runner lifecycle/reload DONE (run 35978969555). M3 dashboard/fleet static UX DONE. M4 popup/templates/cooldown static UX DONE. M5 rebuildable candidate DONE: exact candidate source `f51e4ba53753dade3bd3f9a64e2b3c50ca05d691`; run `35979821480` SUCCESS; NON-RELEASE artifact `10798948865`; Actions artifact digest `sha256:ca6ece70268ebf304cdab16260515911eeea45b6b67d44d981238c93bfdb251c`.

## M6 evidence
- M6-C1 PASS: real Google Chrome loaded exact M5 candidate unpacked extension/dashboard; run `35980470638` SUCCESS.
- M6-C2 remains UNVERIFIED. Existing headless attempts reached an unauthenticated Cloudflare surface and cannot satisfy the authenticated interactive ChatGPT requirement. Do not repeat that path unchanged.
- C2 onward require a supported authenticated interactive Chrome+ChatGPT surface. Checklist/result: `docs/LIVE_SMOKE_CHECKLIST.md`, `docs/LIVE_SMOKE_RESULT_TEMPLATE.md`.
- `scripts/verify-live-smoke-result.mjs` requires exact candidate binding, authenticated-session structural provenance, real ChatGPT target URLs, ISO UTC timestamps, exactly one S1..S11 row, required evidence, decision consistency, and explicit NOT_OBSERVED limitations. Duplicate rows are rejected. Exact-head duplicate-row hardening run `35992843454` succeeded.

## M7 preparation while authenticated browser evidence is pending
- Limitation-note regression is CI-confirmed in run `35993385261`; final-builder structural boundary regression is CI-confirmed in run `35993671018`.
- Release preflight is executable shared production/test logic. `scripts/verify-release-preflight.sh` rejects unstaged, staged, or untracked `extension/` changes and committed candidate-tree drift; `scripts/build-final-release.sh` calls the same preflight.
- `scripts/test-release-preflight.sh` exercises clean-pass plus unstaged, staged, untracked, and committed candidate-drift rejection in an isolated clone.
- Route State Contract run `35994081636` FAILED specifically because Actions checkout used the default shallow `fetch-depth: 1`; the historical M5 candidate object `f51e4ba...` was absent, producing `fatal: bad object`, so the executable test could not compare against the candidate. This was an execution-environment defect, not a candidate mismatch.
- Workflow repair commit `371e68caacc82754f522754fdb62ba8c7c51519b` sets checkout `fetch-depth: 0` so the exact historical candidate is available to the preflight regression. Await the resulting Route State Contract run and do not claim success until it completes.
- No product `extension/` bytes were changed by this repair.

## Remaining path
1. Confirm the Route State Contract run for repair commit `371e68caacc82754f522754fdb62ba8c7c51519b`; if preflight still fails, inspect and repair the exact case.
2. After executable preflight CI passes, replace the next source-pattern-only final-release boundary with executable behavior, prioritizing output/provenance cleanup or candidate-bound invocation.
3. Obtain a supported authenticated interactive Chrome+ChatGPT surface and execute M6-C2 onward against exact candidate.
4. After M6 PASS, re-verify candidate tree identity, freeze release-repository SHA, run the final builder, persist ZIP/file-list/hash/provenance evidence, and close M7 only when every criterion passes.

## Scope
ChatGPT-first. Reliability/simplification/recoverability before feature expansion. Claude/Gemini/Grok remain deferred.
