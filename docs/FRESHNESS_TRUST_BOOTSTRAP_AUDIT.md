# M7 freshness trust bootstrap audit (NOT RELEASED)

This is a design audit only. It does not satisfy M6/M7 and creates no workflow, environment, policy state, release, or attestation.

## Question

The protected-policy-branch design separates the release workflow's machine authority from freshness-policy writes, but a user-owned repository still leaves repository-owner/admin authority in the TCB. This audit compares the smallest realistic ways to reduce that residual trust without making freshness bootstrap or rotation circular.

## GitHub Environment gate

For a public repository, GitHub Environments can require named user reviewers, can prevent the user who initiated a deployment from approving that deployment, and can be configured so administrators cannot bypass deployment protection rules. A job that references the environment cannot proceed through the protected step until the rule passes. This is useful as a human authorization gate around the narrow policy-updater job.

However, an Environment in the same user-owned repository is not an external root of trust. The repository owner is the administrator who configures the environment and can change repository configuration. `prevent_self_review` separates triggerer from approver only when a genuinely distinct reviewer exists; it must not be represented as two-party governance if the only trusted person is the repository owner. Therefore Environment approval is a useful operational second gate, not protection against compromise of the owner/admin account itself.

If a distinct trusted reviewer actually exists after M6 PASS, the minimal GitHub-native updater should reference a dedicated policy environment, require that reviewer, enable prevent-self-review, disable administrator bypass, and keep the release signer outside the reviewer/updater identities. Do not create a nominal second reviewer solely to satisfy this pattern.

## Separate repository / principal

Moving authoritative freshness state to another repository only strengthens the boundary when its write authority is controlled by a genuinely different principal or credential. A second repository owned and administered by the same compromised personal account changes namespace, not trust root. Conversely, a separately controlled account/organization/app credential can make policy compromise require an additional principal, but that adds key/account recovery, availability, and operational complexity.

Therefore a separate repository is not the default minimum for Parrot. Escalate to it only if the threat model explicitly requires current-release freshness to survive compromise of the `amzsdq` repository-owner/admin authority. If adopted, the release signer remains read-only toward that repository and may only submit a proposal; the independent policy principal performs the reviewed CAS transition.

## Consumer-pinned policy digest

A consumer-pinned policy digest is the strongest simple bootstrap anchor because it does not trust mutable repository state at first use. The bootstrap value must be provisioned independently of the publication/bundle/signer being verified. The consumer then accepts the policy document only if its exact digest matches the pinned value.

It is not, by itself, an automatic rotation mechanism. If a consumer learns the next expected digest only from the mutable policy branch or from the candidate publication, rotation becomes circular again. Rotation must be an authenticated transition from the already trusted state: the current trusted policy identifies/authorizes the exact next generation/digest or an independently authorized control-plane update provisions it. A consumer that has persisted generation N must never replace it merely because the repository now advertises N+1.

This also means a brand-new consumer and an existing consumer have different bootstrap semantics. A new consumer needs an out-of-band trust anchor (for example a shipped/pinned current policy digest or independently controlled policy principal). An existing consumer may advance from its persisted trusted `(generation, policy/publication digest)` only through the reviewed monotonic transition rules. Trust-on-first-use from mutable `main`, a mutable policy ref, release `latest`, or the candidate attestation is not rollback protection.

## Recommended minimum after M6 PASS

For the current personal-public-repository threat model, use layered separation rather than pretending same-account GitHub configuration is an external trust root:

1. Release signer: GitHub-hosted, reviewed signer identity, `contents: read`; no policy write or bypass authority.
2. Policy updater: separate narrow workflow/control path that receives only a finalized verified publication proposal and enforces exact frozen-base `N/digest -> N+1/digest` CAS semantics with pre-update ref recheck and exact post-update readback.
3. Human gate: if a genuinely distinct trusted reviewer is available, protect the updater with a public-repository Environment required reviewer, prevent self-review, and disallow admin bypass. If no independent reviewer exists, document residual owner/admin trust instead of fabricating independence.
4. Consumer bootstrap: provision the initial/current trusted policy digest independently of the candidate publication. Existing consumers persist their accepted generation/digest and advance only through authenticated monotonic transitions; new consumers require an independent bootstrap anchor.
5. Stronger threat model: only if owner-account compromise must be survived, move authoritative policy to a separately controlled principal/control plane. A same-owner second repository is insufficient.

## Circularity tests for implementation

When the real M7 path exists, executable tests must prove at least: signer cannot write/bypass policy; updater rejects stale base and non-N+1 transitions; environment approval cannot be self-approved when that gate is configured; consumer rejects repository-advertised policy whose digest is not anchored by its current trusted state; restart preserves the consumer's monotonic minimum; a fresh consumer cannot silently bootstrap from candidate-controlled bytes; emergency rollback advances generation while explicitly selecting an older verified publication.

Do not implement these tests before the actual signer/policy channel exists. Product `extension/` bytes remain outside this audit.