(() => {
  const TERMINAL_ROUTE_STATUSES = new Set(['delivered', 'resolved']);

  function classifyStrongReceipt({ beforeUserCount, afterUserCount, generating }) {
    const before = Number(beforeUserCount);
    const after = Number(afterUserCount);
    if (Number.isFinite(before) && Number.isFinite(after) && after > before) return 'delivered';
    if (generating === true) return 'delivered';
    return 'ambiguous';
  }

  function canAutoDispatch(record) {
    return record?.status === 'pending';
  }

  function reconcileAmbiguity(record, receipt = {}) {
    if (!record || TERMINAL_ROUTE_STATUSES.has(record.status)) return record;
    return {
      ...record,
      status: 'ambiguous',
      ambiguousAt: receipt.ambiguousAt ?? Date.now(),
      ambiguity: receipt
    };
  }

  function manualRetry(record) {
    if (record?.status !== 'ambiguous') return record;
    return {
      ...record,
      status: 'pending',
      retryAuthorizedAt: Date.now(),
      ambiguity: null
    };
  }

  function manualResolve(record, resolvedAt = Date.now()) {
    if (record?.status !== 'ambiguous') return record;
    return {
      ...record,
      status: 'resolved',
      resolvedAt,
      ambiguity: null
    };
  }

  function pruneRouteRecords(records, maxRouteRecords) {
    const max = Math.max(0, Number(maxRouteRecords) || 0);
    const active = records.filter((record) => !TERMINAL_ROUTE_STATUSES.has(record?.status));
    const terminal = records
      .filter((record) => TERMINAL_ROUTE_STATUSES.has(record?.status))
      .sort((a, b) => Number(b.deliveredAt || b.resolvedAt || 0) - Number(a.deliveredAt || a.resolvedAt || 0));
    const remaining = Math.max(0, max - active.length);
    return [...active, ...terminal.slice(0, remaining)];
  }

  globalThis.ParrotRouteState = Object.freeze({
    classifyStrongReceipt,
    canAutoDispatch,
    reconcileAmbiguity,
    manualRetry,
    manualResolve,
    pruneRouteRecords
  });
})();
