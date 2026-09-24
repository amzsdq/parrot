# Parrot v0.8.7 runtime reconstruction plan

Status: implementation candidate; use only if exact v0.8.6 runtime bytes remain unavailable.

## Why a new version

The v0.8.0 artifact is now recoverable and gives authoritative historical source for `background.js`, `content.js`, and `dashboard.js`, but it predates the v0.8.6 reliability contract. Copying those files into `main` and calling them v0.8.6 would be false certification. If later exact artifacts cannot be recovered, reconstruct the missing runtime deliberately as v0.8.7, preserving verified behavior and adding regression evidence.

## Evidence

Recovered v0.8.0 behavior:
- background queue has `pending` / `delivered` and periodic processing redispatches any non-delivered item after `ROUTE_REDISPATCH_MS`;
- content `tryDeliverRoute()` clicks send and `waitForDispatchReceipt()` accepts `isGenerating()`, composer-cleared, or composer-changed as receipt;
- content then emits `PARROT_ROUTE_DELIVERED`; failure to notify background is swallowed locally;
- no durable ambiguity outbox was found;
- v0.8.0 dashboard has no ambiguity retry/resolve controls.

Later-source clue already exact in repository:
- v0.8.6 `chatgpt-adapter.js` adds `getUserMessageCount()` relative to recovered v0.8.0. This directly supports replacing weak composer-cleared/changed receipt inference with user-message-count/generation structural evidence.

Verified v0.8.6 contract from durable checkpoint:
- normal repeat-send and WAKE/MESSAGE delivery use strong structural receipts;
- unconfirmed route delivery becomes `ambiguous` and is fenced from automatic retry;
- ambiguity receipt is persisted to bounded `chrome.storage.local` outbox before transient background messaging;
- background reconciliation changes state only and never blindly redelivers;
- dashboard exposes explicit manual retry and resolve controls;
- terminal pruning treats both `delivered` and `resolved` as terminal history;
- active records are not discarded merely to satisfy history cap;
- Chat semantic content is not used for fleet state or delivery decisions.

## Target route state machine

```text
pending
  -> delivered          strong receipt
  -> ambiguous          send attempted but strong receipt not confirmed

ambiguous
  -> pending            explicit manual retry
  -> resolved           explicit operator resolve
  -> delivered          reconciliation evidence proves delivery

resolved / delivered
  -> terminal history; never automatic redispatch
```

Hard rule: `ambiguous` is not a retry state. Periodic queue processing must skip it.

## content.js reconstruction

1. Start from recovered v0.8.0 content source, not prose.
2. Keep provider access behind `globalThis.ParrotSiteAdapter`.
3. Before route send, capture `beforeUserCount = siteAdapter.getUserMessageCount()` and generation state.
4. Set composer text, obtain enabled send button, click once.
5. Strong receipt succeeds only if post-send structural evidence proves acceptance: user-message count increases OR assistant generation begins. Composer clearing/changing alone is not sufficient.
6. If the click/send attempt occurred but strong receipt times out, create an ambiguity receipt containing queue id and structural/timing metadata only; never chat semantics.
7. BEFORE transient `chrome.runtime.sendMessage` about ambiguity, persist that receipt in a bounded `chrome.storage.local` outbox.
8. Background acknowledgement may remove/mark the outbox record. Notification failure must leave durable evidence for later reconciliation.
9. Locally fence the queue id after an ambiguous send so the content retry timer cannot click/send it again.
10. Do not parse assistant semantic text for route delivery.

## background.js reconstruction

1. Add durable route receipt reconciliation message handling.
2. Queue states include at least `pending`, `ambiguous`, `delivered`, `resolved`.
3. Periodic queue processing may dispatch only eligible `pending` records. Never automatically redispatch `ambiguous`, `resolved`, or `delivered`.
4. Reconciliation of a persisted ambiguity receipt updates queue state only; it never sends the route again.
5. Manual retry transitions the selected ambiguous item back to an explicitly dispatchable state and performs one operator-authorized attempt.
6. Manual resolve records `resolvedAt` and terminal state without pretending delivery was proven.
7. Pruning:
   - active = status not in `delivered`, `resolved`;
   - terminal = delivered/resolved newest first by `deliveredAt || resolvedAt`;
   - retain every active item even when active count exceeds `MAX_ROUTE_RECORDS`;
   - terminal history uses only remaining capacity.
8. Snapshot exposes structural tab reachability, discarded/frozen state, route status, cooldown/error, and run state without chat semantics.

## dashboard.js reconstruction

1. Bind current exact dashboard HTML, including worker search/filter, 10/25/50 pagination, route Action column, and worker actions.
2. Show `ambiguous` as operator attention, not ordinary pending.
3. Route Action column:
   - ambiguous: Retry + Resolve;
   - pending: no blind retry control unless explicitly designed;
   - delivered/resolved: terminal display.
4. Worker state distinguishes closed/not-open from `discarded` / `frozen` using structural `chrome.tabs.Tab` properties. Chrome documents `discarded` from Chrome 54 and `frozen` from Chrome 132; treat `frozen === undefined` as unsupported/unknown on older Chrome rather than false evidence that the tab is definitely not frozen. Chrome also documents that a frozen tab cannot execute tasks/event handlers/timers, while messages to it are queued until unfreeze, so dashboard status must not misclassify a frozen tab as ordinary content-script failure.
5. Dashboard actions address the matching target tab directly and must not depend on dashboard being the active tab.

## Regression gates before release

`tests/route-state-contract.json` records deterministic contract vectors. It is specification evidence only until production code is wired to a runner; do not report it as passing production tests merely because the JSON exists.

Required deterministic tests:
1. pending -> delivered when user-message count increases.
2. pending -> delivered when assistant generation begins even if count update lags.
3. composer clears/changes without either strong signal -> ambiguous, not delivered.
4. ambiguous survives transient background-message failure through persisted outbox.
5. background reconciliation of ambiguity changes state without redelivery.
6. periodic processor never dispatches ambiguous.
7. manual retry performs one authorized attempt and can become delivered or ambiguous again.
8. manual resolve -> resolved and no future dispatch.
9. pruning with 1 pending + 250 delivered + 250 resolved retains 300 total, keeps active, keeps newest terminal.
10. 320 active records retain all 320.
11. dashboard pagination/search/filter and ambiguity controls operate on the intended queue item.
12. discarded/frozen structural classification handles `frozen === undefined` as unsupported/unknown and does not equate a frozen tab with ordinary unreachable content script.
13. `node scripts/verify-repo.mjs` passes.
14. manifest parse/version, ZIP integrity, and real ChatGPT selector/receipt smoke test pass.

## References

- Chrome Tabs API: https://developer.chrome.com/docs/extensions/reference/api/tabs
- Chrome extension changes: https://developer.chrome.com/docs/extensions/whats-new

## Version rule

Do not call reconstructed runtime byte-exact v0.8.6. If exact v0.8.6 bytes are not recovered, implement/test as v0.8.7 and generate a fresh versioned artifact from repository source after all gates pass.
