# Parrot development checkpoint

Status: CONTINUE
Latest version: v0.8.5
Artifact SHA-256: d4ecc03f06f274a1ecba7cad98c465bb8031039637f5aafa32b014585f36927b

## Completed in v0.8.5

- Closed the ambiguity-propagation loss window identified in v0.8.4.
- Before a content script removes a locally ambiguous WAKE/MESSAGE delivery from its in-memory pending map, it now persists an `ambiguous` receipt into `chrome.storage.local` under a bounded receipt outbox.
- The content script then attempts normal runtime messaging. On acknowledged background processing, the corresponding outbox receipt is removed.
- If runtime messaging fails because the Manifest V3 service worker is temporarily unavailable/restarting, the receipt remains durable instead of being lost.
- The background service worker reconciles the durable receipt outbox on browser startup and before every existing 30-second route-queue tick.
- Reconciliation marks the existing durable route record `ambiguous`; it does not redeliver the WAKE/MESSAGE.
- Receipt timestamps preserve the content-script observation time when available.
- The outbox is bounded to the latest 100 ambiguity receipts.
- No new Chrome permissions were added; the existing `storage` permission is reused.

## Reference / rationale

- Chrome's extension architecture separates content scripts from the extension service worker and uses message passing between those contexts. A runtime message can therefore be a transient coordination path rather than the sole durable record.
- Chrome documents `storage.local` as persistent local extension storage and notes that it is exposed to content scripts by default. This makes it suitable for a small durable receipt outbox shared between the content script and service worker.
- The existing background alarm is reused as the bounded reconciliation trigger. Recovery changes state only (`pending` → `ambiguous`) and never blindly redelivers, preserving the duplicate-delivery safety invariant.
- References:
  - https://developer.chrome.com/docs/extensions/reference/api/storage
  - https://developer.chrome.com/docs/extensions/develop/concepts/messaging

## Verification

- `node --check`: background.js, content.js, dashboard.js, popup.js, chatgpt-adapter.js PASS
- manifest JSON parse PASS
- ZIP integrity PASS
- manifest version = 0.8.5
- Static recovery-path verification PASS: persist receipt before local deletion; content-script flush removes only after acknowledged background response; background alarm reconciles outbox before route redispatch; reconciliation performs no dispatch.

## Existing baseline

- Multi-worker dashboard supports A…Z, AA… identities, cross-tab control, 10/25/50 pagination, and discarded/frozen structural states.
- Normal repeat-send and WAKE/MESSAGE delivery use strong structural receipts.
- Ambiguous WAKE/MESSAGE delivery is fenced from automatic retry and has explicit Dashboard retry/resolve controls.
- Chat semantic content remains outside Parrot fleet monitoring.

## Remaining risks / next high-value work

1. Real ChatGPT browser regression test remains necessary: local DOM/count smoke tests cannot prove future ChatGPT selector stability.
2. Commit the extension source itself to `amzsdq/parrot` so GitHub becomes a fully reconstructable source of truth rather than only README/checkpoint state.
3. After source-of-truth migration, add regression fixtures for route state transitions (`pending → ambiguous → manual retry/resolved → delivered`) and durable receipt reconciliation.
4. Exercise discarded/frozen recovery with real Chrome memory-saver behavior before adding automatic recovery.
5. Review concurrent content-script writes to the bounded receipt outbox if future routing becomes highly parallel; current one-route-at-a-time delivery substantially limits this race surface.

## Scope

ChatGPT-first. Do not add Claude/Gemini/Grok implementations yet; keep only clean adapter boundaries.
