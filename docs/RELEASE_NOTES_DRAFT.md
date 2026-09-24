# Parrot v0.8.7 release notes — DRAFT / NOT RELEASED

**Do not publish as a release until M6 real Chromium + ChatGPT validation is PASS.**

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
- Real browser compatibility is tied to ChatGPT DOM/control structure and must be validated by M6 against the exact release candidate.
- S9 ambiguity and S10 cooldown may be difficult to reproduce safely/naturally. If either is NOT_OBSERVED, publish that limitation explicitly rather than calling it PASS.
- Candidate Actions artifacts are temporary evidence bundles, not final release artifacts.

## Install candidate for M6 testing
1. Obtain the exact candidate source/artifact bound to commit `f51e4ba53753dade3bd3f9a64e2b3c50ca05d691` / Actions run `35979821480`.
2. Extract so `manifest.json` is directly inside the extension directory.
3. Open Chromium/Chrome extension management, enable Developer mode, choose Load unpacked, and select that directory.
4. Execute `docs/LIVE_SMOKE_CHECKLIST.md` and record results in `docs/LIVE_SMOKE_RESULT_TEMPLATE.md` without storing chat prose.
5. Any FAIL reopens the affected earlier milestone; do not proceed to release packaging until retest passes.

## Final release checklist — intentionally open
- [ ] M6 required browser cases PASS against exact candidate SHA.
- [ ] Any M6 regressions fixed and retested.
- [ ] M0..M6 all DONE after retest.
- [ ] Final source SHA frozen.
- [ ] Final release ZIP rebuilt from frozen source, integrity checked, SHA-256 recorded.
- [ ] README install/use instructions match final behavior.
- [ ] Limitations reflect S9/S10 observation status and deferred provider adapters.
- [ ] M7 evidence durable; only then PROGRAM_COMPLETE.
