(() => {
  const SEEN_KEY = 'parrotSeenSignals';
  const MAX_SEEN = 1000;
  let scheduled = false;

  async function loadSeen() {
    const data = await chrome.storage.local.get(SEEN_KEY);
    return Array.isArray(data[SEEN_KEY]) ? data[SEEN_KEY] : [];
  }
  async function remember(href) {
    const seen = await loadSeen();
    if (seen.includes(href)) return false;
    await chrome.storage.local.set({ [SEEN_KEY]: [...seen, href].slice(-MAX_SEEN) });
    return true;
  }
  function validSignalHref(raw) {
    try {
      const url = new URL(raw);
      if (url.origin !== 'https://parrot.invalid') return null;
      if (!/^\/(complete|wake|message)\//.test(url.pathname)) return null;
      return url.href;
    } catch { return null; }
  }
  async function scan() {
    scheduled = false;
    const hrefs = new Set();
    for (const anchor of document.querySelectorAll('a[href^="https://parrot.invalid/"]')) {
      const href = validSignalHref(anchor.href);
      if (href) hrefs.add(href);
    }
    for (const href of hrefs) {
      if (!await remember(href)) continue;
      try { await chrome.runtime.sendMessage({ type: 'PARROT_SIGNAL_DISCOVERED', href, sourceUrl: location.href }); } catch {}
    }
  }
  function scheduleScan() {
    if (scheduled) return;
    scheduled = true;
    setTimeout(scan, 100);
  }
  new MutationObserver(scheduleScan).observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['href'] });
  scheduleScan();
})();
