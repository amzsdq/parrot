# v0.8.7 route-state evidence

Status: reconstruction evidence; not a release certification.

## Source under test

- `extension/route-state.js`
- `extension/route-queue.js`
- `tests/route-state-contract.json`
- `scripts/test-route-state.mjs`
- `scripts/test-route-queue.mjs`
- `.github/workflows/route-state-contract.yml`

The model is deliberately semantic-content blind. Ambiguity receipts are sanitized to an allowlist of structural fields before queue/outbox persistence; unapproved fields such as message text are discarded.

## Deterministic evidence

Initial route-state CI run `35957380718` succeeded. After adding the route-queue integration layer, CI exposed a real syntax regression in the new test runner (`resolve` binding collision with `node:path`). The runner was corrected rather than bypassed.

GitHub Actions run `35957550973` on commit `795773a648ed6e25ddafe17429767b5a1fb85c49` then completed successfully. Its workflow syntax-checks both runtime primitives and both runners, executes the route-state contract vectors, and executes route-queue integration tests proving:

- periodic processing dispatches pending only;
- ambiguity reconciliation is state-only and does not dispatch;
- manual retry creates exactly one explicit dispatch call;
- manual resolve is terminal without dispatch;
- strong receipt can mark delivered;
- ambiguity persistence strips unapproved/semantic fields;
- state/outbox/pruning/structural-tab vectors remain green.

This is repository-native execution evidence on GitHub's Ubuntu runner with Node 22. It does not claim the still-incomplete extension source tree is release-ready.

## Recovered v0.8.0 integration seams

Recovered v0.8.0 `background.js` periodically dispatches every route record except `delivered`; this must become pending-only dispatch. Recovered v0.8.0 `content.js` accepts generation start, composer cleared, or composer changed as send receipt; composer-only signals must no longer prove delivery. A send attempt without a strong structural receipt must persist an ambiguity receipt before transient background notification and locally fence that queue id.

The selected loading strategy for v0.8.7 is one canonical browser-global `route-state.js`: classic MV3 background uses `importScripts('route-state.js', 'route-queue.js')`, while content scripts load `route-state.js` before `content.js`. This avoids two hand-maintained state-machine copies and is supported by Chrome's documented service-worker script import modes.

## Handoff-log durability

`.github/workflows/mirror-baton-log.yml` now mirrors each unseen latest `docs/BATON.md` snapshot into `docs/DEVELOPMENT_LOG.md` append-only, keyed by `WORK_PACKAGE_ID`. Its first run successfully appended `PARROT-BATON-004`, eliminating the connector's full-file-replacement append hazard for future handoffs.

## Exact popup evidence

Library `parrot_extension_v0.8.0.zip` contains `popup.js` of 21,960 bytes. Local `node --check` passes and `git hash-object` is `04b3a2b425f37ee33de2b7194bd7dbea8aaa93da`, matching the recorded target. Current GitHub connector text writes do not expose a local-file parameter, and attempting to reference that local hash directly in a Git tree returned 422 because the blob is not yet a GitHub repository object. Keep this as exact-byte evidence; do not falsely certify the current repository popup until a byte-preserving write succeeds.
