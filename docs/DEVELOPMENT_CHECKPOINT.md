# Parrot development checkpoint

Status: CONTINUE
Latest version: v0.8.1
Artifact SHA-256: 17e2b0847edcae5d848bda481c5036b02c867f51a5b39c2501f775b06117e0a0

## Completed in v0.8.1

- Hardened normal repeat-send accounting so `sentCount` no longer increments immediately after `sendButton.click()`.
- Captures a structural pre-click baseline using the count of `[data-message-author-role="user"]` nodes.
- A normal send is confirmed only when either:
  - assistant generation starts, or
  - the user-message node count increases after the click.
- Composer clear/change is deliberately NOT sufficient for normal-send success because it can mutate without proving the turn was accepted.
- If neither strong receipt appears within 5 seconds, the send returns `dispatch_unconfirmed`, records an error, and does not emit `PARROT_SENT`.
- If a user-message node is confirmed before generation begins, the existing generation grace watch remains armed so a later failure to begin generation is still surfaced.

## Reference / rationale

- Chrome Extensions official architecture guidance treats content scripts as the page-DOM observation layer and extension messaging as the coordination mechanism between content scripts and the service worker. This supports keeping dispatch evidence in the ChatGPT content script rather than guessing from the dashboard/background state.
- Reference: https://developer.chrome.com/docs/extensions/develop
- Reference: https://developer.chrome.com/docs/extensions/mv2/reference/runtime
- Reliability choice: require observable page state caused by an accepted turn (new user-message DOM or generation start), rather than trusting the imperative `HTMLElement.click()` call itself.

## Verification

- `node --check`: content.js, background.js, chatgpt-adapter.js PASS
- manifest JSON parse PASS
- structural DOM smoke test for `getUserMessageCount()` baseline/increment PASS
- ZIP integrity PASS
- manifest version = 0.8.1

## Existing v0.8.0 multi-worker baseline

- Worker identities A, B, C … Z, AA … with no five-worker limit.
- Cross-tab dashboard control through Chrome Tabs messaging.
- Structural live status only: tab/content-script/generating/composer/draft/pending-route.
- Focus/open works for worker tabs including tabs in another Chrome window.
- Existing Route IDs preserved; new workers default Route ID to worker label.

## Remaining risks / next high-value work

1. Run a real ChatGPT browser regression test of the new strong normal-send receipt; the local smoke test validates selector/count mechanics but cannot prove future ChatGPT DOM stability.
2. Route delivery still accepts weaker `composer_cleared` / `composer_changed` receipts. Evaluate whether to reuse the strong receipt without causing duplicate WAKE/MESSAGE delivery risk.
3. Stress-test dashboard with 20–50 workers, including search/filter, multiple Chrome windows, and stale/discarded tabs.
4. Add bounded stale content-script recovery only if tests show it is needed; avoid broader permissions without evidence.
5. Continue keeping chat semantic content out of Parrot; use only structural state for fleet monitoring.

## Scope

ChatGPT-first. Do not add Claude/Gemini/Grok implementations yet; keep only clean adapter boundaries.
