# Trusted release publication record — M7 design (NOT RELEASED)

This document prepares the trust boundary for M7. It does not publish a release and does not satisfy M6 or M7 by itself.

## Purpose

`verify-release-ready.sh` deliberately treats bundle-local metadata as untrusted. A consumer needs three identities from a trusted publication channel before accepting a release:

```text
release_repo_sha=<40-hex Git commit>
artifact_sha256=<64-hex SHA-256 of final release ZIP>
ready_sha256=<64-hex SHA-256 of <release.zip>.ready>
```

The repository SHA attributes the release tooling/state. The ZIP digest authenticates the product artifact bytes. The `.ready` digest authenticates the manifest that binds the checksum, file list, provenance, and durable live-evidence sidecars. Removing any one of the three reopens a tested misattribution/forgery boundary.

## Minimum signed/attested record

When M6 is PASS and M7 publication is actually authorized, publish one immutable record containing exactly these semantic fields plus an explicit schema/version identifier:

```text
schema=parrot-release-publication-v1
release_repo_sha=<40-hex>
artifact_sha256=<64-hex>
ready_sha256=<64-hex>
```

Do not derive the trusted values from the downloaded bundle during verification. The verifier receives them from the independently authenticated publication record and then calls:

```text
scripts/verify-release-ready.sh <release.zip> <release_repo_sha> <artifact_sha256> <ready_sha256>
```

The record is the trust anchor; `.ready`, provenance, and other sidecars remain evidence beneath that anchor, not substitutes for it.

## Preferred attestation path

For the public `amzsdq/parrot` repository, GitHub Artifact Attestations are a suitable M7 implementation candidate because GitHub Actions can create signed build provenance for file subjects and consumers can cryptographically verify attestation signatures and signer/repository identity. The implementation should not be enabled before M6 PASS.

A minimal implementation should make the publication record itself the attested subject. Attesting only the ZIP is insufficient because the tested sidecar-forgery boundary requires an independently authenticated `ready_sha256` as well.

Do not treat merely fetching an attestation JSON document as verification. Signature/timestamp and signer identity must be cryptographically verified by the consumer.

## Consumer adapter contract

The pre-M6 adapter `scripts/verify-trusted-publication.sh` defines the intended consumer boundary without creating an attestation. It first fail-closed parses the exact record bytes, then invokes GitHub CLI attestation verification on that same file path. This is important: GitHub CLI computes/verifies the supplied file as the attestation subject, so a valid attestation for a different record cannot be substituted.

The adapter pins all independently meaningful identities available from GitHub CLI:

```text
--repo amzsdq/parrot
--signer-repo amzsdq/parrot
--predicate-type https://slsa.dev/provenance/v1
--source-digest <release_repo_sha parsed from the exact record>
--source-ref refs/heads/main
```

`--repo` constrains the repository associated with the attestation lookup/identity; `--signer-repo` constrains the signing workflow repository; `--predicate-type` prevents accepting an unrelated claim type; `--source-digest` binds the cryptographically verified provenance source commit to the same release repository SHA that the record claims; and `--source-ref refs/heads/main` independently enforces the canonical source-authorization branch. Digest alone is insufficient for this policy because an alternate branch or tag can point at the same commit. The parsed identities are emitted only after `gh attestation verify` succeeds.

### Final signer pinning gate

GitHub CLI recommends validating the signer workflow path as precisely as possible with `--signer-workflow` (or pinning the signer workflow commit with `--signer-digest`). That is materially stronger than repository-only signer pinning because another workflow in the same repository must not be allowed to mint an accepted publication record.

Do **not** add a guessed signer workflow path or digest before the release workflow exists. As of this design checkpoint the repository contains only the M6 Chromium smoke workflow and Route State Contract workflow; neither is an authorized M7 release signer. Prematurely pinning either one would encode the wrong trust root rather than harden it.

The M7 implementation gate is therefore:

1. create/review the dedicated release publication workflow only after M6 PASS authorizes release work;
2. freeze its canonical repository path;
3. choose `--signer-workflow <host/owner/repo/path>` as the stable identity policy, optionally adding `--signer-digest <workflow-commit>` when deliberately requiring one immutable workflow revision;
4. add an executable consumer regression where a cryptographically valid attestation from another workflow in `amzsdq/parrot` is rejected by the signer pin;
5. only then enable real publication/attestation.

Do not parse GitHub CLI certificate/timestamp output to build a weaker local cryptographic verifier. `gh attestation verify` remains the cryptographic boundary; Parrot only supplies stricter identity policy to it.

### Dedicated release workflow security boundary

Signer-path pinning is necessary but not sufficient. GitHub provenance records workflow/repository/ref/event context, but an attestation only proves that the identified workflow made the claim; it does not make unsafe workflow inputs trustworthy. The eventual dedicated release workflow therefore becomes part of the trusted computing base and MUST be reviewed as such before its canonical path is frozen.

Minimum design for that workflow after M6 PASS:

1. **Trusted trigger only.** Prefer an explicit maintainer-controlled release dispatch after M6 PASS. Do not use `pull_request`, `pull_request_target`, `issue_comment`, `workflow_run` fed by PR artifacts, or any trigger that can cause privileged publication while incorporating fork/PR-controlled executable content. If `workflow_dispatch` is used, the workflow must fail closed unless the checked-out/ref-resolved commit is the explicitly authorized release commit.
2. **Exact source identity.** Build and construct the publication record only from the authorized full 40-hex `release_repo_sha`; do not build from a mutable branch/tag name and later merely write a chosen SHA into provenance. Checkout must be detached/pinned to that exact commit and the workflow must verify `HEAD == release_repo_sha` before building.
3. **No untrusted executable inputs.** Release inputs may select only already-authorized immutable identities; they must not become shell fragments, checkout repository/ref selectors, action names, script paths, arbitrary artifact URLs, or other executable/control-plane values. Do not download and execute artifacts produced by untrusted PR/fork workflows.
4. **Least privilege.** Start with `permissions: {}` (or equivalent explicit deny-by-default) and grant only `contents: read`, `id-token: write`, and `attestations: write` to the smallest job that needs them. Add release-asset write permission only if/when publication is actually implemented and isolate that job from untrusted data. Do not grant repository-wide write permissions merely because attestation needs OIDC.
5. **Pinned dependencies.** Third-party actions and reusable workflows are executable members of the trusted builder. Pin them to reviewed immutable commit SHAs. If a reusable workflow performs the attestation, that reusable workflow—not merely the caller—is the signer identity that the consumer must pin. Do not allow a caller input to select the reusable workflow/ref dynamically.
6. **No privileged PR bridge.** Never use `pull_request_target`, `issue_comment`, or `workflow_run` as a bridge that obtains write/OIDC/attestation authority and then checks out, downloads, sources, or executes PR/fork-controlled code or artifacts. GitHub explicitly treats artifacts from other workflows as untrusted data in this class of design.
7. **Attest last from derived bytes.** Generate the publication record only after the final ZIP and `.ready` are immutable and their digests are computed by the trusted job. Attest the exact record path that is subsequently published; do not accept caller-supplied digest fields as authoritative.

### Source authorization and dispatch-ref gate

A full 40-hex input is immutable as an identifier, but it is not authorization. If a release workflow accepts `release_repo_sha` as an arbitrary dispatch input and then attests it, the source identity is circular/self-asserted: the caller chooses the claim that the signer later authenticates. GitHub also permits `workflow_dispatch` runs against a selected branch or tag, so a signer path alone must not make an arbitrary dispatch ref trusted.

The preferred M7 design is therefore to remove caller-selected source identity entirely:

1. the dedicated workflow exists on the protected default branch and is manually dispatched by an authorized maintainer only after M6 PASS;
2. the workflow fails closed unless `github.ref` is exactly the canonical protected default-branch ref (currently expected to be `refs/heads/main` once the workflow is implemented and reviewed); do not accept a tag, release branch, or API/CLI-selected alternate ref;
3. set `release_repo_sha` from the event's immutable `github.sha`, not from a workflow input, branch lookup performed later, tag lookup, or caller-supplied SHA;
4. checkout exactly `${{ github.sha }}` detached and verify `git rev-parse HEAD == "$GITHUB_SHA"` before any build or record construction;
5. carry that same SHA unchanged into provenance, the publication record, and attestation source identity. Consumer `--source-digest` must match it, and consumer `--source-ref refs/heads/main` must independently prove the attested run came from the canonical authorization ref;
6. do not re-resolve `main` after the run starts. The branch may advance normally; the event-captured commit remains the authorized source for that run.

This makes the maintainer's dispatch of the canonical protected branch at its then-current immutable event SHA the authorization act, rather than allowing the workflow to authenticate its own arbitrary SHA input. If stronger human separation is later required, put the publication job behind a reviewed GitHub Environment approval, but do not substitute environment approval for exact source binding.

Mutable pre-publication tags are not an authorization root. A tag can only serve that role if repository policy independently prevents its update/deletion by the relevant actors. Prefer the event-captured canonical-branch SHA for builder authorization. After publication, GitHub immutable releases are an additional delivery-integrity control: their associated tag and release assets are locked and GitHub creates a release attestation. That post-publication immutability complements, but does not replace, pre-build source authorization.

When the real release workflow exists, add executable regressions proving that an alternate dispatch ref and any caller-supplied source SHA cannot alter the authorized `release_repo_sha`. Until then these remain implementation gates, not speculative pattern tests.

These are implementation gates, not a request to create the workflow now. Once the real workflow exists, executable regressions should target its actual policy: wrong signer workflow, wrong source commit/ref, and any accepted untrusted-input path that can alter the attested record. Do not add speculative pattern-only tests before there is executable workflow behavior to test.

## Publication ordering

1. M6 must be fully PASS against exact candidate `f51e4ba53753dade3bd3f9a64e2b3c50ca05d691`.
2. Freeze `release_repo_sha` from the authorized release-workflow event SHA under the source-authorization gate above.
3. Build final release and sidecars; create `.ready` last.
4. Compute final ZIP SHA-256 and `.ready` SHA-256 after publication files are immutable.
5. Construct the v1 publication record from the frozen repository SHA and those two digests.
6. Sign/attest that exact record through the trusted publication channel.
7. Publish release assets and the verifiable record/attestation.
8. Consumer verifies the exact record file with repository, signer, predicate, source-commit, and canonical-source-ref policy, then supplies the three authenticated values to `verify-release-ready.sh`.

A release must fail closed if the trusted record is absent, its signature/signer identity cannot be verified, any field is missing/duplicated/malformed, the attested subject is not the exact record bytes, the verified provenance source commit differs from `release_repo_sha`, the verified source ref is not canonical `refs/heads/main`, or the three values do not match the downloaded release component set.

## Explicit non-goals

- This design does not mark M6 or M7 PASS.
- It does not create or publish a GitHub Release.
- It does not change `extension/` bytes.
- It does not add more self-authenticating hashes inside the unsigned bundle; those cannot create a trust root.
- It does not generate an attestation before M6 PASS; the adapter is exercised with a fake `gh` boundary in regression tests only.
