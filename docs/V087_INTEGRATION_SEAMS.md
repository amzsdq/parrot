# v0.8.7 production integration seams

This document converts recovered v0.8.0 runtime behavior into bounded v0.8.7 implementation seams. It is not a substitute for tests.

## Background queue

Recovered v0.8.0 `processRouteQueue()` currently skips only `delivered`, then redispatches every other state after `ROUTE_REDISPATCH_MS`. That is unsafe once `ambiguous` exists.

Target invariant:

```js
if (!ParrotRouteState.canAutoDispatch(item)) continue;
```

Only `pending` is auto-dispatchable. `ambiguous`, `resolved`, and `delivered` are fenced. Reconciliation of an ambiguity receipt calls state transition logic only; it must never call `dispatchRouteItem()`.

Manual retry is the sole normal path `ambiguous -> pending`. Manual resolve is `ambiguous -> resolved` and records `resolvedAt` without claiming delivery.

Pruning must delegate to the active-preserving terminal policy: every nonterminal record survives even when active count exceeds `MAX_ROUTE_RECORDS`; remaining capacity is newest delivered/resolved history.

## Content strong receipt

Recovered v0.8.0 `tryDeliverRoute()` clicks once and then `waitForDispatchReceipt()` accepts generation start, composer cleared, or composer changed. The latter two are not delivery proof.

Target sequence:

1. capture `beforeUserCount = siteAdapter.getUserMessageCount()` before writing/clicking;
2. set composer payload;
3. acquire enabled send button;
4. click exactly once;
5. poll structural evidence;
6. delivered only when user-message count increases OR generation begins;
7. timeout after click => ambiguous, never ordinary retry;
8. create structural ambiguity receipt `{queueId, ambiguousAt, beforeUserCount, afterUserCount, generationObserved}`;
9. persist receipt to bounded `chrome.storage.local` outbox BEFORE `chrome.runtime.sendMessage`;
10. locally fence queue id immediately so the content retry timer cannot click it again;
11. background acknowledgement removes that outbox entry; notification failure leaves it durable for later reconciliation.

Composer clearing/changing may be diagnostic metadata but must not upgrade status to delivered.

## Structural tab state

Use `ParrotRouteState.classifyTabStructure(tab)`. `discarded` and `frozen` are structural states, not generic content-script failures. If the `frozen` property is absent, support is `unknown`; do not infer `frozen=false`.

## Loading strategy — selected

Use one canonical browser-global `extension/route-state.js` implementation across content/dashboard/background rather than maintaining two copies.

For v0.8.7 reconstruction, use a classic MV3 extension service worker and load the primitive synchronously at the top of reconstructed `background.js` with:

```js
importScripts('route-state.js');
```

Then remove `"type": "module"` from the manifest background entry because the reconstructed background does not require ES-module syntax. Chrome's official extension-service-worker documentation states that service workers can import scripts with either ES-module `import` (requiring `type: module`) or `importScripts()`. This choice matches the recovered v0.8.0 classic-style source and allows content scripts to load the exact same `route-state.js` before `content.js` through manifest ordering.

Do not introduce a second hand-maintained module copy. If later architecture genuinely requires ES modules, convert from one canonical source with a generated bridge and conformance test rather than duplicating state logic.

References:
- Chrome Extension service worker basics: https://developer.chrome.com/docs/extensions/develop/concepts/service-workers/basics
- Chrome service-worker migration guidance: https://developer.chrome.com/docs/extensions/develop/migrate/to-service-workers

## Acceptance slice

The first production integration is accepted only when deterministic evidence proves:

- periodic background processing cannot dispatch ambiguous;
- composer-only change cannot prove delivery;
- ambiguity is persisted before transient notification;
- notification failure leaves durable outbox evidence;
- reconciliation does not redeliver;
- explicit retry performs at most one newly authorized attempt;
- resolved/delivered remain terminal.
