# Parrot development checkpoint

Status: CONTINUE
Latest version: v0.8.0
Artifact SHA-256: 4c9d27a0e866fe60802f19717a962034dbfc7c1ba873d116359e4566075dc1ef

## Completed in v0.8.0

- Reworked dashboard from target cards into a scalable worker data table.
- Added Worker identities A, B, C … Z, AA … with no five-worker limit.
- Added cross-tab dashboard control through Chrome Tabs messaging.
- Added dashboard live structural status:
  - tab open / closed
  - content script reachable
  - response generating
  - composer ready
  - draft present
  - pending route count
- Added focus/open behavior for a worker tab, including tabs in another Chrome window.
- Dashboard START explicitly dispatches to the matching open worker tab when possible; if closed, state remains armed for later tab load.
- Existing Route IDs are preserved. New workers default Route ID to their worker label.
- Popup target selector now prefixes Worker identity.

## UX references used

- Chrome Extensions Tabs API and extension/content-script message passing for cross-tab control.
- Carbon Design System data-table guidance for dense resource management, toolbar/search/filter, inline actions, and progressive detail disclosure.
- Atlassian/Carbon status-label patterns for compact semantic state display.

## Verification

- node --check: background.js, content.js, dashboard.js, popup.js, chatgpt-adapter.js PASS
- manifest JSON parse PASS
- Chromium dashboard render smoke test PASS
  - five workers rendered
  - summary metrics rendered
  - no page errors in the mocked live-state test
- ZIP integrity PASS
- manifest version = 0.8.0

## Remaining risks / next high-value work

1. Normal repeat-send accounting still increments sentCount immediately after click. Add a conservative dispatch receipt before PARROT_SENT without introducing duplicate-send risk.
2. Test dashboard behavior with a larger fleet (20–50 workers), including search/filter and multiple Chrome windows.
3. Add a bounded stale-tab/content-script recovery path that does not require broader permissions unless evidence shows it is necessary.
4. Continue keeping chat semantic content out of Parrot; use only structural state for fleet monitoring.

## Scope

ChatGPT-first. Do not add Claude/Gemini/Grok implementations yet; keep only clean adapter boundaries.
