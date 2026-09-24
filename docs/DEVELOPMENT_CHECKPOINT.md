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
- Commit `38f959e7ba631ac2e7be217e329f0dcc9cd0d5e4` made the final builder explicitly fail closed when NOT_OBSERVED evidence lacks release-note coverage. Its exact-head Route State Contract run `35992931371` completed SUCCESS.
- The limitation-note gate is now independently testable instead of being covered only indirectly inside the full release builder. `scripts/verify-release-limitations.sh` owns the gate and `scripts/test-release-limitations.sh` exercises missing notes, missing S9 text, missing S10 text, complete notes, and the no-limitation path. `scripts/build-final-release.sh` consumes the same tested gate. CI now syntax-checks and executes this regression test. Integration head: `253c65cf8c91c69af77c2c01d052cd587865bd06`; its CI result still needs confirmation.
- Compare exact M5 candidate -> integration head reports 67 commits ahead and no `extension/` changed file. Product bytes therefore remain candidate-identical while evidence/release tooling advances.
- Final builder remains bound to exact candidate and rejects dirty/untracked `extension/`, committed candidate-tree drift, non-`.zip` output, invalid live evidence, and stale output/provenance before rebuilding.
- README and release notes retain candidate-tree identity, authenticated M6 requirement, deferred adapters, and NOT_OBSERVED limitations. No M6/M7 PASS is claimed from release-tooling work.

## Remaining path
1. Confirm Route State Contract for `253c65cf8c91c69af77c2c01d052cd587865bd06`; fix immediately if the new regression test fails.
2. Continue adversarial release-builder tests where they add real fail-closed coverage, especially candidate-tree/dirty-tree/output/provenance boundaries, without changing `extension/`.
3. Obtain a supported authenticated interactive Chrome+ChatGPT surface and execute M6-C2 onward against exact candidate.
4. After M6 PASS, re-verify candidate tree identity, freeze release-repository SHA, run the final builder, persist ZIP/file-list/hash/provenance evidence, and close M7 only when every criterion passes.

## Scope
ChatGPT-first. Reliability/simplification/recoverability before feature expansion. Claude/Gemini/Grok remain deferred.
