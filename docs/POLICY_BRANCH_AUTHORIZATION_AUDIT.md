# M7 protected freshness-policy authorization audit (NOT RELEASED)

This is a design audit only. It does not satisfy M6/M7 and creates no release workflow, policy state, release, or attestation.

## Repository reality checked

At this checkpoint the public `amzsdq/parrot` repository exposes no repository rulesets through the readable rulesets endpoint. Branch-protection detail is not readable through the installed integration, so this audit does not claim that an unseen protection rule exists or does not exist. The design below is therefore a future M7 gate, not a statement that the repository is already protected.

GitHub rulesets are available for public repositories on GitHub Free. A branch ruleset can restrict creation/update/deletion, require pull requests, require reviews/status checks, and define explicit bypass actors. User-owned repositories do not have teams, so a personal repository cannot use team-required-reviewer rules as an independent second principal. The repository owner/admin can also edit repository rulesets, so a same-account policy branch is useful separation from a release workflow token but is not an external human trust root against compromise of the repository owner account.

## Minimum GitHub-native separation

After M6 PASS, if freshness policy remains in this repository, prefer a dedicated policy branch/ref rather than `main`. The release signer must have only the permissions it needs to build/attest and must not have `contents: write`; explicitly setting `contents: read` and the required attestation/OIDC permissions leaves unspecified `GITHUB_TOKEN` scopes at `none`. The signer may emit a proposed next `(base_generation, base_digest, next_generation, next_digest)` transition as data, but it must not update the authoritative policy ref.

A separate policy-update path may hold `contents: write`, but its authority is deliberately narrower than the release signer: it accepts only an already-finalized, cryptographically verified publication digest and performs the policy transition. Its workflow/code and any bypass identity become part of the freshness TCB. Do not grant the release workflow itself a ruleset bypass.

For a user-owned public repository, rulesets can enforce a PR path and review/status gates, but there is an important practical limit: there is no organization team boundary, and the repository owner/admin remains able to edit repository policy. Therefore call this **workflow-level authorization separation**, not independent multi-party governance. If current-release freshness must survive compromise of the repository owner account itself, the authoritative minimum/current policy must live under a separately controlled principal/control plane or be provisioned independently to consumers.

## CAS semantics: fast-forward is necessary but not sufficient

GitHub's Git-ref update with `force=false` guarantees only that the ref update is fast-forward; it prevents overwriting divergent history. It does not express application-level compare-and-swap over `generation + publication_record_sha256`. Two proposals can both descend from the same policy commit; whichever is serialized first may change the branch base, but a later updater must still prove that the policy blob it reviewed was based on the exact expected generation/digest and that the next generation is exactly `N+1`.

The future policy updater must therefore fail closed before constructing/merging the transition unless all of these hold:

1. Read the authoritative policy ref once and freeze its exact base commit SHA plus policy bytes.
2. Parse the frozen base fail-closed and require exact expected schema, generation `N`, and current digest/state.
3. Require the proposal to name that exact base commit/policy digest, require next generation exactly `N+1`, and require the proposed publication digest to have already passed the strict publication/attestation verification path (or explicit reviewed emergency rollback/revocation semantics).
4. Construct the next policy commit with the frozen base commit as its sole intended parent.
5. Immediately before ref update, re-read the authoritative ref and require it still equals the frozen base commit. If not, reject as stale and restart review; never silently rebase the proposal.
6. Update without force. Treat any conflict/non-fast-forward result as failure, not as permission to retry against a new base automatically.
7. Re-read the policy ref after the update and verify the committed policy bytes/generation/digest are exactly the reviewed transition before reporting success.

This explicit expected-base check is the CAS boundary. `force=false` is defense in depth around Git history, not a replacement for stale-policy validation.

## Reviewer / bypass TCB

Keep bypass actors empty if the operational model permits it. If emergency administration requires bypass, enumerate the smallest possible human/app identity and treat it as part of the freshness TCB. A bypass that the release signer can exercise collapses the separation. Required status checks should validate the frozen base and proposed transition, but the updater must repeat the same fail-closed checks at commit/update time because a status result can become stale relative to the policy ref.

On a single-user repository, a required approval from another writer is only meaningful if such a distinct trusted writer actually exists. Do not invent a nominal reviewer merely to satisfy a pattern. If no independent reviewer exists, use the protected policy branch to isolate machine authority from the signer and state the residual owner-account trust explicitly.

## Emergency rollback / revocation

The updater never decrements generation. Emergency rollback creates `N+1` naming an older, still-verified publication digest and carries explicit rollback authorization metadata outside the minimal consumer identity if needed for audit. Revocation or `NO_CURRENT_RELEASE` similarly advances generation. Historical verification remains separate and may continue to prove that an older publication was authentic without making it current.

## Implementation gate

Do not create the policy branch, ruleset, updater workflow, or executable regression before M6 PASS and before the dedicated release signer exists. At implementation time, inspect the repository's actual ruleset/protection configuration and available principals, then test: signer cannot write policy; stale-base proposal is rejected; concurrent N→N+1 proposals cannot both become authoritative; force/non-fast-forward failure is fail-closed; post-update readback matches exact reviewed bytes; emergency rollback advances generation; and bypass identities are exactly the reviewed set.

Product `extension/` bytes are outside this audit and must remain unchanged.