# Parrot development checkpoint

Status: CONTINUE
Latest version: v0.8.6
Artifact SHA-256: d4ecc03f06f274a1ecba7cad98c465bb8031039637f5aafa32b014585f36927b (v0.8.5 historical baseline; v0.8.6 artifact is the current conversation artifact)

## Current state

v0.8.6 fixes durable route-queue history pruning: both `delivered` and manually `resolved` records count as terminal history. Active records remain protected from arbitrary pruning.

Repository source-of-truth migration is still in progress. Exact artifact Git blob identity has now been verified for `manifest.json`, `chatgpt-adapter.js`, `dashboard.html`, `dashboard.css`, `popup.css`, and `popup.html`. `popup.html` was corrected from the earlier compacted write and now has artifact-identical blob SHA `0c36d5785a6d05f9137c213f89a16584f1fbab1b`.

`extension/popup.js` is now present, but its GitHub blob SHA `07bb9017ff5bc66fb822214eb1c09c4f597f2acd` does not match the artifact blob SHA `04b3a2b425f37ee33de2b7194bd7dbea8aaa93da`; therefore it is NOT yet certified exact and must be reconciled rather than counted complete.

The full runtime/UI package is not yet committed: `background.js`, `content.js`, and `dashboard.js` remain absent. GitHub is therefore not yet a complete reconstructable source of truth.

## Verified v0.8.6 baseline

- ChatGPT-first; Claude/Gemini/Grok remain adapter boundaries only.
- Multi-worker dashboard supports A…Z, AA… identities, cross-tab control, 10/25/50 pagination, and discarded/frozen structural states.
- Normal repeat-send and WAKE/MESSAGE delivery use strong structural receipts.
- Ambiguous WAKE/MESSAGE delivery is fenced from automatic retry and has explicit Dashboard retry/resolve controls.
- Ambiguity receipts are persisted to a bounded `chrome.storage.local` outbox before transient background messaging; background reconciliation changes state only and never blindly redelivers.
- v0.8.6 terminal-history pruning includes both delivered and resolved route records.
- Chat semantic content remains outside Parrot fleet monitoring.

## Source migration evidence

- `manifest.json`: exact artifact blob `86b27383f8137256c725ff730e0a54e532199587`.
- `chatgpt-adapter.js`: exact artifact blob `45d03de832a3219d018c7c606869e9692ae97430`.
- `dashboard.html`: exact artifact blob `8c8d7ab4347e578e3305689968b3ee3f53e0b541`.
- `dashboard.css`: exact artifact blob `d83a7a5b6794daf0b3b60509e2b7d45ae2745795`.
- `popup.css`: exact artifact blob `b87074fc635f6e003918b633d233d693909bf662`.
- `popup.html`: corrected to exact artifact blob `0c36d5785a6d05f9137c213f89a16584f1fbab1b` in commit `3d47e3f2d7ede8cd55226f3249ef700617460a7f`.
- `popup.js`: created in commit `29e624d8a985734062151ec83569864354345018`, but blob mismatch remains and exact synchronization is still required.

## Remaining high-value work

1. Reconcile `popup.js` to byte-exact v0.8.6 artifact content.
2. Commit exact v0.8.6 package source for `background.js`, `content.js`, and `dashboard.js`.
3. Rebuild the extension ZIP using repository source only and run JS syntax, manifest parse, ZIP integrity, and artifact-content comparison checks.
4. Add durable route-state regression fixtures covering `pending → ambiguous → manual retry/resolved → delivered`, outbox reconciliation, and terminal pruning.
5. Run real ChatGPT browser regression tests for selector/receipt stability.
6. Exercise discarded/frozen recovery with real Chrome memory-saver behavior before adding automatic recovery.

## Reference / rationale

Chrome extension source remains packaged/local rather than runtime-loaded from GitHub. Repository source is for reproducible development/recovery, not remotely hosted executable code.

References:
- https://developer.chrome.com/docs/extensions
- https://developer.chrome.com/docs/extensions/develop/migrate/known-issues

## Scope

ChatGPT-first. Do not add Claude/Gemini/Grok implementations yet; keep only clean adapter boundaries.
