import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const protocol = require('../extension/signal-protocol.js');

assert.deepEqual(protocol.parse('https://parrot.invalid/complete/run-1'), { kind:'complete', runId:'run-1', signalId:'complete:run-1' });
assert.deepEqual(protocol.parse('https://parrot.invalid/wake/run-1/e1?to=B'), { kind:'wake', sourceRunId:'run-1', eventId:'e1', to:'B', ref:'', signalId:'wake:run-1:e1' });
assert.deepEqual(protocol.parse('https://parrot.invalid/message/run-1/e2?to=AA&ref=https%3A%2F%2Fexample.com%2Fx'), { kind:'message', sourceRunId:'run-1', eventId:'e2', to:'AA', ref:'https://example.com/x', signalId:'message:run-1:e2' });
assert.equal(protocol.parse('https://parrot.invalid/wake/run-1/e1'), null);
assert.equal(protocol.parse('https://example.com/wake/run-1/e1?to=B'), null);
assert.equal(protocol.parse('https://parrot.invalid/wake/run-1?to=B'), null);
assert.equal(protocol.parse('not a url'), null);
assert.equal(protocol.parse('https://parrot.invalid/complete/'), null);
assert.equal(protocol.applyTemplate('{{FROM}}>{{TO}} {{MESSAGE}}', { FROM:'A', TO:'B', MESSAGE:'REFERENCE: x' }), 'A>B REFERENCE: x');
console.log('PASS: canonical signal protocol vectors');
