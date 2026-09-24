(() => {
  const TERMINAL_ROUTE_STATUSES = new Set(['delivered', 'resolved']);

  function classifyStrongReceipt({ beforeUserCount, afterUserCount, generating }) {
    const before = Number(beforeUserCount);
    const after = Number(afterUserCount);
    if (Number.isFinite(before) && Number.isFinite(after) && after > before) return 'delivered';
    if (generating === true) return 'delivered';
    return 'ambiguous';
  }

  function canAutoDispatch(record) { return record?.status === 'pending'; }

  function sanitizeAmbiguityReceipt(receipt = {}) {
    const clean = { queueId: String(receipt.queueId || ''), ambiguousAt: Number(receipt.ambiguousAt || Date.now()) };
    for (const key of ['beforeUserCount', 'afterUserCount']) {
      const value = Number(receipt[key]);
      if (Number.isFinite(value) && value >= 0) clean[key] = value;
    }
    if (typeof receipt.generationObserved === 'boolean') clean.generationObserved = receipt.generationObserved;
    if (typeof receipt.reason === 'string') clean.reason = receipt.reason.slice(0, 120);
    return clean;
  }

  function reconcileAmbiguity(record, receipt = {}) {
    if (!record || TERMINAL_ROUTE_STATUSES.has(record.status)) return record;
    const clean = sanitizeAmbiguityReceipt(receipt);
    return { ...record, status: 'ambiguous', ambiguousAt: clean.ambiguousAt, ambiguity: clean };
  }

  function manualRetry(record, authorizedAt = Date.now()) {
    if (record?.status !== 'ambiguous') return record;
    return { ...record, status: 'pending', retryAuthorizedAt: authorizedAt, ambiguity: null };
  }

  function manualResolve(record, resolvedAt = Date.now()) {
    if (record?.status !== 'ambiguous') return record;
    return { ...record, status: 'resolved', resolvedAt, ambiguity: null };
  }

  function pruneRouteRecords(records, maxRouteRecords) {
    const max = Math.max(0, Number(maxRouteRecords) || 0);
    const active = records.filter((record) => !TERMINAL_ROUTE_STATUSES.has(record?.status));
    const terminal = records.filter((record) => TERMINAL_ROUTE_STATUSES.has(record?.status)).sort((a, b) => Number(b.deliveredAt || b.resolvedAt || 0) - Number(a.deliveredAt || a.resolvedAt || 0));
    return [...active, ...terminal.slice(0, Math.max(0, max - active.length))];
  }

  function putAmbiguityReceipt(outbox, receipt, maxEntries = 100) {
    const clean = sanitizeAmbiguityReceipt(receipt);
    if (!clean.queueId) return Array.isArray(outbox) ? [...outbox] : [];
    const max = Math.max(1, Number(maxEntries) || 100);
    const prior = (Array.isArray(outbox) ? outbox : []).filter((item) => item?.queueId !== clean.queueId);
    return [...prior, clean].sort((a, b) => Number(a.ambiguousAt || 0) - Number(b.ambiguousAt || 0)).slice(-max);
  }

  function ackAmbiguityReceipt(outbox, queueId) { return (Array.isArray(outbox) ? outbox : []).filter((item) => item?.queueId !== queueId); }

  function classifyTabStructure(tab) {
    if (!tab) return { structuralState: 'not_open', frozenSupport: 'unknown', ordinaryContentFailure: false };
    if (tab.discarded === true) return { structuralState: 'discarded', frozenSupport: 'frozen' in tab ? 'supported' : 'unknown', ordinaryContentFailure: false };
    if (tab.frozen === true) return { structuralState: 'frozen', frozenSupport: 'supported', ordinaryContentFailure: false, messageMayBeQueuedUntilUnfreeze: true };
    return { structuralState: 'open', frozenSupport: 'frozen' in tab ? 'supported' : 'unknown', ordinaryContentFailure: false, mustNotInferFrozenFalse: !('frozen' in tab) };
  }

  globalThis.ParrotRouteState = Object.freeze({ classifyStrongReceipt, canAutoDispatch, sanitizeAmbiguityReceipt, reconcileAmbiguity, manualRetry, manualResolve, pruneRouteRecords, putAmbiguityReceipt, ackAmbiguityReceipt, classifyTabStructure });
})();
