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
- Commit `38f959e7ba631ac2e7be217e329f0dcc9cd0d5e4` made the final builder explicitly fail closed when NOT_OBSERVED evidence lacks release-note coverage. Exact-head run `35992931371` succeeded.
- The independent limitation-note regression is confirmed in integration run `35993385261`: `scripts/test-release-limitations.sh` completed SUCCESS together with the full Route State Contract job. The gate rejects missing notes, missing S9 text, missing S10 text, and permits complete/no-limitation evidence.
- Final-builder boundary coverage is now explicit. `scripts/test-final-release-boundaries.sh` guards dirty unstaged/staged/untracked `extension/`, candidate-tree identity, candidate-bound live verification, limitation gate invocation, stale-output cleanup, ZIP integrity, checksum, and provenance fields. CI was updated to syntax-check and execute it. Integration head `5b85b9736aba16124f72149afffb6f732219cc99`; run `35993671018` was queued when this checkpoint was written and must be confirmed next.
- These are structural regression guards, not substitutes for the authenticated M6 browser evidence and not proof of the full builder success path. M6/M7 remain open.
- Product bytes remain intentionally untouched during this release-tooling hardening; any `extension/` change would require a new candidate and M6 repetition.

## Remaining path
1. Confirm Route State Contract run `35993671018`; if the new boundary regression fails, inspect the exact failed pattern and repair it immediately.
2. If green, strengthen the highest-value remaining release boundary with executable behavior rather than only source-pattern assertions where practical; prioritize dirty-tree/candidate-drift rejection without needing authenticated live evidence.
3. Obtain a supported authenticated interactive Chrome+ChatGPT surface and execute M6-C2 onward against exact candidate.
4. After M6 PASS, re-verify candidate tree identity, freeze release-repository SHA, run the final builder, persist ZIP/file-list/hash/provenance evidence, and close M7 only when every criterion passes.

## Scope
ChatGPT-first. Reliability/simplification/recoverability before feature expansion. Claude/Gemini/Grok remain deferred.
