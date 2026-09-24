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
- Durable live evidence is part of the release bundle and is rehashed/reverified at consumption; post-publish mutation and self-consistent invalid-evidence forgery regressions pass.
- Route State Contract run `36004651574` SUCCESS after correcting an orchestration test that referenced an intentionally deleted ephemeral verifier snapshot.
- Release-repository attribution has an external trust anchor at consumption. Run `36005052974` SUCCESS.
- Trusted repository SHA alone did not authenticate release bytes, so `verify-release-ready.sh` additionally requires trusted artifact SHA256. Run `36005332626` SUCCESS.
- Trusted repository SHA + ZIP digest did not authenticate semantic sidecars, so consumption additionally requires an externally trusted `.ready` SHA256. Route State Contract run `36005664683` SUCCESS at `3e944debe23f69bc367d59148674f0e1a1dbd3d9`.
- `docs/TRUSTED_PUBLICATION_RECORD.md` defines the minimal external record: schema + release repository SHA + artifact SHA256 + ready SHA256. GitHub Artifact Attestations are the preferred candidate trust channel, but no release/attestation is authorized before M6 PASS.
- Pure pre-M6 schema hardening is executable: `scripts/verify-publication-record.mjs` accepts exactly four unique fields and rejects unknown/duplicate/missing fields, schema downgrade, and malformed hashes. Route State Contract run `36006849396` SUCCESS, including `test-publication-record-verifier.mjs`.
- GitHub CLI verification semantics were checked against current documentation: verification takes the artifact/record file as the subject, requires repository/owner identity, supports signer repository/workflow pinning, predicate-type pinning, and source-digest pinning. Merely fetching attestation JSON is not verification.
- `scripts/verify-trusted-publication.sh` now defines the safe consumer adapter without creating a real attestation: parse the exact publication-record bytes fail-closed, then run `gh attestation verify` on that same file with `--repo amzsdq/parrot`, `--signer-repo amzsdq/parrot`, SLSA v1 predicate pinning, and `--source-digest` equal to the record's `release_repo_sha`. Parsed identities are emitted only after cryptographic verification succeeds.
- `scripts/test-trusted-publication.sh` uses a fake `gh` boundary to prove exact-subject invocation and policy flags, propagation of attestation-verification failure, and rejection of malformed record bytes before trust. The first CI run `36007614925` exposed a test-only positional assertion bug (`$2` vs `$3` for the record argument); commit `b32d6d0fce945a04a7540aec39e538a577c39115` corrected it. Route State Contract run `36007709877` SUCCESS.
- Signer-workflow pinning was audited against the current repository and GitHub CLI contract. GitHub recommends `--signer-workflow` (or `--signer-digest`) for stronger actor identity, but the repository currently has only `.github/workflows/m6-chromium-load-smoke.yml` and `.github/workflows/route-state-contract.yml`; neither is an authorized M7 release signer. Therefore adding a guessed signer pin or wrong-signer regression now would encode a false trust root. `docs/TRUSTED_PUBLICATION_RECORD.md` makes workflow creation/review + canonical path freeze an explicit M7 gate before adding the signer pin/regression (commit `82d2930b756c049bd5eb966d63dfa79ef6c4b25c`).
- Dedicated release-workflow trust was audited against current GitHub guidance. A valid attestation proves which workflow made a claim but does not make attacker-controlled workflow inputs safe. The future signer must therefore use a maintainer-controlled trigger, exact authorized 40-hex source checkout with `HEAD` equality verification, no PR/fork-controlled executable inputs or privileged artifact bridge, least-privilege token/OIDC/attestation permissions, immutable pins for executable actions/reusable workflows, and must derive+attest the exact publication-record bytes only after final ZIP/ready bytes are immutable. These are documented implementation gates only; no release workflow was created before M6 PASS (docs commit `6fe6fe118a489b3a5f413af8cbb73d21b07cc61c`).
- Source authorization and workflow revision are separate trust identities. `docs/WORKFLOW_IDENTITY_AUDIT.md` records that signer path pinning does not freeze future revisions or nested mutable dependencies; use independently trusted `--signer-digest` only when intentionally pinning one reviewed workflow revision, and immutable SHAs for executable dependencies (commit `5de49c8b511deccdd58246cda2b37eb1fa680e6d`).
- Signer-digest lifecycle/rerun audit found two additional policy gaps before implementation. An expected signer digest must be independently approved/rotated/revoked; leaving old revisions accepted indefinitely collapses revision pinning toward path-only trust. GitHub re-runs keep the original SHA/ref and original actor privileges while `triggering_actor` may differ, so a stale authorized run can otherwise replay publication authority. Future privileged publication should therefore fail closed on `github.run_attempt != 1` unless a stronger explicit idempotent rerun design is proven. Recovery uses a fresh maintainer dispatch under current policy. These are design gates only; no speculative workflow/test was created (audit commit `e7b335cf013310c2c3b2f099e4843eb4b46be4b2`).
- Do not build a local parser for GitHub CLI certificate/timestamp JSON. `gh attestation verify` remains the cryptographic verifier; Parrot only supplies stricter identity policy.
- Product `extension/` bytes were not edited by this hardening work.

## Remaining path
1. Keep `verify-trusted-publication.sh` as the boundary between cryptographic attestation verification and `verify-publication-record.mjs`; never trust raw attestation predicate JSON or bundle-local values as the trust root.
2. Do not pin either existing CI workflow as the release signer. After M6 PASS, create/review the dedicated release publication workflow under the documented trusted-builder gates, freeze its canonical path, define independently trusted signer-revision activation/rotation/revocation policy, then add `--signer-workflow` and executable wrong-workflow/wrong-source/rerun regressions; add `--signer-digest` only if intentionally pinning one immutable workflow revision.
3. Do not create a real release or attestation before M6 PASS. Continue only safe verifier preparation or genuinely new trust-boundary audits.
4. Obtain a supported authenticated interactive Chrome+ChatGPT surface and execute M6-C2 onward against exact candidate.
5. After M6 PASS, re-verify candidate identity, freeze release-repository SHA, run final builder, persist release evidence, create the three-identity publication record, attest that exact record with the pinned release workflow, cryptographically verify repository/signer + exact subject + source commit, then pass the parsed identities to `verify-release-ready.sh`.

## Scope
ChatGPT-first. Reliability/simplification/recoverability before feature expansion. Claude/Gemini/Grok remain deferred.