(() => {
  const DEFAULT_MAX_ROUTE_RECORDS = 300;

  function createRouteQueueApi({ load, save, dispatch, now = () => Date.now(), maxRecords = DEFAULT_MAX_ROUTE_RECORDS }) {
    if (typeof load !== 'function' || typeof save !== 'function' || typeof dispatch !== 'function') throw new TypeError('route queue requires load/save/dispatch');
    const state = globalThis.ParrotRouteState;
    if (!state) throw new Error('ParrotRouteState must load before route-queue.js');
    const inFlight = new Set();

    async function mutate(queueId, updater) {
      const queue = await load();
      let changed = false;
      const next = queue.map((item) => {
        if (item?.queueId !== queueId) return item;
        const updated = updater(item);
        changed = updated !== item;
        return updated;
      });
      if (changed) await save(state.pruneRouteRecords(next, maxRecords));
      return next.find((item) => item?.queueId === queueId) || null;
    }

    async function dispatchOnce(item) {
      if (!item?.queueId) return { ok: false, reason: 'missing_queue_id' };
      if (inFlight.has(item.queueId)) return { ok: false, reason: 'dispatch_in_flight', skipped: true };
      inFlight.add(item.queueId);
      try { return await dispatch(item); }
      finally { inFlight.delete(item.queueId); }
    }

    async function processEligible() {
      const queue = await load();
      const results = [];
      for (const item of queue) {
        if (!state.canAutoDispatch(item)) continue;
        results.push({ queueId: item.queueId, result: await dispatchOnce(item) });
      }
      return results;
    }

    async function recordDelivered(queueId, receipt = {}) {
      return mutate(queueId, (item) => ({ ...item, status: 'delivered', deliveredAt: receipt.deliveredAt ?? now(), lastError: '', ambiguity: null }));
    }

    async function reconcileAmbiguity(receipt) {
      if (!receipt?.queueId) return { ok: false, reason: 'missing_queue_id' };
      const updated = await mutate(receipt.queueId, (item) => state.reconcileAmbiguity(item, receipt));
      if (!updated) return { ok: false, reason: 'queue_item_not_found' };
      return { ok: true, item: updated, dispatched: false };
    }

    async function manualRetry(queueId) {
      const updated = await mutate(queueId, (item) => state.manualRetry(item, now()));
      if (!updated) return { ok: false, reason: 'queue_item_not_found' };
      if (updated.status !== 'pending') return { ok: false, reason: 'not_ambiguous' };
      const result = await dispatchOnce(updated);
      return { ok: !result?.skipped, item: updated, dispatched: !result?.skipped, result };
    }

    async function manualResolve(queueId) {
      const updated = await mutate(queueId, (item) => state.manualResolve(item, now()));
      if (!updated) return { ok: false, reason: 'queue_item_not_found' };
      if (updated.status !== 'resolved') return { ok: false, reason: 'not_ambiguous' };
      return { ok: true, item: updated, dispatched: false };
    }

    return Object.freeze({ processEligible, recordDelivered, reconcileAmbiguity, manualRetry, manualResolve });
  }

  globalThis.ParrotRouteQueue = Object.freeze({ createRouteQueueApi });
})();
