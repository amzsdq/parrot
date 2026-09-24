(() => {
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
      return false;
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
      return (
        document.querySelector('button[data-testid="send-button"]') ||
        document.querySelector('button[data-testid$="send-button"]') ||
        document.querySelector('#composer-submit-button') ||
        document.querySelector('button[aria-label="Send prompt"]') ||
        document.querySelector('button.composer-submit-btn')
      );
    },
    getUserMessageCount() {
      return document.querySelectorAll('[data-message-author-role="user"]').length;
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
