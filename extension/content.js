(() => {
  const OUTBOX_KEY = 'parrotAmbiguityOutbox';
  const OUTBOX_MAX = 100;
  const RECEIPT_TIMEOUT_MS = 12000;
  const RECEIPT_POLL_MS = 250;
  const localFence = new Set();
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  async function loadOutbox() {
    const data = await chrome.storage.local.get(OUTBOX_KEY);
    return Array.isArray(data[OUTBOX_KEY]) ? data[OUTBOX_KEY] : [];
  }
  async function saveOutbox(outbox) { await chrome.storage.local.set({ [OUTBOX_KEY]: outbox }); }

  async function persistAmbiguity(receipt) {
    const outbox = ParrotRouteState.putAmbiguityReceipt(await loadOutbox(), receipt, OUTBOX_MAX);
    await saveOutbox(outbox);
    localFence.add(receipt.queueId);
    return outbox;
  }

  async function ackAmbiguity(queueId) {
    await saveOutbox(ParrotRouteState.ackAmbiguityReceipt(await loadOutbox(), queueId));
  }

  async function waitForStrongReceipt(beforeUserCount) {
    const adapter = globalThis.ParrotSiteAdapter;
    const deadline = Date.now() + RECEIPT_TIMEOUT_MS;
    while (Date.now() < deadline) {
      const afterUserCount = adapter.getUserMessageCount();
      const generating = adapter.isGenerating();
      if (ParrotRouteState.classifyStrongReceipt({ beforeUserCount, afterUserCount, generating }) === 'delivered') {
        return { delivered: true, afterUserCount, generationObserved: generating };
      }
      await sleep(RECEIPT_POLL_MS);
    }
    return { delivered: false, afterUserCount: adapter.getUserMessageCount(), generationObserved: adapter.isGenerating() };
  }

  function routePayload(route) {
    return String(route?.payload ?? route?.prompt ?? route?.message ?? '');
  }

  async function deliverRoute(route) {
    const queueId = String(route?.queueId || '');
    if (!queueId) return { ok: false, reason: 'missing_queue_id' };
    if (localFence.has(queueId)) return { ok: false, reason: 'locally_fenced_ambiguous' };
    if (!ParrotRouteState.canAutoDispatch(route)) return { ok: false, reason: 'not_pending' };

    const adapter = globalThis.ParrotSiteAdapter;
    if (!adapter?.matches?.()) return { ok: false, reason: 'provider_mismatch' };
    if (adapter.isGenerating()) return { ok: false, reason: 'generating' };
    const beforeUserCount = adapter.getUserMessageCount();
    const payload = routePayload(route);
    if (!payload || !adapter.setComposerText(payload)) return { ok: false, reason: 'composer_unavailable' };
    const sendButton = adapter.getSendButton();
    if (!sendButton || sendButton.disabled || sendButton.getAttribute('aria-disabled') === 'true') return { ok: false, reason: 'send_unavailable' };

    sendButton.click();
    const evidence = await waitForStrongReceipt(beforeUserCount);
    if (evidence.delivered) {
      const receipt = { queueId, deliveredAt: Date.now(), beforeUserCount, afterUserCount: evidence.afterUserCount, generationObserved: evidence.generationObserved };
      try { await chrome.runtime.sendMessage({ type: 'PARROT_ROUTE_DELIVERED', queueId, receipt }); } catch {}
      return { ok: true, status: 'delivered', receipt };
    }

    const receipt = ParrotRouteState.sanitizeAmbiguityReceipt({
      queueId,
      ambiguousAt: Date.now(),
      beforeUserCount,
      afterUserCount: evidence.afterUserCount,
      generationObserved: evidence.generationObserved,
      reason: 'strong_receipt_timeout'
    });
    await persistAmbiguity(receipt);
    try {
      const ack = await chrome.runtime.sendMessage({ type: 'PARROT_ROUTE_AMBIGUOUS', receipt });
      if (ack?.ack === true) await ackAmbiguity(queueId);
    } catch {
      // Durable outbox remains authoritative when transient messaging fails.
    }
    return { ok: false, status: 'ambiguous', reason: 'strong_receipt_timeout', receipt };
  }

  async function flushAmbiguityOutbox() {
    for (const receipt of await loadOutbox()) {
      localFence.add(receipt.queueId);
      try {
        const ack = await chrome.runtime.sendMessage({ type: 'PARROT_ROUTE_AMBIGUOUS', receipt });
        if (ack?.ack === true) await ackAmbiguity(receipt.queueId);
      } catch {}
    }
  }

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.type !== 'PARROT_ROUTE_DELIVER') return false;
    deliverRoute(message.route).then(sendResponse).catch((error) => sendResponse({ ok: false, reason: 'content_error', error: String(error?.message || error) }));
    return true;
  });

  flushAmbiguityOutbox();
})();
