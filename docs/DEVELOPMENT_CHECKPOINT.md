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
- `scripts/verify-live-smoke-result.mjs` requires exact candidate binding, authenticated-session structural provenance, real ChatGPT target URLs, ISO UTC timestamps, exactly one S1..S11 row, required evidence, decision consistency, and explicit NOT_OBSERVED limitations. Duplicate rows are rejected.

## M7 preparation while authenticated browser evidence is pending
- Limitation-note regression is CI-confirmed in run `35993385261`; final-builder structural boundary regression is CI-confirmed in run `35993671018`.
- Release preflight is executable shared production/test logic. `scripts/verify-release-preflight.sh` rejects unstaged, staged, untracked `extension/` changes and committed candidate-tree drift; `scripts/test-release-preflight.sh` exercises all four rejection modes. Full-history repair is confirmed by run `35994722114` SUCCESS.
- Output cleanup is shared executable production/test logic. `scripts/prepare-release-output.sh` removes stale ZIP/checksum/file-list/provenance and rejects non-ZIP output. `scripts/test-release-output-cleanup.sh` executes those boundaries. Route State Contract run `35995112380` SUCCESS confirms this regression in CI.
- Provenance is shared executable production/test logic. `scripts/write-release-provenance.sh` writes exact candidate SHA, release-repository SHA, and SHA256 of the actual live-result file and fails closed when that evidence file is missing. `scripts/test-release-provenance.sh` executes the positive content assertions and missing-evidence rejection. Route State Contract run `35995510881` SUCCESS confirms this regression in CI.
- Candidate-bound live-evidence invocation is shared through `scripts/verify-candidate-live-evidence.sh`; production and executable regression use the same boundary. Route State Contract run `35995788679` SUCCESS confirms exact RESULT/CANDIDATE_SHA forwarding, verifier failure propagation, and missing-candidate rejection in CI.
- Archive integrity/checksum orchestration is shared through `scripts/build-release-archive.sh`; production delegates ZIP creation, integrity check, sorted file list, SHA256 generation/check, and manifest-version assertion to it. `scripts/test-release-archive.sh` executes positive and negative boundaries. Route State Contract run `35996150378` SUCCESS confirms the archive regression in CI.
- Builder-level orchestration now has an executable regression in `scripts/test-final-release-orchestration.sh`. It runs the actual `build-final-release.sh` in a temporary clone with instrumented shared gates, asserts delegation order `preflight -> live evidence -> limitations -> cleanup -> archive -> provenance`, checks candidate/result/output argument propagation, and verifies a preflight non-zero exit stops the builder immediately with the same status. Commit `bb2f3199117ce75e38765712988a8ebfaf9eb136` added it to Route State Contract; run `35996442865` was in progress at checkpoint time, so do not claim CI confirmation until it succeeds.
- No product `extension/` bytes were changed by these release-hardening commits.

## Remaining path
1. Confirm Route State Contract run `35996442865`; if the new orchestration regression fails, repair its exact failure and rerun.
2. If successful, extend builder orchestration regression to another meaningful fail-closed transition (for example verifier/limitation/archive failure short-circuit) rather than adding more source-pattern assertions.
3. Obtain a supported authenticated interactive Chrome+ChatGPT surface and execute M6-C2 onward against exact candidate.
4. After M6 PASS, re-verify candidate tree identity, freeze release-repository SHA, run the final builder, persist ZIP/file-list/hash/provenance evidence, and close M7 only when every criterion passes.

## Scope
ChatGPT-first. Reliability/simplification/recoverability before feature expansion. Claude/Gemini/Grok remain deferred.