# v0.8.7 route-state evidence

Status: reconstruction evidence; not a release certification.

## Source under test

- `extension/route-state.js`
- `tests/route-state-contract.json`
- `scripts/test-route-state.mjs`
- `.github/workflows/route-state-contract.yml`

The model is deliberately semantic-content blind. It accepts only route status, structural send receipt evidence, timestamps/ids, and structural tab properties.

## Deterministic evidence

Local Node/vm execution passed focused checks for user-count/generation strong receipts, composer-only ambiguity, ambiguity auto-dispatch fencing, manual retry/resolve, discarded/frozen/unsupported-frozen structural states, active-preserving pruning, and bounded idempotent ambiguity-outbox operations.

GitHub Actions then executed the repository-native runner on commit `badbb1d28b14682a183cabd0773ec51a5384d360` in workflow run `35957380718` (`Route State Contract`). The run completed successfully on 2026-09-24T04:50:59Z. The workflow performs `node --check extension/route-state.js`, `node --check scripts/test-route-state.mjs`, and `node scripts/test-route-state.mjs` on an Ubuntu runner with Node 22. This upgrades the route-state primitive from source-only evidence to repository-native deterministic execution evidence.

The workflow is path-scoped to the primitive, vectors, runner, and workflow itself; it does not claim the still-incomplete extension source tree is release-ready.

## Recovered v0.8.0 integration seams

Recovered v0.8.0 `background.js` periodically dispatches every route record except `delivered`; this must become pending-only dispatch. Recovered v0.8.0 `content.js` accepts generation start, composer cleared, or composer changed as send receipt; composer-only signals must no longer prove delivery. A send attempt without a strong structural receipt must persist an ambiguity receipt before transient background notification and locally fence that queue id.

The selected loading strategy for v0.8.7 is one canonical browser-global `route-state.js`: classic MV3 background uses `importScripts('route-state.js')`, while content scripts load the same file before `content.js`. This avoids two hand-maintained state-machine copies and is supported by Chrome's documented service-worker script import modes.

## Exact popup evidence

Library `parrot_extension_v0.8.0.zip` contains `popup.js` of 21,960 bytes. Local `node --check` passes and `git hash-object` is `04b3a2b425f37ee33de2b7194bd7dbea8aaa93da`, matching the recorded target. Current GitHub connector text writes do not expose a local-file parameter, and attempting to reference that local hash directly in a Git tree returned 422 because the blob is not yet a GitHub repository object. Keep this as exact-byte evidence; do not falsely certify the current repository popup until a byte-preserving write succeeds.
