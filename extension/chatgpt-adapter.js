(() => {
  const COOLDOWN_SELECTORS = Object.freeze({
    rate_limit: [
      '[data-testid="rate-limit-error"]',
      '[data-testid="rate-limit-toast"]',
      '[data-error-code="rate_limit"]',
      '[data-error-code="too_many_requests"]'
    ],
    transient: [
      '[data-testid="network-error"]',
      '[data-testid="server-error"]',
      '[data-testid="error-toast"]',
      '[data-error-code="network_error"]',
      '[data-error-code="server_error"]',
      '[role="alert"][data-error-code]'
    ]
  });

  function firstMatch(selectors) {
    for (const selector of selectors) {
      const node = document.querySelector(selector);
      if (node) return { node, selector };
    }
    return null;
  }

  const adapter = {
    id: 'chatgpt',
    matches() {
      return location.hostname === 'chatgpt.com';
    },
    getConversationTitle() {
      const raw = String(document.title || '').trim();
      const cleaned = raw
        .replace(/\s*[\-–—|]\s*ChatGPT\s*$/i, '')
        .replace(/^ChatGPT\s*[\-–—|]\s*/i, '')
        .trim();
      return cleaned && cleaned.toLowerCase() !== 'chatgpt' ? cleaned : '';
    },
    isGenerating() {
      if (document.querySelector('button[data-testid="stop-button"]')) return true;
      if (document.querySelector('[data-message-author-role="assistant"][aria-busy="true"]')) return true;
      if (document.querySelector('[data-message-author-role="assistant"] [aria-busy="true"]')) return true;
      if (document.querySelector('[data-content-search-turn-key] [role="status"][aria-busy="true"]')) return true;
      return false;
    },
    classifyCooldown() {
      // Structural selectors only. Never inspect assistant/user message prose or node text.
      const rate = firstMatch(COOLDOWN_SELECTORS.rate_limit);
      if (rate) return { kind: 'rate_limit', code: rate.node.getAttribute('data-error-code') || 'rate_limit_ui', selector: rate.selector };
      const transient = firstMatch(COOLDOWN_SELECTORS.transient);
      if (transient) return { kind: 'transient', code: transient.node.getAttribute('data-error-code') || 'transient_ui', selector: transient.selector };
      return null;
    },
    getComposer() {
      return (
        document.querySelector('#prompt-textarea') ||
        document.querySelector('[data-testid="prompt-textarea"]') ||
        document.querySelector('div[contenteditable="true"][data-lexical-editor="true"]') ||
        document.querySelector('div.ProseMirror[contenteditable="true"]')
      );
    },
    getSendButton() {
      const composer = this.getComposer();
      return (
        document.querySelector('button[data-testid="send-button"]') ||
        document.querySelector('button[data-testid$="send-button"]') ||
        document.querySelector('#composer-submit-button') ||
        document.querySelector('button[aria-label="Send prompt"]') ||
        document.querySelector('button.composer-submit-btn') ||
        composer?.closest('form')?.querySelector('button[type="submit"]')
      );
    },
    getUserMessageCount() {
      return document.querySelectorAll('[data-message-author-role="user"], [data-user-message-bubble="true"]').length;
    },
    setComposerText(text) {
      const el = this.getComposer();
      if (!el) return false;
      el.focus();

      if (el instanceof HTMLTextAreaElement || el instanceof HTMLInputElement) {
        const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
        const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
        if (setter) setter.call(el, text);
        else el.value = text;
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
        return true;
      }

      if (el.isContentEditable) {
        document.execCommand('selectAll', false, null);
        document.execCommand('insertText', false, text);
        el.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: text }));
        return (el.innerText || el.textContent || '').trim().length > 0;
      }

      return false;
    }
  };

  globalThis.ParrotSiteAdapter = adapter;
})();
