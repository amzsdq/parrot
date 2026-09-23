# Parrot development checkpoint

Status: CONTINUE
Latest version: v0.8.4
Artifact SHA-256: 25c516318d3e7ca365e3f0907c0eb9c82b29c99b3514df21288eb1338894c46b

## Completed in v0.8.4

- Added explicit Dashboard recovery controls for WAKE/MESSAGE routes fenced as `ambiguous`.
- `재시도` is available only for ambiguous records and requires an explicit warning confirmation before dispatch.
- The warning states that ChatGPT may already have accepted the original click and that retry can therefore duplicate the message.
- Manual retry clears the ambiguity fence, records `manualRetryAt`, returns the route to pending, and dispatches once through the existing strong-receipt path.
- `해결 처리` marks the record `resolved` without sending anything. This gives the operator a safe way to acknowledge an already-delivered/superseded route without risking duplication.
- Background automatic queue processing continues to skip ambiguous routes. No blind redelivery was added.
- Added distinct dashboard status dots for `ambiguous` and `resolved`.
- No new Chrome permissions were added.

## Reference / rationale

- Carbon data-table guidance recommends row-specific actions as inline actions/overflow actions; with two actions, keeping them visible inline reduces an extra click.
- Carbon modal guidance and Atlassian warning guidance recommend explicit confirmation when an action can have meaningful consequences and require the warning to explain what will happen.
- Here, duplicate WAKE/MESSAGE delivery is the relevant consequence. Therefore retry is deliberate and confirmed, while the non-sending resolution path is offered as the safe alternative.
- References:
  - https://carbondesignsystem.com/components/data-table/usage/
  - https://carbondesignsystem.com/components/modal/usage/
  - https://atlassian.design/content/writing-guidelines/writing-a-warning-message

## Verification

- `node --check`: background.js, content.js, dashboard.js, popup.js, chatgpt-adapter.js PASS
- manifest JSON parse PASS
- ZIP integrity PASS
- manifest version = 0.8.4
- Static route-recovery verification PASS: ambiguous-only action gate, explicit confirm before retry, manual retry path records `manualRetryAt`, resolve path performs no dispatch.

## Existing baseline

- Multi-worker dashboard supports A…Z, AA… identities, cross-tab control, 10/25/50 pagination, and discarded/frozen structural states.
- Normal repeat-send and WAKE/MESSAGE delivery use strong structural receipts.
- Ambiguous WAKE/MESSAGE delivery is fenced from automatic retry.
- Chat semantic content remains outside Parrot fleet monitoring.

## Remaining risks / next high-value work

1. Real ChatGPT browser regression test remains necessary: local DOM/count smoke tests cannot prove future ChatGPT selector stability.
2. Durable ambiguity propagation can still be lost if background messaging is unavailable exactly when the content script tries to report `PARROT_ROUTE_AMBIGUOUS`. Add a bounded recovery mechanism that does not blindly redeliver.
3. Exercise discarded/frozen recovery with real Chrome memory-saver behavior before adding automatic recovery.
4. Commit the extension source itself to `amzsdq/parrot` so GitHub becomes a fully reconstructable source of truth rather than only README/checkpoint state.
5. After source-of-truth migration, add regression fixtures for route state transitions (`pending → ambiguous → manual retry/resolved → delivered`).

## Scope

ChatGPT-first. Do not add Claude/Gemini/Grok implementations yet; keep only clean adapter boundaries.
