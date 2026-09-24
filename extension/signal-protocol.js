((root, factory) => {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.ParrotSignalProtocol = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, () => {
  function parse(raw) {
    try {
      const url = new URL(raw);
      if (url.origin !== 'https://parrot.invalid') return null;
      const parts = url.pathname.split('/').filter(Boolean).map(decodeURIComponent);
      if (parts[0] === 'complete' && parts.length === 2 && parts[1]) return { kind: 'complete', runId: parts[1], signalId: `complete:${parts[1]}` };
      if ((parts[0] === 'wake' || parts[0] === 'message') && parts.length === 3 && parts[1] && parts[2]) {
        const to = String(url.searchParams.get('to') || '').trim();
        if (!to) return null;
        return { kind: parts[0], sourceRunId: parts[1], eventId: parts[2], to, ref: String(url.searchParams.get('ref') || ''), signalId: `${parts[0]}:${parts[1]}:${parts[2]}` };
      }
    } catch {}
    return null;
  }
  function applyTemplate(template, values) { return String(template || '').replace(/\{\{([A-Z_]+)\}\}/g, (_match, key) => values[key] ?? ''); }
  return Object.freeze({ parse, applyTemplate });
});
