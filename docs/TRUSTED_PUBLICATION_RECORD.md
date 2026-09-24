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

A minimal implementation should make the publication record itself the attested subject (or use a custom release predicate that carries the same three values), then require consumer verification of the attestation's signature and expected `amzsdq/parrot` repository identity before extracting the three trusted fields. Attesting only the ZIP is insufficient because the tested sidecar-forgery boundary requires an independently authenticated `ready_sha256` as well.

Do not treat merely fetching an attestation JSON document as verification. Signature/timestamp and signer identity must be cryptographically verified by the consumer (for example with GitHub CLI attestation verification) before the record becomes trusted input.

## Publication ordering

1. M6 must be fully PASS against exact candidate `f51e4ba53753dade3bd3f9a64e2b3c50ca05d691`.
2. Freeze `release_repo_sha`.
3. Build final release and sidecars; create `.ready` last.
4. Compute final ZIP SHA-256 and `.ready` SHA-256 after publication files are immutable.
5. Construct the v1 publication record from the frozen repository SHA and those two digests.
6. Sign/attest that exact record through the trusted publication channel.
7. Publish release assets and the verifiable record/attestation.
8. Consumer first verifies the publication record's signature + expected repository/signer identity, then supplies the three authenticated values to `verify-release-ready.sh`.

A release must fail closed if the trusted record is absent, its signature/signer identity cannot be verified, any field is missing/duplicated/malformed, or the three values do not match the downloaded release component set.

## Explicit non-goals

- This design does not mark M6 or M7 PASS.
- It does not create or publish a GitHub Release.
- It does not change `extension/` bytes.
- It does not add more self-authenticating hashes inside the unsigned bundle; those cannot create a trust root.
- It does not require an attestation implementation now. Implementation belongs after M6 PASS or when a release-publication workflow can be exercised without making a release claim.
