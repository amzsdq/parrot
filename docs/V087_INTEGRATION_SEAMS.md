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

Recovered v0.8.0 `tryDeliverRoute()` clicks once and then `waitForDispatchReceipt()` accepts any of:

- assistant generation begins;
- composer becomes empty;
- composer text changes.

The latter two are not delivery proof.

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

## Loading strategy

`route-state.js` is currently a global IIFE so content/dashboard surfaces can load it before their scripts. The MV3 background is a module; before integration choose one explicit strategy rather than duplicating logic:

- convert the primitive to an ES module and add a thin global bridge for classic content scripts, or
- keep the browser-global build plus a source-equivalent module build generated/tested from one canonical implementation.

Do not manually maintain two divergent copies of the state machine.

## Acceptance slice

The first production integration is accepted only when deterministic evidence proves:

- periodic background processing cannot dispatch ambiguous;
- composer-only change cannot prove delivery;
- ambiguity is persisted before transient notification;
- notification failure leaves durable outbox evidence;
- reconciliation does not redeliver;
- explicit retry performs at most one newly authorized attempt;
- resolved/delivered remain terminal.
