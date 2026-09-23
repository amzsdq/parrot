# Parrot development checkpoint

Status: CONTINUE
Latest version: v0.8.3
Artifact SHA-256: f1d6ec1589bc52c2d0bd9d41474a53438b9a88eeb251e54d8a9bdbb934452edf

## Completed in v0.8.3

- Unified WAKE/MESSAGE route delivery with the strong structural receipt already used by normal repeat sends.
- Route success now requires either:
  - a new user-message DOM node, or
  - assistant generation start.
- Removed `composer_cleared` and `composer_changed` as route-success receipts; composer mutation alone is not proof ChatGPT accepted the turn.
- Added an ambiguity fence: after a route click, if no strong receipt appears within 5 seconds, the route becomes `ambiguous` / `dispatch_ambiguous` rather than being automatically retried.
- Background route processing skips `ambiguous` records, reducing duplicate WAKE/MESSAGE risk when ChatGPT accepted a click but DOM confirmation was delayed or selector evidence failed.
- No new Chrome permissions were added.

## Reference / rationale

- Chrome Tabs API documents `tabs.sendMessage()` as the supported mechanism for an extension/service worker to communicate with a content script in a specific tab. This supports keeping dispatch observation inside the target ChatGPT tab while durable routing state remains in the extension background context.
- Chrome extension messaging documentation describes service-worker/content-script coordination as separate contexts exchanging messages rather than sharing page state directly.
- References:
  - https://developer.chrome.com/docs/extensions/reference/api/tabs
  - https://developer.chrome.com/docs/extensions/develop/concepts/messaging
- Reliability decision: a composer clear/change is weaker evidence than a new user turn or generation start. Retrying an ambiguous route automatically can duplicate a WAKE/MESSAGE, so ambiguous-after-click is fenced for inspection rather than treated as ordinary retryable failure.

## Verification

- `node --check`: background.js, content.js, dashboard.js, popup.js, chatgpt-adapter.js PASS
- manifest JSON parse PASS
- strong-route-receipt smoke test PASS:
  - composer mutation alone => no receipt
  - user-message count increment => `user_message_added`
  - generation start => `generation_started`
- ZIP integrity PASS
- manifest version = 0.8.3

## Existing baseline

- Multi-worker dashboard supports A…Z, AA… identities, cross-tab control, 10/25/50 pagination, and discarded/frozen structural states.
- Normal repeat-send `sentCount` increments only after strong receipt.
- Chat semantic content remains outside Parrot fleet monitoring.

## Remaining risks / next high-value work

1. Real ChatGPT browser regression test remains necessary: local DOM/count smoke tests cannot prove future ChatGPT selector stability.
2. `ambiguous` routes are safely fenced but currently lack an explicit dashboard resolve/retry action. Design this conservatively so retry requires deliberate user action and is clearly marked as duplicate-risk.
3. If background messaging is unavailable exactly when a content script fences an ambiguous route, durable ambiguity propagation needs a bounded recovery mechanism; do not solve this by blind route redelivery.
4. Exercise discarded/frozen recovery with real Chrome memory-saver behavior before adding automatic recovery.
5. Consider committing extension source to `amzsdq/parrot` so the repo, not only conversation artifacts, becomes a fully reconstructable source of truth.

## Scope

ChatGPT-first. Do not add Claude/Gemini/Grok implementations yet; keep only clean adapter boundaries.
