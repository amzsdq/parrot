# Parrot development checkpoint

## Relay handoff / timing model

- `docs/BATON.md` is the latest-only execution baton and is read first on wake.
- `docs/DEVELOPMENT_LOG.md` is append-only full baton history.
- Preferred/default package target is 14 active minutes to minimize relay idle time. Sub-14 packages require an unavoidable `SHORT_PACKAGE_REASON`.
- Official timing is externalized to GitHub issue #1 `[PARROT_RELAY_WORK_MARKERS]`.
- Each wake records WAKE / START / END comments. Official `SESSION_ELAPSED=END-WAKE`; official `WORKED=END-START`.
- Connector `fetch_issue_comments` can return `created_at=null`; fetch each concrete comment id through GitHub REST `/repos/amzsdq/parrot/issues/comments/<id>` for authoritative server `created_at`.

Status: CONTINUE
Latest version: v0.8.6

## Current state

v0.8.6 fixes durable route-queue history pruning: both `delivered` and manually `resolved` records count as terminal history. Active records remain protected from arbitrary pruning.

Repository source-of-truth migration remains incomplete. Exact artifact Git blob identity is verified for `manifest.json`, `chatgpt-adapter.js`, `dashboard.html`, `dashboard.css`, `popup.css`, and `popup.html`.

### popup.js exact discrepancy — RESOLVED DIAGNOSIS

Library `parrot_extension_v0.8.0.zip` (36,229 bytes) was materialized. Its `popup.js` is 21,960 bytes and Git blob `04b3a2b425f37ee33de2b7194bd7dbea8aaa93da`, EXACTLY the recorded v0.8.6 popup.js target. Its popup.css/popup.html also exactly match v0.8.6 targets, confirming popup lineage.

The 53-byte repository discrepancy is now reproduced exactly. Current repository popup.js differs from the recovered target in four `saveForm()` assignments:

```text
TARGET: t.delaySec   = Math.max(0, Number(els.delaySec.value || 0));
CURRENT: t.delaySec  = Number(els.delaySec.value || 0);

TARGET: t.intervalMin = Math.max(1, Number(els.intervalMin.value || 11));
CURRENT: t.intervalMin = Number(els.intervalMin.value || 1);

TARGET: t.maxRepeats = Math.max(0, Number(els.maxRepeats.value || 0));
CURRENT: t.maxRepeats = Number(els.maxRepeats.value || 0);

TARGET: t.runtimeMin = Math.max(0, Number(els.runtimeMin.value || 0));
CURRENT: t.runtimeMin = Number(els.runtimeMin.value || 0);
```

Applying exactly those four current-line substitutions to the recovered target produces 21,907 bytes and Git blob `b2df626c1ba3a2cb95b608f55053d122ca6a5b4c` — EXACTLY the current repository blob. Therefore the entire 53-byte gap is accounted for; it is not newline/encoding normalization. Commit `990a70e` only restored four blank lines and did not repair these four lost clamps/defaults.

This is also a semantic regression, not merely byte identity: current source allows negative delay/repeat/runtime values and changes interval fallback from 11 to 1 instead of enforcing minimums. Repository popup.js still needs a complete authoritative replacement/write and blob verification before certification.

The full v0.8.6 ZIP remains unavailable. v0.8.0 provides historical baselines for background/content/dashboard but predates strong receipt/ambiguity/outbox behavior, so those files must not be copied and mislabeled exact v0.8.6.

## Rebuildability gate

Added `scripts/verify-repo.mjs`. It parses the manifest, checks manifest and HTML local references, and runs `node --check` over repository JavaScript. The script itself passes `node --check`. A controlled fixture with missing `background.js` and `content.js` correctly returned exit 1 and named both missing references. README documents the gate and forbids rebuildability certification before it passes.

Chrome official Manifest V3 docs confirm `background.service_worker` and `content_scripts` reference packaged extension resources and MV3 disallows remotely hosted executable code for extension pages; missing local source is therefore a rebuildability failure, not something to paper over with runtime fetches.

## Recovered v0.8.0 baseline hashes

Artifact SHA-256: `4c9d27a0e866fe60802f19717a962034dbfc7c1ba873d116359e4566075dc1ef`.

Git blobs:
- `background.js`: `c32103090f349f3397ea489594236f2433c55af6` (17,957 bytes)
- `content.js`: `c1e41165d7d5f7fda794aea3f120ec8775782e32` (28,763 bytes)
- `dashboard.js`: `72210244ef1b7f89c0f593d4abda77a72865319d` (20,943 bytes)
- `popup.js`: `04b3a2b425f37ee33de2b7194bd7dbea8aaa93da` (21,960 bytes; exact v0.8.6 target)
- `popup.css`: `b87074fc635f6e003918b633d233d693909bf662`
- `popup.html`: `0c36d5785a6d05f9137c213f89a16584f1fbab1b`

`node --check` passes for all five v0.8.0 JavaScript files; manifest parses as v0.8.0.

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
- `popup.html`: exact artifact blob `0c36d5785a6d05f9137c213f89a16584f1fbab1b`.
- `popup.js`: exact target bytes recovered and exact four-line discrepancy identified; repository write/verification pending.

## Reconstruction path if later exact runtime bytes remain unavailable

See `docs/RECONSTRUCTION_PLAN_v0.8.7.md`. Recovered v0.8.0 evidence shows its route receipt accepts composer-cleared/changed and its background automatically redispatches non-delivered records. Current exact adapter adds `getUserMessageCount()`, supporting reconstruction around user-message-count/generation strong receipts. Any deliberate reconstruction must be versioned/tested as v0.8.7, not falsely certified as byte-exact v0.8.6.

## Remaining high-value work

1. Repair repository popup.js from recovered target and require blob `04b3a2b...`.
2. Recover later runtime bytes if possible; otherwise implement v0.8.7 reconstruction plan from the v0.8.0 baseline plus verified contracts.
3. Restore background.js/content.js/dashboard.js, then run `node scripts/verify-repo.mjs` to a clean pass.
4. Rebuild ZIP from repository-only source and run ZIP integrity plus regression/browser smoke tests.

## References

- https://developer.chrome.com/docs/extensions/mv3/manifest
- https://developer.chrome.com/docs/extensions/mv3/manifest/background
- https://developer.chrome.com/docs/extensions/develop/migrate/improve-security

## Scope

ChatGPT-first. Do not add Claude/Gemini/Grok implementations yet; keep only clean adapter boundaries.
