# v0.8.7 runtime gap audit

Status: M5 candidate complete; M6 authenticated live validation remains release-blocking. A green static/CI gate is not live-browser acceptance evidence.

## Reconstructed and CI-covered before the exact M5 candidate

- classic MV3 `background.js` loads canonical route-state, route-queue, signal-protocol, and repeat-policy primitives.
- periodic route processing uses pending-only eligibility; ambiguity reconciliation is state-only; Retry/Resolve are explicit; same-worker concurrent dispatches are fenced.
- `content.js` route send accepts only user-message count increase or generation start as strong receipt; ambiguous receipt persists to bounded local outbox before transient notification.
- response and interval runners are wired through deterministic runner policy/registry; startup/storage/manual overlap is fenced by per-target runner tokens.
- prompt composition is wired: first-send onboarding is composed once per run, while the exact run-bound COMPLETE URL is appended according to the configured completion rule.
- structural `signal-scanner.js` observes exact `parrot.invalid` anchor hrefs rather than chat prose; background durable `signalId` dedupe prevents repeated COMPLETE/WAKE/MESSAGE observations from creating duplicate events/routes.
- cooldown handling is wired for repeat and routed sends with the tested rate-limit 10→20→40→60 minute and transient 2→5→10→20 minute ladders.
- dashboard uses canonical structural tab classification, exact-target controls, fleet search/filter/pagination, structural attention, and explicit ambiguity Retry/Resolve.
- popup numeric safety clamps were repaired and the current popup blob is the exact repaired target used by the candidate.
- manifest is v0.8.7; repository/static integration gates passed before candidate freeze.

## Exact candidate and durable evidence

- Exact M5 candidate source: `f51e4ba53753dade3bd3f9a64e2b3c50ca05d691`.
- Candidate Actions run: `35979821480` SUCCESS.
- NON-RELEASE candidate artifact: `10798948865`; Actions artifact digest `sha256:ca6ece70268ebf304cdab16260515911eeea45b6b67d44d981238c93bfdb251c`.
- M6-C1 PASS: real Google Chrome loaded the exact candidate extension/dashboard in run `35980470638`.
- Current post-candidate repository work is documentation/evidence/release tooling only; candidate identity must remain fail-closed. Do not silently roll post-candidate extension changes into release.

## Remaining release blocker

1. **Authenticated real ChatGPT behavior (M6-C2 onward) is UNVERIFIED.** Static CI and a local extension page cannot substitute for an authenticated interactive Chrome+ChatGPT session.
2. Prior headless probes are diagnostic only. The unauthenticated/Cloudflare execution surface is not valid evidence for composer send acceptance, generation observation, completion-link discovery, repeat progression, cross-tab WAKE/MESSAGE delivery, or dashboard actions.
3. Execute `docs/LIVE_SMOKE_CHECKLIST.md` against the exact candidate and record `docs/LIVE_SMOKE_RESULT_TEMPLATE.md`; gate the result with `scripts/verify-live-smoke-result.mjs`.
4. Any observed product FAIL reopens the affected earlier milestone and requires FIX→VERIFY. Do not weaken acceptance criteria.
5. S9/S10 may be `NOT_OBSERVED` only under the explicit checklist rule and must retain the corresponding release limitation.

## M7 release gate

Do not mark M6, M7, or PROGRAM_COMPLETE and do not publish a final release merely because repository/static gates are green.

After authenticated M6 PASS:

1. re-verify current `extension/` is byte/tree-identical to the exact M6 candidate;
2. freeze the release-repository SHA separately from the candidate SHA;
3. run the fail-closed final builder with the exact authenticated live-result evidence;
4. persist final ZIP file list/hash/provenance and release evidence;
5. mark M7 DONE only when every M7 criterion in `docs/MILESTONES.md` is PASS.

This file is an audit summary only. `docs/MILESTONES.md` remains the single work/progress/acceptance authority.