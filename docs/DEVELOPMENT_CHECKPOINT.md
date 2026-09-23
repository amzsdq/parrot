# Parrot development checkpoint

Status: CONTINUE
Latest version: v0.8.2
Artifact SHA-256: df0106bebcd9b21a8d054801e5a723c672f93e5b72f0ba24aa38c18038d259a1

## Completed in v0.8.2

- Added client-side Worker pagination to the dashboard: 10 / 25 / 50 rows per page, default 25.
- Search and status-filter changes reset pagination to page 1; next/previous controls clamp to valid pages.
- Kept A…Z, AA… Worker identity scheme and smoke-tested 50 workers (`A`, `Z`, `AA`, `AX`).
- Dashboard now distinguishes Chrome tab lifecycle states that matter operationally:
  - `discarded` => `절전 해제 필요`
  - `frozen` => `정지됨`
- Discarded/frozen workers are counted as Attention instead of being conflated with generic content-script failure.
- No new permissions were added.

## Reference / rationale

- Chrome Tabs API documents `discarded` as content unloaded from memory until activation and `frozen` as a loaded tab that cannot execute tasks/timers until activation. These are therefore first-class structural fleet states rather than generic errors.
- Reference: https://developer.chrome.com/docs/extensions/reference/api/tabs
- Carbon Data Table guidance recommends search/filter in the table toolbar and pagination when the amount of data is too large for one view; pagination belongs below the related data table.
- References:
  - https://carbondesignsystem.com/components/data-table/usage/
  - https://carbondesignsystem.com/components/pagination/usage/
- UX decision: default 25 rows balances fleet scan density with page length while still allowing 10 or 50 at user choice. No server-side pagination is needed because Parrot fleet state is local extension storage.

## Verification

- `node --check`: background.js, dashboard.js, content.js, popup.js, chatgpt-adapter.js PASS
- manifest JSON parse PASS
- 50-worker identity/pagination smoke test PASS (`A`, `Z`, `AA`, `AX`)
- ZIP integrity PASS
- manifest version = 0.8.2

## Existing reliability baseline

- Normal repeat-send `sentCount` increments only after strong receipt: new user-message DOM or assistant generation start.
- Multi-worker cross-tab control remains dashboard-first and uses structural state only.

## Remaining risks / next high-value work

1. Run a real ChatGPT browser regression test of the strong normal-send receipt; local selector/count smoke tests cannot prove future ChatGPT DOM stability.
2. Route delivery still accepts weaker `composer_cleared` / `composer_changed` receipts. Evaluate whether to reuse the strong receipt without causing duplicate WAKE/MESSAGE delivery risk.
3. Exercise discarded/frozen recovery with real Chrome memory-saver behavior; add bounded recovery only if evidence shows it is needed.
4. Add sortable Worker columns only if fleet tests show search/filter/pagination are insufficient; avoid UI complexity without evidence.
5. Continue keeping chat semantic content out of Parrot; use only structural state for fleet monitoring.

## Scope

ChatGPT-first. Do not add Claude/Gemini/Grok implementations yet; keep only clean adapter boundaries.
