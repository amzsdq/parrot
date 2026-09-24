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
6. Once the real workflow exists, add executable regressions against its actual behavior: wrong workflow path, wrong signer digest/revision when revision pinning is enabled, and any mutable executable dependency. Do not add pattern-only tests before there is a workflow to execute.

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

## Trust-boundary conclusion

There is no run-start TOCTOU where editing the default-branch workflow later silently changes the already-started run: GitHub selects the workflow version from the event-associated commit/ref. The concrete remaining gaps are acceptance of a different future signer revision, mutable executable dependencies, signer-policy rotation/revocation, and replay of an old publication authority through a workflow re-run. `--signer-workflow` closes path substitution; independently authorized `--signer-digest` closes signer-revision substitution; immutable dependency pins close nested executable drift; explicit signer lifecycle and first-attempt-only publication keep those identities from becoming stale replay authority. These controls complement rather than replace `release_repo_sha` source authorization.

No product `extension/` bytes are changed by this audit.