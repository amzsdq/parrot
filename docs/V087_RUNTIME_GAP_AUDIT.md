# v0.8.7 runtime gap audit

Status: NOT RELEASE READY. A green static/CI gate is not feature-complete runtime evidence.

## Reconstructed and CI-covered

- classic MV3 `background.js` loads canonical route-state, route-queue, and tested signal-protocol primitives.
- periodic route processing uses pending-only eligibility; ambiguity reconciliation is state-only; Retry/Resolve are explicit.
- `content.js` route send accepts only user-message count increase or generation start as strong receipt; ambiguous receipt persists to bounded local outbox before transient notification.
- response-mode `PARROT_START` has a real repeat runner with running/max-repeat/runtime/generation/delay guards.
- structural `signal-scanner.js` observes only exact `parrot.invalid` anchor hrefs, not assistant prose. Background durable `signalId` dedupe prevents repeated COMPLETE/WAKE/MESSAGE observations from creating duplicate events/routes.
- canonical `signal-protocol.js` has deterministic parser vectors for valid and malformed COMPLETE/WAKE/MESSAGE URLs and template substitution, executed in CI.
- manifest is v0.8.7; repository rebuildability/static integration gates pass in CI.
- dashboard source exists with search/filter/pagination and ambiguous Retry/Resolve controls.

## Known release-blocking gaps

1. **Prompt composition is staged but not wired.** `prompt-compose.js` now defines deterministic onboarding/completion composition, but current content response runner still sends `target.prompt` directly. Wire and test once-per-run onboarding plus exact completion URL injection before closing this gap.
2. **Interval mode is not reconstructed.** Popup explicitly arms content only for response mode; current content receiver rejects non-response mode. A durable interval scheduler/runner is required.
3. **Cooldown/error-UI behavior is not reconstructed.** Current runner records send failures but does not implement Too-many-requests 10→20→40→60 minute and transient 2→5→10→20 minute cooldown ladders.
4. **Dashboard browser behavior is not smoke-tested and classification is duplicated.** Converge dashboard tab classification onto canonical route-state primitive.
5. **popup.js exact repair remains pending.** Current blob is `b2df626c...`; target `04b3a2b...` and four missing numeric clamps/defaults are known. A failed whole-file replacement was immediately reverted; no corruption remains, but semantic clamp regression is open.
6. **Real ChatGPT browser smoke test is required.** Static CI does not prove live selector compatibility, click acceptance, generation observation, service-worker lifecycle, signal discovery in rendered ChatGPT, cross-tab routing, or dashboard actions.
7. **Versioned v0.8.7 ZIP is not release evidence yet.** Build only after core gaps close and CI/browser gates pass.

## Release gate

Do not mark PROGRAM_COMPLETE or publish v0.8.7 merely because repository/static gates are green. All release-blocking gaps above must be implemented and verified or explicitly removed from scope by the user.
