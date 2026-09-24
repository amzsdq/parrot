# M7 release workflow identity audit (NOT RELEASED)

This is a design audit for the future dedicated M7 release-publication workflow. It does not satisfy M6/M7 and does not authorize a release, workflow, or attestation.

## Finding

The source commit and the signer workflow are separate identities. Pinning `release_repo_sha` to the maintainer-dispatched canonical-branch `github.sha` prevents caller-selected source claims, but it does not by itself prove which workflow revision executed or whether executable dependencies drifted.

GitHub Actions gives each run the workflow version present at the event-associated commit/ref. `github.workflow_ref` identifies the workflow path plus ref, while `github.workflow_sha` is the commit SHA for the workflow file. Therefore a later update to `main` after a run starts does not retroactively replace that run's workflow. The remaining risk is policy: a consumer that pins only the signer repository/path can accept a later, changed revision of that same workflow path.

## Future implementation gate

After M6 PASS and only after the real dedicated release workflow exists and is reviewed:

1. Keep source authorization independent: canonical protected `refs/heads/main`, event-captured `github.sha`, detached exact checkout, and `HEAD == GITHUB_SHA`.
2. Freeze the canonical signer path and require consumer `--signer-workflow` for that exact workflow. If a reusable workflow contains the attestation step, pin that reusable workflow as the signer rather than only its caller.
3. Decide revision policy explicitly. If one reviewed signer revision must remain the trust root, require `--signer-digest <reviewed workflow commit>` as well. Do not derive the expected signer digest from the downloaded attestation or from mutable branch state at consumer time.
4. Pin every executable third-party action and reusable workflow dependency in the trusted builder to reviewed immutable commit SHAs. A stable top-level workflow path does not prevent dependency drift when `@main`, mutable tags, or caller-selectable refs are used.
5. Do not treat `github.workflow_ref` alone as immutable proof: it contains a ref path. Use it as a runtime fail-closed sanity check for the expected repository/path/ref, while `github.workflow_sha`/the attestation signer digest supplies the immutable workflow revision identity when revision pinning is required.
6. Require the privileged publication/attestation job to run on a GitHub-hosted runner and require consumers to verify with `gh attestation verify --deny-self-hosted-runners`. GitHub-hosted runners are ephemeral clean isolated VMs; self-hosted runners do not carry that guarantee and may retain compromise across jobs. Runner provenance is therefore an independent builder-TCB property, not a duplicate of signer path/digest validation.
7. Once the real workflow exists, add executable regressions against its actual behavior: wrong workflow path, wrong signer digest/revision when revision pinning is enabled, self-hosted runner provenance, and any mutable executable dependency. Do not add pattern-only tests before there is a workflow to execute.

## Signer-digest lifecycle

`--signer-digest` only has security value if its expected value is authorized independently of the attestation being checked and independently of mutable repository state at verification time. Treat that expected digest as release-policy state, not as another field that the signer may choose for itself.

When revision pinning is enabled after the real release workflow exists:

1. Review the new workflow revision and every executable action/reusable-workflow dependency before activation.
2. Record the reviewed immutable workflow commit in the independently trusted consumer/publication policy. Do not obtain the expected digest from the candidate attestation, `main`, a mutable tag, or bundle-local metadata.
3. Activate a new signer revision only after that trusted policy has been updated. A workflow commit becoming reachable on `main` is not by itself signer authorization.
4. Rotation must be explicit. For current-release acceptance, retire the old signer digest when the new digest becomes authoritative unless a deliberately bounded overlap is required. An unbounded allowlist silently turns revision pinning back into path-only trust.
5. Revocation must fail closed for new/current release acceptance even if an old attestation remains cryptographically valid. Historical/audit verification may retain the old digest as historical metadata, but that is a different policy from accepting a newly presented current release.
6. Never let the release workflow update or approve its own expected signer digest. That would make revision authorization circular.

The repository does not yet have the dedicated release workflow or an external signer-policy channel, so this section is an implementation gate rather than a request to invent a placeholder digest store now.

## Re-run semantics

GitHub re-runs preserve the original run's `GITHUB_SHA` and `GITHUB_REF` and execute with the privileges of the actor who originally triggered the run. `github.triggering_actor` identifies who initiated a re-run and may differ from `github.actor`; it does not replace the original actor's privilege identity. `github.run_attempt` starts at `1` and increments for each re-run.

This prevents a lower-privileged re-run initiator from acquiring their own higher authority merely through `triggering_actor`, but it creates a separate release-policy question: an old authorized publication run can be re-executed later with the original source/ref and actor privilege context. A cryptographically valid new attestation from such a re-run should not silently become a fresh release authorization after policy has rotated or been revoked.

For the eventual publication workflow, use these gates unless the implemented release design proves a stronger idempotent alternative:

1. Authorization checks must use the original trusted event/source identity; never substitute `github.triggering_actor` for `github.actor` as the authority whose privileges GitHub applies.
2. The privileged publication/attestation job should fail closed when `github.run_attempt != 1`. Recovery from a transient failure should use a fresh maintainer-controlled dispatch under the then-current source/signer policy rather than silently replaying an old publication authority.
3. If reruns are intentionally supported later, they require an explicit design proving same immutable source, same reviewed signer digest, no mutable external inputs, idempotent publication side effects, and current non-revoked policy. Do not infer those properties merely because GitHub reused the original SHA/ref.
4. Once the real workflow exists, add an executable rerun regression against the actual gate. Do not add a speculative YAML-pattern test now.

## Certificate identity / OIDC issuer audit

GitHub CLI already verifies certificate-backed actor identity when `gh attestation verify` succeeds. Its default `--cert-oidc-issuer` is `https://token.actions.githubusercontent.com`, so adding the same flag explicitly to Parrot's adapter does not currently create an independent security boundary. Keep the GitHub CLI default rather than duplicating a constant unless the CLI contract changes or Parrot intentionally supports another issuer.

`--cert-identity` exactly pins the certificate SubjectAlternativeName and GitHub documents it as an alternative way to validate the signer workflow identity. It is not a substitute for a reviewed signer that does not yet exist: inventing a SAN now would encode the same false trust root as guessing `--signer-workflow`. Once the dedicated release workflow exists, prefer the clearer workflow-native `--signer-workflow` policy for the canonical signer path. Add `--cert-identity` only if the reviewed certificate SAN provides a distinct invariant that is not already enforced by the chosen signer-workflow/digest policy.

Therefore there is no new production change or executable regression at this checkpoint. Repository/signer-repository, predicate type, exact subject bytes, source digest, and canonical source ref remain the meaningful pre-M6 consumer constraints. The missing high-value identity is the future dedicated signer workflow itself, which must not be fabricated before M6 PASS.

## Runner provenance audit

`gh attestation verify --deny-self-hosted-runners` fails verification for attestations generated on self-hosted runners. This is a distinct provenance constraint. GitHub documents GitHub-hosted runners as ephemeral clean isolated virtual machines, while self-hosted runners have no equivalent clean-VM guarantee and can be persistently compromised by untrusted workflow code. For a public release signer that does not require private hardware, accepting self-hosted provenance unnecessarily enlarges the trusted computing base to an externally managed persistent machine.

Adopt this as a future M7 release gate: the dedicated signer must use a GitHub-hosted runner, and the consumer must add `--deny-self-hosted-runners` when that workflow is introduced. Do not add the consumer flag or a fake regression before the actual signer exists; doing so now would test a policy with no producer to validate. When implemented, test both sides: the workflow's actual runner choice and consumer rejection of otherwise-valid self-hosted provenance.

## Multiple-attestation lookup / `--limit` audit

`gh attestation verify` fetches relevant attestations for the exact artifact subject and, on successful verification with JSON output, returns one entry per verified attestation. The default fetch limit is 30. Multiple attestations for the same subject therefore do not by themselves create an acceptance ambiguity under Parrot's strict policy: each accepted attestation must independently satisfy the cryptographic verification plus repository/signer-repository, predicate, source digest, and canonical source-ref constraints (and later signer workflow/digest and runner provenance).

A malicious or irrelevant extra attestation cannot make a non-matching attestation satisfy those constraints. If more than the fetch limit exist, ordering could at worst prevent a matching attestation from being considered and cause a false rejection/availability failure; it does not establish a false-accept path. Conversely, if an attacker can produce another attestation that satisfies every strict trusted identity constraint, the trusted signer/source boundary is already compromised and changing `--limit` does not repair it.

Therefore do not add a larger `--limit`, attestation-count equality rule, or custom selection parser merely to force uniqueness. Such logic adds complexity without closing a demonstrated acceptance gap. Revisit only if the real publication design requires a unique attestation ID or GitHub CLI semantics change.

## Hosted-runner image drift / reproducibility audit

GitHub-hosted runner provenance and reproducible output answer different questions. Hosted-runner provenance constrains *where* the trusted signer ran and removes persistent self-hosted state from the TCB. It does not promise that `ubuntu-latest` or preinstalled tools remain byte-identical over time. GitHub documents runner-image software updates and recommends explicit tool-version selection when workflows need stable versions.

Therefore do not overload attestation identity policy with a guessed runner-image identity pin. The release builder should instead make output determinism explicit: pin executable actions/dependencies, explicitly select build-tool/runtime versions where they affect bytes, keep archive construction deterministic, and later record/attest SBOM or build-environment metadata when it materially improves auditability. A second build from the same source can then be compared as a reproducibility check, but reproducibility is a separate release-quality/supply-chain layer; a mismatch must not be 'fixed' by weakening signer identity verification.

No pre-M6 production verifier change is justified by runner image drift. The existing exact ZIP/ready hashing already authenticates the bytes that were actually published; it does not claim that a future rebuild on a changed hosted image will reproduce those bytes.

## Freshness / rollback audit

The current three-identity publication contract (`release_repo_sha`, `artifact_sha256`, `ready_sha256`) plus a valid attestation authenticates one exact publication. It does **not** prove that the publication is the newest authorized release. Consequently, an attacker or stale mirror that can replay an older, still-valid publication record and its matching old release bundle can satisfy all current identity checks. This is a real rollback/freeze acceptance gap if the consumer's semantic claim is "current/latest release", although it is not a forgery of the old release.

Do not use the attestation creation timestamp, mutable branch/tag lookup, or a bundle-local version as the freshness authority. Those are either signer-supplied evidence or mutable/replayable state and would make freshness circular. Likewise, extending the signed publication record with a sequence number alone does not prevent replay: the attacker can replay the old signed sequence unless the consumer has an independently trusted minimum/current value.

Future M7 publication therefore needs an explicit freshness policy separate from artifact identity:

1. Decide whether the consumer only verifies a specifically requested historical release or asserts "current/latest". Historical verification needs no anti-rollback state beyond exact expected identity; latest-release verification does.
2. For latest-release acceptance, maintain an independently trusted monotonic release-policy state outside the presented bundle/attestation. The minimal state can be the expected current publication-record digest or a monotonic release generation bound to that digest.
3. Update that trusted freshness state only through the authorized release-control path after the new exact publication record is finalized. The release workflow must not be able to self-approve a lower generation or derive the expected value from the candidate it is asking the consumer to trust.
4. Consumers claiming "latest" must reject a valid publication whose digest/generation is older than the trusted state. Historical/audit tooling may deliberately accept it under an explicit historical mode.
5. Rotation/recovery must be monotonic. Deleting an attestation or moving a mutable tag is not rollback protection, and transparency-log inclusion proves existence/integrity rather than newest-release status.

Because no M7 release workflow or external release-policy channel exists yet, do not invent a counter file or executable anti-rollback regression now. After M6 PASS, choose the authoritative release-policy channel together with the dedicated signer workflow, then implement and test replay of a previous valid publication as an executable negative case.

## Trust-boundary conclusion

There is no run-start TOCTOU where editing the default-branch workflow later silently changes the already-started run: GitHub selects the workflow version from the event-associated commit/ref. The concrete remaining gaps are acceptance of a different future signer revision, mutable executable dependencies, signer-policy rotation/revocation, replay of an old publication authority through a workflow re-run, self-hosted runner provenance, and—when claiming current/latest release—replay of an older fully valid publication. `--signer-workflow` closes path substitution; independently authorized `--signer-digest` closes signer-revision substitution; immutable dependency pins close nested executable drift; explicit signer lifecycle and first-attempt-only publication keep those identities from becoming stale replay authority; `--deny-self-hosted-runners` keeps the eventual public release builder on GitHub's ephemeral hosted-runner boundary. Runner image drift/reproducibility belongs to deterministic-build/SBOM policy rather than signer identity. Latest-release freshness requires independently trusted monotonic policy state; cryptographic validity and transparency-log inclusion alone do not establish freshness. Certificate SAN pinning does not replace the missing reviewed signer identity, while GitHub CLI already defaults the OIDC issuer to GitHub Actions. Multiple matching subject attestations do not create a separate false-accept gap when every accepted attestation must satisfy the same strict identity policy. These controls complement rather than replace `release_repo_sha` source authorization.

No product `extension/` bytes are changed by this audit.