# Parrot v0.8.7 release notes — DRAFT / NOT RELEASED

**Do not publish as a release until M6 real Chromium + authenticated ChatGPT validation is PASS and M7 final artifact evidence is durable.**

## What v0.8.7 provides
- ChatGPT-first multi-worker Chrome extension.
- Worker identities scale A..Z, AA... without a fixed five-worker cap.
- Dashboard search/filter/pagination plus direct exact-target Start/Stop/Open controls.
- Response and interval runners with single-effective-runner token fencing, reload/storage reconciliation, and mode-transition fencing.
- Structural strong-send receipt rather than click/composer-change success.
- Structural COMPLETE / WAKE / MESSAGE routing with durable dedupe.
- Ambiguous delivery is fail-closed; automatic resend is fenced; Retry/Resolve is explicit.
- Structural rate-limit/transient cooldown state and backpressure.
- Configurable onboarding/completion/WAKE/MESSAGE templates.
- Compact popup with overlay editors and structural status/error/cooldown surfaces.

## Deliberate limitations
- Claude, Gemini, and Grok adapters are not implemented in v0.8.7.
- Parrot does not semantically read assistant/user chat prose.
- Real browser compatibility is tied to ChatGPT DOM/control structure and must be validated by M6 against the exact candidate.
- S9 ambiguity and S10 cooldown may be difficult to reproduce safely/naturally. If either is NOT_OBSERVED, publish that limitation explicitly rather than calling it PASS.
- Candidate Actions artifacts are temporary evidence bundles, not final release artifacts.

## Install candidate for M6 testing
1. Obtain the exact candidate source/artifact bound to commit `f51e4ba53753dade3bd3f9a64e2b3c50ca05d691` / Actions run `35979821480`.
2. Extract so `manifest.json` is directly inside the extension directory.
3. Open Chromium/Chrome extension management, enable Developer mode, choose Load unpacked, and select that directory.
4. Use an authenticated real `https://chatgpt.com/*` profile and execute `docs/LIVE_SMOKE_CHECKLIST.md`.
5. Record results in `docs/LIVE_SMOKE_RESULT_TEMPLATE.md` without storing chat prose, account identity, cookies, tokens, or credentials. Authentication itself must be confirmed by non-secret structural UI evidence.
6. Any observed FAIL reopens the affected earlier milestone; do not proceed to release packaging until the affected criterion is fixed and retested.

## M6 acceptance contract
- Required live cases S1–S8 and S11 must be PASS against the exact M5 candidate SHA.
- The result must explicitly record authenticated-session structural confirmation and non-secret structural evidence; a ChatGPT URL alone is not authentication evidence.
- S9 and S10 may be PASS or explicit NOT_OBSERVED only; NOT_OBSERVED remains a published limitation, never an implicit PASS.
- `scripts/verify-live-smoke-result.mjs` must accept the completed result file bound to the exact candidate SHA and its decision summary must agree with the case rows.
- Environment, case, and decision timestamps must be ISO-8601 UTC `Z` timestamps.
- Headless/static/local extension-page evidence cannot substitute for authenticated ChatGPT behavior.
- A real observed product FAIL reopens the relevant earlier milestone and invalidates release readiness until corrected and retested.

## Release provenance rule
M6 validates the exact candidate **extension tree**. Documentation and release-tooling commits may occur afterward, but `extension/` must remain byte-for-byte Git-equivalent to candidate `f51e4ba53753dade3bd3f9a64e2b3c50ca05d691`. `scripts/build-final-release.sh` fails closed if `extension/` differs. Any later extension change requires a new candidate and fresh M6 validation. The final artifact records both the M6 candidate SHA and the release-repository SHA in its provenance sidecar.

## Final release checklist — intentionally open
- [ ] Authenticated real Chrome + ChatGPT result file exists and is candidate-SHA-bound, with non-secret structural authentication evidence.
- [ ] Required S1–S8 + S11 all PASS.
- [ ] S9/S10 are PASS or explicit NOT_OBSERVED with limitations carried here.
- [ ] Machine live-evidence verifier passes, including authentication provenance, ISO UTC timestamps, and decision-summary consistency.
- [ ] Any M6 regressions are fixed and retested; no unresolved observed FAIL remains.
- [ ] M0..M6 all DONE after retest.
- [ ] Final release repository SHA is frozen and recorded.
- [ ] `extension/` is unchanged from the exact M6 candidate SHA; otherwise create a new candidate and repeat M6.
- [ ] `scripts/build-final-release.sh` is run with the verified live-result file and exact M6 candidate SHA.
- [ ] Final release ZIP integrity test passes; file list, SHA-256, candidate SHA, and release-repository SHA are recorded.
- [ ] README install/use instructions match final behavior and artifact identity.
- [ ] Limitations reflect S9/S10 observation status and deferred provider adapters.
- [ ] M7 evidence is durable and independently reconstructable; only then PROGRAM_COMPLETE.
