(() => {
  const accepted = new Set();
  const active = new Set();
  let scheduled = false;

  function normalize(raw) {
    try {
      const url = new URL(raw);
      if (url.origin !== 'https://parrot.invalid') return null;
      if (!/^\/(complete|wake|message)\//.test(url.pathname)) return null;
      return url.href;
    } catch { return null; }
  }

  async function submit(href) {
    if (accepted.has(href) || active.has(href)) return;
    active.add(href);
    try {
      const result = await chrome.runtime.sendMessage({ type: 'PARROT_SIGNAL_DISCOVERED', href, sourceUrl: location.href });
      if (result?.ok === true) accepted.add(href);
    } catch {}
    active.delete(href);
  }

  async function inspect() {
    scheduled = false;
    const found = new Set();
    for (const anchor of document.querySelectorAll('a[href^="https://parrot.invalid/"]')) {
      const href = normalize(anchor.href);
      if (href) found.add(href);
    }
    await Promise.all([...found].map(submit));
  }

  function scheduleInspect() {
    if (scheduled) return;
    scheduled = true;
    setTimeout(inspect, 100);
  }

  new MutationObserver(scheduleInspect).observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['href'] });
  scheduleInspect();
})();
