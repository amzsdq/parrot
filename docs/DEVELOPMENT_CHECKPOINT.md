# Parrot development checkpoint

## Relay handoff / timing model

- `docs/BATON.md` is the latest-only execution baton and is read first on wake.
- `docs/DEVELOPMENT_LOG.md` is append-only full baton history.
- Preferred/default package target is 14 active minutes to minimize relay idle time. Sub-14 packages require an unavoidable `SHORT_PACKAGE_REASON`.
- Official timing is externalized to GitHub issue #1 `[PARROT_RELAY_WORK_MARKERS]`.
- Each wake records WAKE / START / END comments. Official `SESSION_ELAPSED=END-WAKE`; official `WORKED=END-START`.
- Connector `fetch_issue_comments` currently returns `created_at=null`; this is NOT accepted as timing evidence. The concrete comment id must be fetched through GitHub REST `/repos/amzsdq/parrot/issues/comments/<id>`, which exposes authoritative server `created_at`.

Status: CONTINUE
Latest version: v0.8.6

## Current state

v0.8.6 fixes durable route-queue history pruning: both `delivered` and manually `resolved` records count as terminal history. Active records remain protected from arbitrary pruning.

Repository source-of-truth migration remains incomplete. Exact artifact Git blob identity is verified for `manifest.json`, `chatgpt-adapter.js`, `dashboard.html`, `dashboard.css`, `popup.css`, and `popup.html`.

`extension/popup.js` is present but is NOT certified byte-exact. Repository blob is `b2df626c1ba3a2cb95b608f55053d122ca6a5b4c`, 21907 bytes. Recorded v0.8.6 artifact target is blob `04b3a2b425f37ee33de2b7194bd7dbea8aaa93da`, 21960 bytes: a 53-byte size gap. Direct GitHub blob lookup of the recorded artifact SHA returns 404, so the target bytes are not recoverable from this repository's Git object database.

Fresh investigation of commit `990a70eef80b7b43627c2ebb76ec857e3feb28ae` shows that the attempted "exact" sync only added four blank lines relative to its parent. Therefore that commit does not explain or close the 53-byte artifact gap. Do not infer missing bytes from this commit.

The actual v0.8.6 ZIP / extracted runtime bytes were not discoverable in the currently searchable conversation/library surface during PARROT-BATON-001R1. Searches found Parrot design/handoff documents, not the v0.8.6 package. Repository releases are empty, only `main` exists, and Git history contains no `content.js` or `dashboard.js`. This is an artifact-access blocker for honest byte certification, not proof that the artifact no longer exists elsewhere.

The full runtime/UI package is still absent from `main`: `background.js`, `content.js`, and `dashboard.js` are missing. Historical commit `8baedeb5327febf724ff3156943610beef2dd22b` contained only a nine-line `background.js` source-sync stub and was intentionally removed by the following commit; it is not authoritative runtime source and must not be resurrected as implementation.

## Rebuildability gate

Added `scripts/verify-repo.mjs`. It parses the manifest, checks manifest and HTML local references, and runs `node --check` over repository JavaScript. The script itself passes `node --check`. A controlled fixture with missing `background.js` and `content.js` correctly returned exit 1 and named both missing manifest references, while accepting present references and valid JavaScript. Full repository execution was not claimed because this runtime container cannot directly clone GitHub; the gate is intentionally expected to fail on current `main` until missing runtime files are restored. README documents the gate and explicitly forbids certifying repository rebuildability before it passes.

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
- `popup.js`: repository `b2df626c1ba3a2cb95b608f55053d122ca6a5b4c` / 21907 bytes; recorded artifact target `04b3a2b425f37ee33de2b7194bd7dbea8aaa93da` / 21960 bytes; unresolved.

## Remaining high-value work

1. Recover authoritative v0.8.6 artifact bytes from an available runtime/conversation/library source; do not guess missing source.
2. Reconcile `popup.js` byte-exactly once those bytes are available.
3. Commit authoritative `background.js`, `content.js`, and `dashboard.js` from artifact source.
4. Run `node scripts/verify-repo.mjs`; require a clean pass before repository rebuildability certification.
5. Rebuild ZIP from repository-only source and run ZIP integrity and artifact-content comparison checks.
6. Add durable route-state regression fixtures covering `pending → ambiguous → manual retry/resolved → delivered`, outbox reconciliation, and terminal pruning.
7. Run real ChatGPT browser regression tests for selector/receipt stability.
8. Exercise discarded/frozen recovery with real Chrome memory-saver behavior before automatic recovery.

## Reference / rationale

Chrome extension source remains packaged/local rather than runtime-loaded from GitHub. Repository source is for reproducible development/recovery, not remotely hosted executable code.

References:
- https://developer.chrome.com/docs/extensions
- https://developer.chrome.com/docs/extensions/develop/migrate/known-issues

## Scope

ChatGPT-first. Do not add Claude/Gemini/Grok implementations yet; keep only clean adapter boundaries.
