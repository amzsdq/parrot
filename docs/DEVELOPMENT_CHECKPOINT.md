# Parrot development checkpoint

Status: CONTINUE
Latest version: v0.8.6
Artifact SHA-256: d4ecc03f06f274a1ecba7cad98c465bb8031039637f5aafa32b014585f36927b (v0.8.5 historical baseline; v0.8.6 artifact is the current conversation artifact)

## Current state

v0.8.6 fixes durable route-queue history pruning: both `delivered` and manually `resolved` records count as terminal history. This prevents repeated manual ambiguity resolution from bypassing `MAX_ROUTE_RECORDS` and growing the durable queue without bound. Active records remain protected from arbitrary pruning.

The repository source-of-truth migration remains incomplete. During the latest relay the previously stale `extension/manifest.json` was successfully replaced with the exact v0.8.6 artifact manifest, including `background.type = module` and version 0.8.6. README was also updated to v0.8.6.

A transient/incomplete `extension/background.js` sync stub was created during migration and immediately deleted in the same run; it is not canonical source and must not be treated as progress. The full runtime/UI package still needs to be committed from the v0.8.6 artifact.

## Verified v0.8.6 baseline

- ChatGPT-first; Claude/Gemini/Grok remain adapter boundaries only.
- Multi-worker dashboard supports A…Z, AA… identities, cross-tab control, 10/25/50 pagination, and discarded/frozen structural states.
- Normal repeat-send and WAKE/MESSAGE delivery use strong structural receipts.
- Ambiguous WAKE/MESSAGE delivery is fenced from automatic retry and has explicit Dashboard retry/resolve controls.
- Ambiguity receipts are persisted to a bounded `chrome.storage.local` outbox before transient background messaging; background reconciliation changes state only and never blindly redelivers.
- v0.8.6 terminal-history pruning includes both delivered and resolved route records.
- Chat semantic content remains outside Parrot fleet monitoring.

## Source migration evidence

- `extension/manifest.json` synchronized to v0.8.6 artifact in commit `1063183d9e2b731d79823551f788c8ff593c303a`.
- README synchronized to v0.8.6/current migration status in commit `c950671210d07819908e3ea4dd1f8e18b9582459`.
- GitHub write path is therefore confirmed operational; prior write blocking is not a current blocker.

## Remaining high-value work

1. Commit exact v0.8.6 package source for `background.js`, `content.js`, `dashboard.js`, `dashboard.css`, `popup.js`, `popup.html`, `popup.css`, and reconcile already-present `chatgpt-adapter.js` / `dashboard.html` against v0.8.6 artifact.
2. Rebuild the extension ZIP using repository source only and run JS syntax, manifest parse, ZIP integrity, and artifact-content comparison checks.
3. Add durable route-state regression fixtures covering `pending → ambiguous → manual retry/resolved → delivered`, outbox reconciliation, and terminal pruning.
4. Run real ChatGPT browser regression tests for selector/receipt stability.
5. Exercise discarded/frozen recovery with real Chrome memory-saver behavior before adding automatic recovery.

## Reference / rationale

Chrome extension source remains packaged/local rather than runtime-loaded from GitHub. Repository source is for reproducible development/recovery, not remotely hosted executable code.

References:
- https://developer.chrome.com/docs/extensions
- https://developer.chrome.com/docs/extensions/develop/migrate/known-issues

## Scope

ChatGPT-first. Do not add Claude/Gemini/Grok implementations yet; keep only clean adapter boundaries.
