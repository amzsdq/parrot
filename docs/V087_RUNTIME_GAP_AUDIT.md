# v0.8.7 runtime gap audit

Status: NOT RELEASE READY. This document prevents a green static/CI gate from being misread as feature-complete runtime evidence.

## Reconstructed and CI-covered

- `background.js` exists as classic MV3 service worker and loads canonical `route-state.js` + `route-queue.js`.
- periodic route processing delegates pending-only eligibility to canonical state logic.
- ambiguity reconciliation is state-only; manual Retry/Resolve are explicit message contracts.
- `content.js` route send captures user-message count before click and accepts only count increase or generation start as strong receipt.
- ambiguous receipt is persisted to bounded local outbox before transient background notification.
- response-mode `PARROT_START` now has a real content receiver and repeat runner; runner respects running state, max repeats, runtime limit, generation lifecycle, and delay.
- manifest is v0.8.7 and repository rebuildability/static integration gates pass in CI.
- dashboard source now exists with search/filter/pagination and ambiguous Retry/Resolve controls.

## Known release-blocking gaps

1. **Signal discovery / queue creation is not reconstructed yet.** Current v0.8.7 content/background slice can consume route queue records, but it does not yet reconstruct the historical structural discovery path that turns COMPLETE/WAKE/MESSAGE `parrot.invalid` anchors into durable events/route queue entries. Do not claim WAKE/MESSAGE end-to-end works until this exists and is tested.
2. **Onboarding / completion prompt composition is not yet reconstructed in the new content runner.** `popup.js` stores templates and runId/completion URL, but current response runner sends `target.prompt` directly. It therefore does not yet prove the v0.8.6 onboarding/completion injection contract.
3. **Interval mode is not reconstructed.** Popup only explicitly arms content with `PARROT_START` for response mode; the new content receiver intentionally rejects non-response mode. A durable interval scheduler/runner is still required.
4. **Cooldown/error-UI behavior is not reconstructed.** Current response runner records send failures but does not implement the documented Too-many-requests 10→20→40→60 minute and transient 2→5→10→20 minute cooldown ladders.
5. **Dashboard controller is reconstructed but browser behavior is not smoke-tested.** It also currently contains local structural tab classification rather than consuming the canonical route-state primitive directly; converge this before release.
6. **popup.js exact repair remains pending.** Current blob is still `b2df626c...`; target `04b3a2b...` and the four missing numeric clamps/defaults are known. A failed whole-file replacement was immediately reverted to the prior blob; no corruption remains, but the semantic clamp regression is still open.
7. **Real ChatGPT browser smoke test is still required.** Static CI proves syntax/contracts/rebuildability, not live selector compatibility, click acceptance, generation observation, service-worker lifecycle, or cross-tab behavior.
8. **Versioned v0.8.7 ZIP is not yet release evidence.** Build it only after the above core runtime gaps are closed and CI/browser gates pass.

## Release gate

Do not mark PROGRAM_COMPLETE or publish v0.8.7 merely because `verify-repo`, route-state tests, route-queue tests, contract validation, and static integration validation are green. All release-blocking gaps above must be either implemented and verified or explicitly removed from defined product scope by the user.
