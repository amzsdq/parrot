# v0.8.7 route-state evidence

Status: reconstruction evidence; not a release certification.

## Source under test

- `extension/route-state.js`
- `tests/route-state-contract.json`
- `scripts/test-route-state.mjs`

The model is deliberately semantic-content blind. It accepts only route status, structural send receipt evidence, timestamps/ids, and structural tab properties.

## Executed local deterministic checks

A Node `vm` execution of the current route-state implementation passed focused checks for:

1. user-message count increase => delivered;
2. generation start => delivered;
3. no strong signal => ambiguous even when composer-only evidence exists;
4. ambiguous is fenced from automatic dispatch;
5. explicit manual retry returns ambiguous -> pending;
6. explicit manual resolve returns ambiguous -> resolved;
7. discarded tab structural classification;
8. frozen tab structural classification and queued-message caveat;
9. absent `frozen` property => support unknown, not inferred false;
10. mixed terminal pruning retains active and bounds terminal history;
11. active-over-cap pruning retains all active records;
12. ambiguity outbox upsert replaces same queue id rather than duplicating;
13. bounded ambiguity outbox evicts oldest receipts;
14. ambiguity outbox acknowledgement removes only the acknowledged queue id.

These checks were executed against a local copy of the same current primitive logic. The repository runner exists but a fresh-main `git clone` could not be performed in this runtime because the execution container has no DNS/network access. Therefore do not claim `node scripts/test-route-state.mjs` on a fresh checkout has run yet.

## Recovered v0.8.0 integration seams

Recovered v0.8.0 `background.js` periodically dispatches every route record except `delivered`; this must become pending-only dispatch. Recovered v0.8.0 `content.js` accepts generation start, composer cleared, or composer changed as send receipt; composer-only signals must no longer prove delivery. A send attempt without a strong structural receipt must persist an ambiguity receipt before transient background notification and locally fence that queue id.

## Exact popup evidence

Library `parrot_extension_v0.8.0.zip` contains `popup.js` of 21,960 bytes. Local `node --check` passes and `git hash-object` is `04b3a2b425f37ee33de2b7194bd7dbea8aaa93da`, matching the recorded target. Current GitHub connector text writes do not expose a local-file parameter, and attempting to reference that local hash directly in a Git tree returned 422 because the blob is not yet a GitHub repository object. Keep this as exact-byte evidence; do not falsely certify the current repository popup until a byte-preserving write succeeds.
