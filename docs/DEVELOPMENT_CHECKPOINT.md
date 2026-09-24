# Parrot development checkpoint

Status: CONTINUE
Latest version: v0.8.5
Artifact SHA-256: d4ecc03f06f274a1ecba7cad98c465bb8031039637f5aafa32b014585f36927b

## Current run: source-of-truth migration started

The next reliability priority from v0.8.5 was to make `amzsdq/parrot` reconstructable from source rather than relying on conversation ZIP artifacts. This run began that migration without changing extension runtime behavior or bumping the version.

Committed exact v0.8.5 source for:

- `extension/manifest.json`
- `extension/chatgpt-adapter.js`
- `extension/dashboard.html`

The remaining v0.8.5 runtime/UI files are not yet committed, so GitHub is **not yet a complete reconstructable source of truth**. Do not claim source migration complete until all remaining files are committed and a ZIP rebuilt from GitHub source matches/validates against the v0.8.5 baseline.

## Reference / rationale

- Chrome's current extension documentation treats unpacked extension directories as the normal local development/test unit, so retaining the complete package source in version control gives a reproducible development baseline.
- Manifest V3 continues to disallow arbitrary remotely hosted executable code. Parrot therefore keeps executable extension code packaged/local rather than turning GitHub into a runtime code-loading dependency.
- References:
  - https://developer.chrome.com/docs/extensions
  - https://developer.chrome.com/docs/extensions/develop/migrate/known-issues

## Verification this run

Before migration, the conversation v0.8.5 artifact was revalidated:

- `node --check`: background.js, content.js, dashboard.js, popup.js, chatgpt-adapter.js PASS
- manifest JSON parse PASS
- ZIP integrity PASS
- artifact SHA-256 rechecked: `d4ecc03f06f274a1ecba7cad98c465bb8031039637f5aafa32b014585f36927b`
- No runtime code was modified, therefore no new versioned ZIP was produced.

## Existing v0.8.5 reliability baseline

- Multi-worker dashboard supports A…Z, AA… identities, cross-tab control, 10/25/50 pagination, and discarded/frozen structural states.
- Normal repeat-send and WAKE/MESSAGE delivery use strong structural receipts.
- Ambiguous WAKE/MESSAGE delivery is fenced from automatic retry and has explicit Dashboard retry/resolve controls.
- Ambiguity receipts are persisted to a bounded `chrome.storage.local` outbox before transient background messaging; background reconciliation changes state only and never blindly redelivers.
- Chat semantic content remains outside Parrot fleet monitoring.

## Remaining risks / next high-value work

1. Finish committing the exact v0.8.5 package source: background.js, content.js, dashboard.js, dashboard.css, popup.js, popup.html, popup.css, and package README as appropriate.
2. Rebuild the extension ZIP from repository source and run syntax/manifest/ZIP checks to prove GitHub reconstruction.
3. Add regression fixtures for route state transitions (`pending → ambiguous → manual retry/resolved → delivered`) and durable receipt reconciliation.
4. Real ChatGPT browser regression test remains necessary; local DOM/count smoke tests cannot prove future ChatGPT selector stability.
5. Exercise discarded/frozen recovery with real Chrome memory-saver behavior before adding automatic recovery.

## Scope

ChatGPT-first. Do not add Claude/Gemini/Grok implementations yet; keep only clean adapter boundaries.
