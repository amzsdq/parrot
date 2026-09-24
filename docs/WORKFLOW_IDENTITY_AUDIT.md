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

## Trust-boundary conclusion

There is no run-start TOCTOU where editing the default-branch workflow later silently changes the already-started run: GitHub selects the workflow version from the event-associated commit/ref. The concrete remaining gap is acceptance of a different future signer revision or mutable executable dependency under the same signer path. `--signer-workflow` closes path substitution; optional `--signer-digest` closes signer-revision substitution; immutable dependency pins close nested executable drift. These controls complement rather than replace `release_repo_sha` source authorization.

No product `extension/` bytes are changed by this audit.