(() => {
  const TARGETS_KEY = 'parrotTargets';
  const OUTBOX_KEY = 'parrotAmbiguityOutbox';
  const OUTBOX_MAX = 100;
  const RECEIPT_TIMEOUT_MS = 12000;
  const RECEIPT_POLL_MS = 250;
  const localFence = new Set();
  const runners = new Map();
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  async function loadTargets() {
    const data = await chrome.storage.local.get(TARGETS_KEY);
    return Array.isArray(data[TARGETS_KEY]) ? data[TARGETS_KEY] : [];
  }
  async function getTarget(targetId) { return (await loadTargets()).find((target) => target.id === targetId) || null; }
  async function patchTarget(targetId, patch) {
    const targets = await loadTargets();
    const index = targets.findIndex((target) => target.id === targetId);
    if (index < 0) return null;
    targets[index] = { ...targets[index], ...patch };
    await chrome.storage.local.set({ [TARGETS_KEY]: targets });
    return targets[index];
  }

  async function loadOutbox() {
    const data = await chrome.storage.local.get(OUTBOX_KEY);
    return Array.isArray(data[OUTBOX_KEY]) ? data[OUTBOX_KEY] : [];
  }
  async function saveOutbox(outbox) { await chrome.storage.local.set({ [OUTBOX_KEY]: outbox }); }
  async function persistAmbiguity(receipt) {
    const outbox = ParrotRouteState.putAmbiguityReceipt(await loadOutbox(), receipt, OUTBOX_MAX);
    await saveOutbox(outbox); localFence.add(receipt.queueId); return outbox;
  }
  async function ackAmbiguity(queueId) { await saveOutbox(ParrotRouteState.ackAmbiguityReceipt(await loadOutbox(), queueId)); }

  async function waitForStrongReceipt(beforeUserCount) {
    const adapter = globalThis.ParrotSiteAdapter;
    const deadline = Date.now() + RECEIPT_TIMEOUT_MS;
    while (Date.now() < deadline) {
      const afterUserCount = adapter.getUserMessageCount();
      const generating = adapter.isGenerating();
      if (ParrotRouteState.classifyStrongReceipt({ beforeUserCount, afterUserCount, generating }) === 'delivered') return { delivered: true, afterUserCount, generationObserved: generating };
      await sleep(RECEIPT_POLL_MS);
    }
    return { delivered: false, afterUserCount: adapter.getUserMessageCount(), generationObserved: adapter.isGenerating() };
  }

  async function sendPrompt(text) {
    const adapter = globalThis.ParrotSiteAdapter;
    if (!adapter?.matches?.()) return { ok: false, reason: 'provider_mismatch' };
    if (adapter.isGenerating()) return { ok: false, reason: 'generating' };
    const beforeUserCount = adapter.getUserMessageCount();
    if (!text || !adapter.setComposerText(text)) return { ok: false, reason: 'composer_unavailable' };
    const button = adapter.getSendButton();
    if (!button || button.disabled || button.getAttribute('aria-disabled') === 'true') return { ok: false, reason: 'send_unavailable' };
    button.click();
    const evidence = await waitForStrongReceipt(beforeUserCount);
    return evidence.delivered ? { ok: true, evidence } : { ok: false, reason: 'strong_receipt_timeout', evidence, attempted: true };
  }

  async function composeTargetPrompt(target) {
    const targets = await loadTargets();
    return ParrotPromptCompose.compose(target, targets, { firstSend: Number(target?.sentCount || 0) === 0 });
  }

  async function stopIfRequired(target, now = Date.now()) {
    const reason = ParrotRepeatPolicy.stopReason(target, now);
    if (!reason || reason === 'not_running') return reason;
    await patchTarget(target.id, { status: 'stopped', stopReason: reason });
    return reason;
  }

  async function waitUntilIdleOrStopped(targetId) {
    let sawGenerating = globalThis.ParrotSiteAdapter.isGenerating();
    while (true) {
      const target = await getTarget(targetId);
      if (!target || target.status !== 'running') return false;
      const generating = globalThis.ParrotSiteAdapter.isGenerating();
      sawGenerating ||= generating;
      if (sawGenerating && !generating) return true;
      await sleep(500);
    }
  }

  async function runResponseMode(targetId, initialDelayMs = 0) {
    const token = crypto.randomUUID(); runners.set(targetId, token);
    if (initialDelayMs > 0) await sleep(initialDelayMs);
    while (runners.get(targetId) === token) {
      const target = await getTarget(targetId);
      if (!target || target.status !== 'running' || target.mode !== 'response') break;
      if (await stopIfRequired(target)) break;
      if (globalThis.ParrotSiteAdapter.isGenerating()) { await sleep(500); continue; }

      const result = await sendPrompt(await composeTargetPrompt(target));
      if (!result.ok) {
        if (result.reason === 'generating') { await sleep(500); continue; }
        await patchTarget(targetId, { lastError: result.reason || 'send_failed' });
        await sleep(Math.max(1000, Number(target.delaySec || 3) * 1000));
        continue;
      }
      await patchTarget(targetId, { sentCount: Number(target.sentCount || 0) + 1, lastSentAt: Date.now(), lastError: '' });
      const completed = await waitUntilIdleOrStopped(targetId);
      if (!completed) break;
      const fresh = await getTarget(targetId);
      await sleep(Math.max(0, Number(fresh?.delaySec || 0) * 1000));
    }
    if (runners.get(targetId) === token) runners.delete(targetId);
  }

  async function runIntervalMode(targetId, initialDelayMs = 0) {
    const token = crypto.randomUUID(); runners.set(targetId, token);
    if (initialDelayMs > 0) await sleep(initialDelayMs);
    while (runners.get(targetId) === token) {
      const target = await getTarget(targetId);
      if (!target || target.status !== 'running' || target.mode !== 'interval') break;
      if (await stopIfRequired(target)) break;
      if (!ParrotRepeatPolicy.intervalDue(target)) { await sleep(500); continue; }
      if (globalThis.ParrotSiteAdapter.isGenerating()) { await sleep(500); continue; }

      const result = await sendPrompt(await composeTargetPrompt(target));
      if (!result.ok) {
        if (result.reason === 'generating') { await sleep(500); continue; }
        await patchTarget(targetId, { lastError: result.reason || 'send_failed' });
        await sleep(Math.max(1000, Number(target.delaySec || 3) * 1000));
        continue;
      }
      await patchTarget(targetId, { sentCount: Number(target.sentCount || 0) + 1, lastSentAt: Date.now(), lastError: '' });
      await sleep(500);
    }
    if (runners.get(targetId) === token) runners.delete(targetId);
  }

  function startRunner(targetId, mode, initialDelayMs = 0) {
    if (runners.has(targetId)) return false;
    const runner = mode === 'interval' ? runIntervalMode : runResponseMode;
    runner(targetId, initialDelayMs).catch(() => {});
    return true;
  }

  function routePayload(route) { return String(route?.payload ?? route?.prompt ?? route?.message ?? ''); }
  async function deliverRoute(route) {
    const queueId = String(route?.queueId || '');
    if (!queueId) return { ok: false, reason: 'missing_queue_id' };
    if (localFence.has(queueId)) return { ok: false, reason: 'locally_fenced_ambiguous' };
    if (!ParrotRouteState.canAutoDispatch(route)) return { ok: false, reason: 'not_pending' };
    const beforeUserCount = globalThis.ParrotSiteAdapter.getUserMessageCount();
    const result = await sendPrompt(routePayload(route));
    if (result.ok) {
      const receipt = { queueId, deliveredAt: Date.now(), beforeUserCount, afterUserCount: result.evidence.afterUserCount, generationObserved: result.evidence.generationObserved };
      try { await chrome.runtime.sendMessage({ type: 'PARROT_ROUTE_DELIVERED', queueId, receipt }); } catch {}
      return { ok: true, status: 'delivered', receipt };
    }
    if (!result.attempted) return result;
    const receipt = ParrotRouteState.sanitizeAmbiguityReceipt({ queueId, ambiguousAt: Date.now(), beforeUserCount, afterUserCount: result.evidence?.afterUserCount, generationObserved: result.evidence?.generationObserved, reason: 'strong_receipt_timeout' });
    await persistAmbiguity(receipt);
    try { const ack = await chrome.runtime.sendMessage({ type: 'PARROT_ROUTE_AMBIGUOUS', receipt }); if (ack?.ack === true) await ackAmbiguity(queueId); } catch {}
    return { ok: false, status: 'ambiguous', reason: 'strong_receipt_timeout', receipt };
  }

  async function flushAmbiguityOutbox() {
    for (const receipt of await loadOutbox()) {
      localFence.add(receipt.queueId);
      try { const ack = await chrome.runtime.sendMessage({ type: 'PARROT_ROUTE_AMBIGUOUS', receipt }); if (ack?.ack === true) await ackAmbiguity(receipt.queueId); } catch {}
    }
  }

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.type === 'PARROT_START') {
      getTarget(message.targetId).then((target) => {
        if (!target || target.status !== 'running') return sendResponse({ ok: false, reason: 'target_not_running' });
        if (!['response', 'interval'].includes(target.mode)) return sendResponse({ ok: false, reason: 'unsupported_mode' });
        const started = startRunner(message.targetId, target.mode, Math.max(0, Number(message.delayMs || 0)));
        sendResponse({ ok: true, started, mode: target.mode });
      }).catch((error) => sendResponse({ ok: false, reason: String(error?.message || error) }));
      return true;
    }
    if (message?.type === 'PARROT_ROUTE_DELIVER') {
      deliverRoute(message.route).then(sendResponse).catch((error) => sendResponse({ ok: false, reason: 'content_error', error: String(error?.message || error) }));
      return true;
    }
    return false;
  });

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local' || !changes[TARGETS_KEY]) return;
    const next = Array.isArray(changes[TARGETS_KEY].newValue) ? changes[TARGETS_KEY].newValue : [];
    for (const [targetId] of runners) if (next.find((target) => target.id === targetId)?.status !== 'running') runners.delete(targetId);
  });

  flushAmbiguityOutbox();
})();
