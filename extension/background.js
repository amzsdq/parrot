const STORAGE_KEY = 'parrotTargets';
const ROUTE_QUEUE_KEY = 'parrotRouteQueue';
const ROUTE_RECEIPT_OUTBOX_KEY = 'parrotRouteReceiptOutbox';
const TICK_ALARM = 'parrot-tick';
const PARROT_HOST = 'parrot.invalid';
const ROUTE_REDISPATCH_MS = 60_000;
const MAX_ROUTE_RECORDS = 300;

// Canonical source is the v0.8.6 artifact; full file synced by relay.
