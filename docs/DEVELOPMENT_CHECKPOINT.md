# Parrot development checkpoint

## Relay handoff / timing model

- `docs/BATON.md` is the latest-only execution baton and is read first on wake.
- `docs/DEVELOPMENT_LOG.md` is append-only full baton history.
- Preferred/default package target is 14 active minutes to minimize relay idle time. Sub-14 packages require an unavoidable `SHORT_PACKAGE_REASON`.
- Official timing is externalized to GitHub issue #1 `[PARROT_RELAY_WORK_MARKERS]`.
- Each wake records WAKE / START / END comments. Official `SESSION_ELAPSED=END-WAKE`; official `WORKED=END-START`.
- Connector `fetch_issue_comments` currently returns `created_at=null`; this is NOT accepted as timing evidence. Fetch each concrete comment id through GitHub REST `/repos/amzsdq/parrot/issues/comments/<id>` for authoritative server `created_at`.

Status: CONTINUE
Latest version: v0.8.6

## Current state

v0.8.6 fixes durable route-queue history pruning: both `delivered` and manually `resolved` records count as terminal history. Active records remain protected from arbitrary pruning.

Repository source-of-truth migration remains incomplete. Exact artifact Git blob identity is verified for `manifest.json`, `chatgpt-adapter.js`, `dashboard.html`, `dashboard.css`, `popup.css`, and `popup.html`.

A major source-recovery result is now verified: Library contains `parrot_extension_v0.8.0.zip` (36,229 bytes). After materialization, its `popup.js` is 21,960 bytes and Git blob `04b3a2b425f37ee33de2b7194bd7dbea8aaa93da` — EXACTLY the recorded v0.8.6 popup.js target blob. Its `popup.css` blob is `b87074fc635f6e003918b633d233d693909bf662` and `popup.html` blob is `0c36d5785a6d05f9137c213f89a16584f1fbab1b`, also exactly matching the verified v0.8.6 blobs. Therefore the authoritative bytes needed to repair `popup.js` have been recovered: v0.8.0 popup.js is byte-identical to the v0.8.6 target. The repository's current popup.js (`b2df626c...`, 21,907 bytes) remains wrong by 53 bytes and must be replaced from this recovered source.

Commit `990a70eef80b7b43627c2ebb76ec857e3feb28ae` only added four blank lines relative to its parent, so it never closed the 53-byte gap. The recovered v0.8.0 artifact now removes any need to guess those bytes.

The full v0.8.6 ZIP is still not discoverable in the current searchable surfaces. Repository releases are empty, only `main` exists, and Git history contains no `content.js` or `dashboard.js`. However v0.8.0 now provides an authoritative historical baseline for all three missing runtime files. It is NOT sufficient by itself for v0.8.6 certification: v0.8.0 lacks later ambiguity/outbox behavior (e.g. old background queue blindly redispatches non-delivered items), so missing v0.8.6 runtime files must not simply be copied and labeled exact.

Historical commit `8baedeb5327febf724ff3156943610beef2dd22b` contained only a nine-line `background.js` source-sync stub and was intentionally removed; it remains non-authoritative.

## Rebuildability gate

Added `scripts/verify-repo.mjs`. It parses the manifest, checks manifest and HTML local references, and runs `node --check` over repository JavaScript. The script itself passes `node --check`. A controlled fixture with missing `background.js` and `content.js` correctly returned exit 1 and named both missing manifest references while accepting present references and valid JavaScript. Full repository execution was not claimed because this runtime container cannot directly clone GitHub. README documents the gate and forbids rebuildability certification before it passes.

Chrome's official Manifest V3 documentation confirms that `background.service_worker` names the extension service-worker JavaScript file and `content_scripts` names packaged JS/CSS resources; Manifest V3 also disallows remotely hosted executable code for extension pages. This supports treating missing referenced local source as a hard rebuildability failure rather than silently fetching runtime code.

## Recovered v0.8.0 baseline hashes

Materialized Library artifact: `parrot_extension_v0.8.0.zip`, SHA-256 `4c9d27a0e866fe60802f19717a962034dbfc7c1ba873d116359e4566075dc1ef`.

Git blobs:
- `background.js`: `c32103090f349f3397ea489594236f2433c55af6` (17,957 bytes)
- `content.js`: `c1e41165d7d5f7fda794aea3f120ec8775782e32` (28,763 bytes)
- `dashboard.js`: `72210244ef1b7f89c0f593d4abda77a72865319d` (20,943 bytes)
- `popup.js`: `04b3a2b425f37ee33de2b7194bd7dbea8aaa93da` (21,960 bytes; exact v0.8.6 target)
- `popup.css`: `b87074fc635f6e003918b633d233d693909bf662` (exact current target)
- `popup.html`: `0c36d5785a6d05f9137c213f89a16584f1fbab1b` (exact current target)

`node --check` passes for all five v0.8.0 JavaScript files; v0.8.0 manifest parses successfully.

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
- `popup.js`: target bytes recovered from v0.8.0 artifact; target blob `04b3a2b425f37ee33de2b7194bd7dbea8aaa93da` / 21,960 bytes; repository replacement still pending.

## Remaining high-value work

1. Replace repository `popup.js` from recovered v0.8.0 authoritative bytes and verify blob `04b3a2b...` exactly.
2. Use recovered v0.8.0 runtime files as historical baselines only; recover later changes or deliberately reconstruct a new version rather than mislabel v0.8.0 files as v0.8.6 exact.
3. Restore authoritative `background.js`, `content.js`, and `dashboard.js` with later strong-receipt/ambiguity/outbox/dashboard semantics.
4. Run `node scripts/verify-repo.mjs`; require a clean pass before repository rebuildability certification.
5. Rebuild ZIP from repository-only source and run ZIP integrity/artifact-content checks.
6. Add route-state regression fixtures and real ChatGPT/Chrome smoke tests.

## Reference / rationale

Chrome extension source remains packaged/local rather than runtime-loaded from GitHub. Repository source is for reproducible development/recovery, not remotely hosted executable code.

References:
- https://developer.chrome.com/docs/extensions/mv3/manifest
- https://developer.chrome.com/docs/extensions/mv3/manifest/background
- https://developer.chrome.com/docs/extensions/develop/migrate/improve-security

## Scope

ChatGPT-first. Do not add Claude/Gemini/Grok implementations yet; keep only clean adapter boundaries.
