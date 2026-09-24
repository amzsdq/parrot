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
- Release preflight is now executable shared production/test logic. `scripts/verify-release-preflight.sh` rejects unstaged, staged, or untracked `extension/` changes and committed candidate-tree drift before authenticated live evidence is consulted. `scripts/build-final-release.sh` calls this same preflight, avoiding test/production divergence.
- `scripts/test-release-preflight.sh` clones the repository into an isolated temporary worktree and exercises clean-pass plus four non-zero rejection cases: unstaged product change, staged product change, untracked product file, and committed candidate drift. No product `extension/` bytes were intentionally changed on main.
- Route State Contract now syntax-checks and executes the new preflight regression. Integration head `fb279e945977a856cce89bd00e51907f1aa456a3`; run `35994081636` started and is still in progress at this checkpoint, so CI success is not yet claimed.
- These release-tooling tests do not substitute for authenticated M6 browser evidence and do not close M6/M7.

## Remaining path
1. Resolve Route State Contract run `35994081636`; if the executable preflight test fails, inspect the failing case and repair it immediately.
2. After CI success, harden the next final-release boundary with executable behavior rather than source-pattern-only assertions, prioritizing output/provenance cleanup or candidate-bound invocation behavior.
3. Obtain a supported authenticated interactive Chrome+ChatGPT surface and execute M6-C2 onward against exact candidate.
4. After M6 PASS, re-verify candidate tree identity, freeze release-repository SHA, run the final builder, persist ZIP/file-list/hash/provenance evidence, and close M7 only when every criterion passes.

## Scope
ChatGPT-first. Reliability/simplification/recoverability before feature expansion. Claude/Gemini/Grok remain deferred.
