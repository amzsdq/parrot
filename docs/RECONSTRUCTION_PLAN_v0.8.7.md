# Parrot v0.8.7 runtime reconstruction plan

Status: implementation candidate; use only if exact v0.8.6 runtime bytes remain unavailable.

## Why a new version

The v0.8.0 artifact is now recoverable and gives authoritative historical source for `background.js`, `content.js`, and `dashboard.js`, but it predates the v0.8.6 reliability contract. Copying those files into `main` and calling them v0.8.6 would be false certification. If later exact artifacts cannot be recovered, reconstruct the missing runtime deliberately as v0.8.7, preserving verified behavior and adding regression evidence.

## Evidence

Recovered v0.8.0 behavior:
- background queue has `pending` / `delivered` and redispatches any non-delivered item after `ROUTE_REDISPATCH_MS`;
- content script sends `PARROT_ROUTE_DELIVERED` after dispatch receipt;
- no durable ambiguity outbox was found in v0.8.0;
- v0.8.0 dashboard has no ambiguity retry/resolve controls.

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
  -> pending            explicit manual retry only

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
3. For each route send, capture structural pre-send evidence (at minimum user-message count and generation state).
4. Set composer text and click send.
5. Strong receipt succeeds only when structural post-send evidence changes: new user-message DOM or assistant generation begins. Click return alone is insufficient.
6. If send was attempted but receipt cannot be confirmed, create an ambiguity receipt object.
7. BEFORE sending transient `chrome.runtime.sendMessage` about ambiguity, persist that receipt in bounded `chrome.storage.local` outbox.
8. Background acknowledgement may clear/mark the outbox item; failure to notify background must not erase ambiguity evidence.
9. Do not parse assistant semantic text for route delivery.

## background.js reconstruction

1. Add durable route receipt outbox reconciliation message handling.
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
4. Worker state distinguishes closed/not-open from `discarded` / `frozen` where Chrome exposes those structural tab properties.
5. Dashboard actions address the matching target tab directly and must not depend on dashboard being the active tab.

## Regression gates before release

Required deterministic tests:
1. pending -> delivered on strong receipt.
2. attempted send + no receipt -> ambiguous.
3. ambiguous survives transient background-message failure through persisted outbox.
4. background reconciliation of ambiguity changes state without redelivery.
5. periodic processor never dispatches ambiguous.
6. manual retry performs one authorized attempt and can become delivered or ambiguous again.
7. manual resolve -> resolved and no future dispatch.
8. pruning with 1 pending + 250 delivered + 250 resolved retains 300 total, keeps active, keeps newest terminal.
9. 320 active records retain all 320.
10. dashboard pagination/search/filter and ambiguity controls operate on the intended queue item.
11. `node scripts/verify-repo.mjs` passes.
12. manifest parse/version, ZIP integrity, and real ChatGPT selector/receipt smoke test pass.

## Version rule

Do not call reconstructed runtime byte-exact v0.8.6. If exact v0.8.6 bytes are not recovered, implement/test as v0.8.7 and generate a fresh versioned artifact from repository source after all gates pass.
