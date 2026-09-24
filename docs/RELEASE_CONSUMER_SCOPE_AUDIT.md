# M7 release-consumer / freshness scope audit (NOT RELEASED)

This is a scope audit only. It does not satisfy M6/M7 and creates no updater, policy state, release workflow, release, or attestation.

## Question

Earlier audits proved a real cryptographic-policy fact: if a consumer claims that a supplied publication is the **current/latest** release, exact publication identities plus a valid attestation do not by themselves prevent replay of an older fully valid publication. Before building a monotonic freshness control plane, this audit asks whether Parrot currently has any consumer that actually makes that latest/current claim.

## Repository reality checked

The current repository tree contains only two Actions workflows: M6 Chromium load smoke and Route State Contract. There is no release-publication workflow and no updater workflow. The GitHub Releases collection is currently empty.

The extension manifest is a local Manifest V3 unpacked extension contract. It declares local extension scripts, `storage`, `tabs`, and `alarms`, plus only `https://chatgpt.com/*` as host permission. It has no `update_url`, release endpoint, GitHub host permission, or other manifest-level automatic update channel.

The README installation path is explicit/manual: obtain the candidate bound to an exact source commit/Actions run, extract it, enable Developer mode, and choose **Load unpacked**. It does not instruct the extension to resolve a `latest` release or silently replace itself. Candidate Actions artifacts are explicitly described as temporary NON-RELEASE evidence bundles.

Repository search and tree inspection found no implementation named or structured as an updater/latest-release consumer, and no `releases/latest`, `update_url`, or automatic release-fetch path. The current M7 scripts build, freeze, publish-to-an-output-path, and verify explicitly supplied release material; they are release tooling, not an installed-client latest resolver.

## Scope decision

Therefore the previously demonstrated rollback/freeze gap is **real but not presently reachable through a current/latest consumer in Parrot's shipped product or current release path**. It becomes an acceptance vulnerability only when a component is introduced that automatically resolves or asserts `current/latest`, or when M7 explicitly promises that a fetched publication is current rather than merely authentic.

Do not implement the protected freshness branch, monotonic generation state, Environment gate, policy updater, consumer-persisted minimum, or replay regression merely to solve a consumer that does not yet exist. Doing so now would add a second control plane and operational trust machinery without protecting a reachable acceptance path.

For the present M7 scope, retain **exact-publication verification** only: a caller explicitly selects/provides publication material; Parrot verifies the exact publication record and attestation under the reviewed repository/source/signer/runner policy; successful verification means "this exact publication is authentic under policy", not "this is the newest release". Historical exact-publication verification may therefore accept an older valid publication by design.

## Deferred trigger

Freshness infrastructure becomes mandatory before merging or advertising any of these behaviors:

1. Extension/client code automatically discovers, downloads, installs, or recommends a GitHub `latest`/current release.
2. A bootstrap/install script resolves a mutable `latest` endpoint/ref without an independently trusted expected publication identity.
3. Release tooling or documentation changes the verification claim from exact/historical authenticity to current/latest authorization.
4. A service, dashboard, adapter, or other consumer chooses the release to run based on mutable repository/release state.

At that point reopen the existing freshness audits rather than redesigning from scratch: use independently authorized monotonic `(generation, publication_record_sha256)` state, explicit stale-base/CAS semantics, separate historical verification, and an executable replay of a previously valid publication.

## M7 boundary

This deferral does not weaken the already identified future requirement. It narrows M7 to the threat surface that actually exists. After M6 PASS, M7 still needs the dedicated reviewed GitHub-hosted release signer and strict exact-subject publication verification before any real release/attestation is created. Freshness remains a gated future requirement unless an actual latest consumer is introduced during that work.

M6-C2 remains UNVERIFIED because no authenticated interactive Chrome+ChatGPT evidence was produced by this audit. Product `extension/` bytes are outside this audit and were not changed.