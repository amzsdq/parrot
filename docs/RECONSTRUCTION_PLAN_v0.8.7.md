# Parrot v0.8.7 runtime reconstruction plan

Status: IMPLEMENTED THROUGH M5 CANDIDATE. Historical design rationale below is retained for reconstruction provenance; current work/progress authority is `docs/MILESTONES.md`.

## Why v0.8.7 exists

The recovered v0.8.0 artifact supplied authoritative historical source for core runtime behavior but predates the later reliability contract. Exact later v0.8.6 runtime bytes were not recovered, so copying older files and calling them byte-exact v0.8.6 would have been false certification. The missing runtime was therefore deliberately reconstructed as v0.8.7 with deterministic regression evidence.

## Reconstruction invariants implemented before candidate freeze

- Provider access remains behind `globalThis.ParrotSiteAdapter`; current implementation is ChatGPT-first.
- Strong send receipt requires structural acceptance evidence: user-message count increase or assistant generation start. Composer clearing/changing alone is not delivery proof.
- Send attempted without strong receipt becomes `ambiguous`; ambiguity is persisted to a bounded local outbox before transient background notification and is locally fenced from automatic resend.
- Background reconciliation is state-only. Periodic processing auto-dispatches only `pending`; `ambiguous`, `resolved`, and `delivered` are fenced.
- Manual Retry is the explicit `ambiguous -> pending` authorization path; Resolve is terminal without pretending delivery was proven.
- Active route records are retained even beyond the nominal history cap; remaining capacity holds newest delivered/resolved terminal history.
- Dashboard uses canonical structural tab classification and distinguishes not-open/discarded/frozen without chat semantics.
- Response and interval runners use policy/registry fencing so startup/reload, storage reconciliation, explicit start, and mode transitions cannot create a second effective runner for one target.
- Prompt composition injects first-send onboarding once per run and the exact run-bound COMPLETE URL according to configuration.
- Structural COMPLETE/WAKE/MESSAGE scanning uses `parrot.invalid` anchor hrefs and durable signal dedupe; surrounding assistant/user prose is not semantically read.
- Rate-limit and transient cooldown ladders are deterministic and shared by repeat/routed-send handling.
- Dashboard fleet controls, popup configuration, numeric clamps, status surfaces, and ambiguity controls are covered by deterministic repository tests.

## Exact candidate evidence

- M5 candidate source: `f51e4ba53753dade3bd3f9a64e2b3c50ca05d691`.
- Candidate Actions run: `35979821480` SUCCESS.
- NON-RELEASE artifact: `10798948865`.
- Actions artifact digest: `sha256:ca6ece70268ebf304cdab16260515911eeea45b6b67d44d981238c93bfdb251c`.
- M6-C1 real-Chrome load evidence: run `35980470638` SUCCESS.

The exact candidate is the product identity for M6. Documentation/evidence/release-tooling commits may advance afterward, but any `extension/` change requires a new candidate and fresh M6 validation.

## Historical route state machine

```text
pending
  -> delivered          strong receipt
  -> ambiguous          send attempted but strong receipt not confirmed

ambiguous
  -> pending            explicit manual retry
  -> resolved           explicit operator resolve
  -> delivered          later strong receipt/reconciliation evidence

resolved / delivered
  -> terminal history; never automatic redispatch
```

Hard rule retained in the implementation: `ambiguous` is not an automatic retry state.

## Regression evidence represented in the candidate

The repository test suite and integration guard cover, among other cases:

1. strong receipt by user-message count increase;
2. strong receipt by assistant generation start;
3. composer-only change is not proof;
4. bounded ambiguity outbox and acknowledgement;
5. reconciliation without redelivery;
6. periodic pending-only dispatch;
7. one explicit manual retry authorization;
8. manual terminal resolve;
9. active-preserving route pruning;
10. discarded/frozen structural classification;
11. exact-target dashboard controls and fleet pagination/search/filter;
12. prompt composition and run-bound completion signal;
13. response/interval runner policy and token fencing;
14. cooldown ladders and structural cooldown boundary;
15. repository/manifest/ZIP reconstruction gates.

## Remaining validation boundary

This reconstruction plan is no longer an implementation work list. The remaining release blocker is M6 authenticated real ChatGPT behavior. Static tests and the M6-C1 extension-page load cannot establish composer/send/generation/reload/routing/dashboard behavior inside an authenticated ChatGPT session.

Use `docs/LIVE_SMOKE_CHECKLIST.md`, `docs/LIVE_SMOKE_RESULT_TEMPLATE.md`, and `scripts/verify-live-smoke-result.mjs`. Any observed product failure reopens the affected milestone and requires FIX -> VERIFY; do not weaken acceptance criteria.

## Version rule

Do not describe v0.8.7 as byte-exact v0.8.6. It is a deliberate reconstruction with its own candidate provenance and acceptance evidence. Final release is allowed only after M6 and M7 pass according to `docs/MILESTONES.md`.