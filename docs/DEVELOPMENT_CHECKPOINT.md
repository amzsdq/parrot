# Parrot development checkpoint

Status: CONTINUE
Current line: v0.8.7-reconstruction
Current milestone: M6 — Real Chromium + ChatGPT validation / VERIFY
Current criterion: M6-C2

## Execution model
`docs/MILESTONES.md` is single work/progress authority; no BATON. `docs/PARROT_RELAY_GUIDE.md` describes the self-renewing execution convention. M6 remains fail-closed: authenticated real ChatGPT evidence is required and static/headless evidence never substitutes.

## Completed milestones
M0 scope/relay DONE. M1 routing/delivery DONE (run 35978969555). M3 dashboard/fleet static UX DONE. M4 popup/templates/cooldown static UX DONE. M5 rebuildable candidate DONE: exact candidate source `f51e4ba53753dade3bd3f9a64e2b3c50ca05d691`; run `35979821480` SUCCESS; NON-RELEASE artifact `10798948865`; Actions artifact digest `sha256:ca6ece70268ebf304cdab16260515911eeea45b6b67d44d981238c93bfdb251c`.

## M6 evidence
- M6-C1 PASS: real Google Chrome loaded exact M5 candidate unpacked extension/dashboard; run `35980470638` SUCCESS.
- M6-C2 remains UNVERIFIED. Existing headless attempts reached an unauthenticated Cloudflare surface and cannot satisfy the authenticated interactive ChatGPT requirement. Do not repeat that path unchanged.
- C2 onward require a supported authenticated interactive Chrome+ChatGPT surface. Checklist/result: `docs/LIVE_SMOKE_CHECKLIST.md`, `docs/LIVE_SMOKE_RESULT_TEMPLATE.md`.
- `scripts/verify-live-smoke-result.mjs` requires exact candidate binding, authenticated-session structural provenance, real ChatGPT target URLs, ISO UTC timestamps, exactly one S1..S11 row, required evidence, decision consistency, and explicit NOT_OBSERVED limitations. Duplicate rows are rejected.

## M7 preparation while authenticated browser evidence is pending
- Release preflight, limitation notes, stale-output cleanup, candidate-bound live verification, archive integrity/checksum, provenance writing, repository verification, tracked tooling/notes verification, and builder-level failure propagation are shared executable production/test boundaries.
- Final preflight is bound to exact M5/M6 candidate `f51e4ba53753dade3bd3f9a64e2b3c50ca05d691`; caller-selected alternatives are rejected. Selected release notes must be tracked by `RELEASE_SHA`.
- Live evidence TOCTOU is closed: builder freezes caller-owned live-result bytes once and sends the same immutable snapshot to candidate-bound verification and provenance hashing. Route State Contract run `35999409451` SUCCESS.
- Extension TOCTOU is closed: `extension/` is materialized directly from the exact candidate commit and ZIP/version come only from that immutable snapshot. Run `35999918438` SUCCESS.
- Publishability is explicit: `.ready` is committed last and consumption revalidates ZIP/sidecar/provenance semantics. Runs `36000634054`, `36001689948`, and `36002087686` SUCCESS.
- Concurrent publication is serialized per output path by atomic build lock. Run `36002946184` SUCCESS.
- Provenance consumption requires exact candidate identity plus well-formed release/live identities. Run `36003113219` SUCCESS.
- Frozen tooling nested escapes are closed for both live and repository verification: wrappers resolve their Node verifier relative to `$0`, and executable regressions mutate the worktree verifier to unconditional success while requiring the frozen verifier to reject invalid input.
- Durable live evidence is now part of the release bundle: the exact immutable bytes that passed candidate verification are persisted as `<release>.live-result.txt`; provenance hashes that persisted sidecar, `.ready` binds its hash, cleanup/failure removes it, and `verify-release-ready.sh` rehashes and reruns candidate-bound semantic verification at consumption. Post-publish evidence mutation and self-consistent invalid-evidence forgery regressions pass.
- Route State Contract run `36004107076` failed only because orchestration tried to compare the already-deleted ephemeral verifier snapshot path after builder exit; production durable-evidence behavior and the dedicated TOCTOU regression were not the failing boundary. Test commit `7875f0df2b72d1f0b16d81e48577eb3686b3e859` now compares the durable sidecar to unchanged caller bytes in the non-mutating case while retaining the separate mutation-after-snapshot proof. Route State Contract run `36004651574` SUCCESS, including full orchestration, repository validation, and candidate ZIP build/upload.
- Release-repository attribution has an external trust anchor at consumption. Run `36005052974` SUCCESS proved that a self-consistent forged `release_repo_sha` is rejected when it differs from the trusted expected commit.
- A further concrete gap was found in that boundary: trusted repository SHA alone does not authenticate release bytes. An attacker able to replace the unsigned bundle can change the ZIP, recompute checksum/file-list/provenance/`.ready`, and copy the expected repository SHA. `verify-release-ready.sh` therefore now requires both `<expected-release-repo-sha>` and `<expected-artifact-sha256>` from the trusted publication record/channel and rejects a self-consistent forged ZIP even when repository attribution remains correct. Regression commit `8e24dfca40a23a13458843b6ec9211356f49acb1`; Route State Contract run `36005332626` had the readiness regression, archive, boundaries, orchestration, repository validation, and candidate build/upload steps passing at checkpoint update, with only Actions post-job completion still pending. The immediately preceding run `36005302476` failed as expected because it changed the verifier contract before its test caller was updated; its only functional failure was `test-release-ready.sh`.
- This still deliberately does not claim an unsigned bundle can create its own trust root. The expected repository SHA and artifact digest must come from a trusted release record/channel; if M7 later has signing/attestation, bind both identities there.
- Product `extension/` bytes were not edited by this hardening work.

## Remaining path
1. Confirm Route State Contract run `36005332626` reaches final SUCCESS; if not, fix the exact failing executable regression.
2. Keep release repository SHA and artifact SHA256 externally anchored at consumption. Do not add more bundle-local hashes as a substitute for a trust root. If M7 publication provides signing/attestation, bind both expected identities to that channel.
3. Continue auditing only genuinely new cross-boundary release identity/publication failures; do not repeat candidate/live/tooling/readiness/concurrency/repository/artifact-attribution cases already covered.
4. Obtain a supported authenticated interactive Chrome+ChatGPT surface and execute M6-C2 onward against exact candidate.
5. After M6 PASS, re-verify candidate identity, freeze release-repository SHA, run final builder, persist release evidence, publish trusted release SHA + artifact digest, verify readiness against both external identities, and close M7 only when every criterion passes.

## Scope
ChatGPT-first. Reliability/simplification/recoverability before feature expansion. Claude/Gemini/Grok remain deferred.
