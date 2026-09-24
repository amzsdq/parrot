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
```

`--repo` constrains the repository associated with the attestation lookup/identity; `--signer-repo` constrains the signing workflow repository; `--predicate-type` prevents accepting an unrelated claim type; and `--source-digest` binds the cryptographically verified provenance source commit to the same release repository SHA that the record claims. The parsed identities are emitted only after `gh attestation verify` succeeds.

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

## Publication ordering

1. M6 must be fully PASS against exact candidate `f51e4ba53753dade3bd3f9a64e2b3c50ca05d691`.
2. Freeze `release_repo_sha`.
3. Build final release and sidecars; create `.ready` last.
4. Compute final ZIP SHA-256 and `.ready` SHA-256 after publication files are immutable.
5. Construct the v1 publication record from the frozen repository SHA and those two digests.
6. Sign/attest that exact record through the trusted publication channel.
7. Publish release assets and the verifiable record/attestation.
8. Consumer verifies the exact record file with repository, signer, predicate, and source-commit policy, then supplies the three authenticated values to `verify-release-ready.sh`.

A release must fail closed if the trusted record is absent, its signature/signer identity cannot be verified, any field is missing/duplicated/malformed, the attested subject is not the exact record bytes, the verified provenance source commit differs from `release_repo_sha`, or the three values do not match the downloaded release component set.

## Explicit non-goals

- This design does not mark M6 or M7 PASS.
- It does not create or publish a GitHub Release.
- It does not change `extension/` bytes.
- It does not add more self-authenticating hashes inside the unsigned bundle; those cannot create a trust root.
- It does not generate an attestation before M6 PASS; the adapter is exercised with a fake `gh` boundary in regression tests only.
