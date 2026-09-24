const STORAGE_KEY = 'parrotTargets';
const COMPLETION_LINK_PREFIX = 'https://parrot.invalid/complete/';
const COMPLETION_URL_TOKEN = '{{SIGNAL_URL}}';
const DEFAULT_COMPLETION_INSTRUCTION = `반드시 사용자가 요청한 전체 작업이 실제로 완료된 경우에만 아래 완료 신호를 한 번 출력하고, 진행 중이거나 일부 단계만 완료된 경우에는 출력하지 마세요.\n\n{{SIGNAL_URL}}`;
const LEGACY_COMPLETION_INSTRUCTION_V04 = `[앵무새 종료 규칙]\n전체 작업이 끝난 경우에만 아래 URL을 한 줄로 정확히 1회 출력하세요.\n{{SIGNAL_URL}}\n중간 단계·부분 완료·한 턴 완료에는 출력하지 마세요.`;
const DEFAULT_ONBOARDING_TEMPLATE = `[앵무새 연결]
이 대화의 Route ID: {{SELF}}

다른 등록 대화를 깨울 때만 아래 형식의 URL을 단독 줄에 출력하세요.
WAKE: {{WAKE_URL}}

참조를 전달할 때:
MESSAGE: {{MESSAGE_URL}}

EVENT_ID는 이 실행에서 m1, m2처럼 신호마다 새 값을 사용하세요.
REFERENCE에는 상대가 직접 확인할 URL이나 문서 ID만 넣으세요.

등록 TARGET:
{{TARGETS}}`;
const DEFAULT_WAKE_PROMPT = '계속 작업하세요.';
const DEFAULT_MESSAGE_TEMPLATE = `[앵무새 | {{FROM}} → {{TO}}]

SOURCE: {{SOURCE_URL}}

{{MESSAGE}}`;
const ONBOARDING_REQUIRED_TOKENS = ['{{WAKE_URL}}', '{{MESSAGE_URL}}', '{{TARGETS}}'];
const MESSAGE_TOKEN = '{{MESSAGE}}';

const $ = (id) => document.getElementById(id);
const els = {
  targetSelect: $('targetSelect'), url: $('url'), prompt: $('prompt'), mode: $('mode'),
  delaySec: $('delaySec'), sendImmediately: $('sendImmediately'), intervalMin: $('intervalMin'),
  maxRepeats: $('maxRepeats'), runtimeMin: $('runtimeMin'), status: $('status'),
  sentCount: $('sentCount'), lastError: $('lastError'), cooldown: $('cooldown'), message: $('message'),
  responseOptions: $('responseOptions'), intervalOptions: $('intervalOptions'),
  completionEnabled: $('completionEnabled'),
  appendCompletionInstruction: $('appendCompletionInstruction'), completionInstructionTemplate: $('completionInstructionTemplate'),
  completionRuleEditor: $('completionRuleEditor'), targetTitleHint: $('targetTitleHint'), providerHint: $('providerHint'), cooldownEnabled: $('cooldownEnabled'),
  routingEnabled: $('routingEnabled'), advancedSettings: $('advancedSettings'),
  connectionSettings: $('connectionSettings'), onboardingEnabled: $('onboardingEnabled'), onboardingTemplate: $('onboardingTemplate'),
  wakePrompt: $('wakePrompt'), messageTemplate: $('messageTemplate')
};

let targets = [];
let selectedId = null;

init();

async function init() {
  await loadTargets();
  if (!targets.length) addNewTarget(false);
  renderTargetSelect();
  selectedId = selectedId || targets[0]?.id;
  renderForm();

  $('newTarget').addEventListener('click', () => addNewTarget(true));
  $('dashboard').addEventListener('click', () => chrome.tabs.create({ url: chrome.runtime.getURL('dashboard.html') }));
  $('captureUrl').addEventListener('click', captureCurrentUrl);
  $('start').addEventListener('click', startTarget);
  $('pause').addEventListener('click', () => setStatus('paused'));
  $('stop').addEventListener('click', () => setStatus('stopped'));
  $('delete').addEventListener('click', deleteTarget);
  $('toggleConnectionSettings').addEventListener('click', () => {
    els.connectionSettings.hidden = !els.connectionSettings.hidden;
  });
  $('closeConnectionSettings').addEventListener('click', () => {
    els.connectionSettings.hidden = true;
  });
  $('connectionTabOnboarding').addEventListener('click', () => showConnectionPanel('onboarding'));
  $('connectionTabWake').addEventListener('click', () => showConnectionPanel('wake'));
  $('connectionTabMessage').addEventListener('click', () => showConnectionPanel('message'));
  $('resetOnboardingTemplate').addEventListener('click', async () => {
    els.onboardingTemplate.value = DEFAULT_ONBOARDING_TEMPLATE;
    await saveForm();
    show('온보딩 문구를 기본값으로 복원했습니다.');
  });
  $('resetWakePrompt').addEventListener('click', async () => {
    els.wakePrompt.value = DEFAULT_WAKE_PROMPT;
    await saveForm();
    show('WAKE 문구를 기본값으로 복원했습니다.');
  });
  $('resetMessageTemplate').addEventListener('click', async () => {
    els.messageTemplate.value = DEFAULT_MESSAGE_TEMPLATE;
    await saveForm();
    show('MESSAGE 형식을 기본값으로 복원했습니다.');
  });

  $('toggleCompletionRuleEditor').addEventListener('click', () => {
    els.completionRuleEditor.hidden = !els.completionRuleEditor.hidden;
  });
  $('closeCompletionRuleEditor').addEventListener('click', () => {
    els.completionRuleEditor.hidden = true;
  });
  $('toggleAdvancedSettings').addEventListener('click', () => {
    els.advancedSettings.hidden = !els.advancedSettings.hidden;
  });
  $('closeAdvancedSettings').addEventListener('click', () => {
    els.advancedSettings.hidden = true;
  });
  $('resetCompletionInstruction').addEventListener('click', async () => {
    els.completionInstructionTemplate.value = DEFAULT_COMPLETION_INSTRUCTION;
    await saveForm();
    show('완료 규칙을 기본값으로 복원했습니다.');
  });

  els.targetSelect.addEventListener('change', async () => {
    await saveForm();
    selectedId = els.targetSelect.value;
    renderForm();
  });
  els.mode.addEventListener('change', updateModeVisibility);

  for (const id of [
    'url','prompt','mode','delaySec','sendImmediately','intervalMin','maxRepeats','runtimeMin',
    'completionEnabled','appendCompletionInstruction','completionInstructionTemplate','cooldownEnabled','routingEnabled',
    'onboardingEnabled','onboardingTemplate','wakePrompt','messageTemplate'
  ]) {
    els[id].addEventListener('change', saveForm);
  }

  chrome.storage.onChanged.addListener(async (changes, area) => {
    if (area === 'local' && changes[STORAGE_KEY]) {
      await loadTargets();
      renderTargetSelect();
      renderForm();
    }
  });
}

async function loadTargets() {
  const data = await chrome.storage.local.get(STORAGE_KEY);
  const loaded = Array.isArray(data[STORAGE_KEY]) ? data[STORAGE_KEY] : [];
  const usedLabels = new Set(loaded.map((t) => String(t.workerLabel || '').trim()).filter(Boolean));
  let migrated = false;
  targets = loaded.map((target) => {
    const next = { ...target };
    if (!next.workerLabel) {
      next.workerLabel = nextWorkerLabel(usedLabels);
      usedLabels.add(next.workerLabel);
      migrated = true;
    }
    if (!next.completionInstructionTemplate || next.completionInstructionTemplate === LEGACY_COMPLETION_INSTRUCTION_V04) {
      next.completionInstructionTemplate = DEFAULT_COMPLETION_INSTRUCTION;
      migrated = true;
    }
    if (next.routingEnabled === undefined) {
      next.routingEnabled = true;
      migrated = true;
    }
    if (next.onboardingEnabled === undefined) {
      next.onboardingEnabled = true;
      migrated = true;
    }
    if (!next.onboardingTemplate) {
      next.onboardingTemplate = DEFAULT_ONBOARDING_TEMPLATE;
      migrated = true;
    }
    if (!next.wakePrompt) {
      next.wakePrompt = DEFAULT_WAKE_PROMPT;
      migrated = true;
    }
    if (!next.messageTemplate) {
      next.messageTemplate = DEFAULT_MESSAGE_TEMPLATE;
      migrated = true;
    }
    return next;
  });
  if (migrated) await chrome.storage.local.set({ [STORAGE_KEY]: targets });
}

async function persist() {
  await chrome.storage.local.set({ [STORAGE_KEY]: targets });
}

function addNewTarget(selectIt) {
  const id = crypto.randomUUID();
  const usedLabels = new Set(targets.map((t) => t.workerLabel).filter(Boolean));
  const workerLabel = nextWorkerLabel(usedLabels);
  const target = {
    id,
    workerLabel,
    routeKey: workerLabel,
    url: '',
    prompt: '목표 워킹타임은 10분입니다. 계속 작업해주세요.',
    mode: 'response',
    delaySec: 3,
    sendImmediately: true,
    intervalMin: 11,
    maxRepeats: 0,
    runtimeMin: 0,
    cooldownEnabled: true,
    routingEnabled: true,
    onboardingEnabled: true,
    onboardingTemplate: DEFAULT_ONBOARDING_TEMPLATE,
    wakePrompt: DEFAULT_WAKE_PROMPT,
    messageTemplate: DEFAULT_MESSAGE_TEMPLATE,
    title: '',
    completionEnabled: true,
    completionSignalUrl: '',
    appendCompletionInstruction: true,
    completionInstructionTemplate: DEFAULT_COMPLETION_INSTRUCTION,
    runId: null,
    completedAt: null,
    completionSeenSignal: '',
    completionSignalType: '',
    status: 'stopped',
    sentCount: 0,
    lastSentAt: null,
    startedAt: null,
    cooldownStep: 0,
    cooldownUntil: null,
    lastError: ''
  };
  targets.push(target);
  persist();
  if (selectIt || !selectedId) selectedId = id;
  renderTargetSelect();
  renderForm();
}

function renderTargetSelect() {
  const current = selectedId;
  els.targetSelect.innerHTML = '';
  targets.forEach((t, idx) => {
    const option = document.createElement('option');
    option.value = t.id;
    option.textContent = labelFor(t, idx);
    els.targetSelect.appendChild(option);
  });
  if (targets.some((t) => t.id === current)) els.targetSelect.value = current;
  else if (targets[0]) {
    selectedId = targets[0].id;
    els.targetSelect.value = selectedId;
  }
}

function renderForm() {
  const t = currentTarget();
  if (!t) return;
  els.url.value = t.url || '';
  els.prompt.value = t.prompt || '';
  els.mode.value = t.mode || 'response';
  els.delaySec.value = t.delaySec ?? 3;
  els.sendImmediately.checked = t.sendImmediately !== false;
  els.intervalMin.value = t.intervalMin ?? 11;
  els.maxRepeats.value = t.maxRepeats ?? 0;
  els.runtimeMin.value = t.runtimeMin ?? 0;
  els.cooldownEnabled.checked = t.cooldownEnabled !== false;
  els.routingEnabled.checked = t.routingEnabled !== false;
  els.onboardingEnabled.checked = t.onboardingEnabled !== false;
  els.onboardingTemplate.value = t.onboardingTemplate || DEFAULT_ONBOARDING_TEMPLATE;
  els.wakePrompt.value = t.wakePrompt || DEFAULT_WAKE_PROMPT;
  els.messageTemplate.value = t.messageTemplate || DEFAULT_MESSAGE_TEMPLATE;
  els.completionEnabled.checked = t.completionEnabled !== false;
  els.appendCompletionInstruction.checked = t.appendCompletionInstruction !== false;
  els.completionInstructionTemplate.value = t.completionInstructionTemplate || DEFAULT_COMPLETION_INSTRUCTION;
  els.targetTitleHint.textContent = `Worker ${t.workerLabel || '?'} · ${t.title ? `대화: ${t.title} · ` : ''}라우팅 ID: ${routeKeyFor(t)}`;
  renderProviderHint(t.url);
  els.status.textContent = statusLabel(t.status);
  els.sentCount.textContent = `${t.sentCount || 0}회`;
  els.lastError.textContent = t.lastError || '없음';
  els.cooldown.textContent = formatCooldown(t.cooldownUntil);
  updateModeVisibility();
}

async function saveForm() {
  const t = currentTarget();
  if (!t) return;
  t.url = normalizeUrl(els.url.value.trim());
  t.prompt = els.prompt.value;
  t.mode = els.mode.value;
  t.delaySec = Math.max(0, Number(els.delaySec.value || 0));
  t.sendImmediately = els.sendImmediately.checked;
  t.intervalMin = Math.max(1, Number(els.intervalMin.value || 11));
  t.maxRepeats = Math.max(0, Number(els.maxRepeats.value || 0));
  t.runtimeMin = Math.max(0, Number(els.runtimeMin.value || 0));
  t.cooldownEnabled = els.cooldownEnabled.checked;
  t.routingEnabled = els.routingEnabled.checked;
  t.onboardingEnabled = els.onboardingEnabled.checked;
  t.onboardingTemplate = els.onboardingTemplate.value || DEFAULT_ONBOARDING_TEMPLATE;
  t.wakePrompt = els.wakePrompt.value || DEFAULT_WAKE_PROMPT;
  t.messageTemplate = els.messageTemplate.value || DEFAULT_MESSAGE_TEMPLATE;
  if (!t.cooldownEnabled && t.status === 'cooldown') {
    t.status = 'running';
    t.cooldownUntil = null;
    t.cooldownStep = 0;
  }
  t.completionEnabled = els.completionEnabled.checked;
  t.appendCompletionInstruction = els.appendCompletionInstruction.checked;
  t.completionInstructionTemplate = els.completionInstructionTemplate.value || DEFAULT_COMPLETION_INSTRUCTION;
  await persist();
  renderTargetSelect();
}

async function captureCurrentUrl() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const provider = providerForUrl(tab?.url || '');
  if (!provider) {
    show('지원할 수 있는 AI 대화 탭이 아닙니다.');
    return;
  }
  if (provider.id !== 'chatgpt') {
    show(`${provider.name} 어댑터는 아직 미지원입니다. 현재 버전은 ChatGPT만 실행합니다.`);
    return;
  }
  els.url.value = normalizeUrl(tab.url);
  await saveForm();
  const t = currentTarget();
  if (t) {
    t.title = cleanChatTitle(tab.title);
    await persist();
    renderTargetSelect();
    renderForm();
  }
  show(t?.title ? `현재 탭을 가져왔습니다: ${t.title}` : '현재 대화 URL을 가져왔습니다.');
}

async function startTarget() {
  await saveForm();
  const t = currentTarget();
  if (!t.url) return show('대화 URL을 입력해 주세요.');
  const provider = providerForUrl(t.url);
  if (!provider) return show('지원할 수 있는 AI 대화 URL이 아닙니다.');
  if (provider.id !== 'chatgpt') return show(`${provider.name} 어댑터는 아직 미지원입니다. 현재 버전은 ChatGPT만 실행합니다.`);
  if (!t.prompt.trim()) return show('프롬프트를 입력해 주세요.');

  if (t.routingEnabled !== false && t.onboardingEnabled !== false) {
    const onboardingError = validateOnboardingTemplate(t.onboardingTemplate);
    if (onboardingError) return show(onboardingError);
  }
  if (t.routingEnabled !== false) {
    if (!String(t.wakePrompt || '').trim()) return show('WAKE 문구를 입력해 주세요.');
    const messageError = validateMessageTemplate(t.messageTemplate);
    if (messageError) return show(messageError);
  }

  if (t.completionEnabled && t.appendCompletionInstruction !== false) {
    const templateError = validateCompletionInstructionTemplate(t.completionInstructionTemplate);
    if (templateError) return show(templateError);
  }

  await refreshTargetTitleFromOpenTab(t);
  t.runId = crypto.randomUUID();
  t.completionSignalUrl = `${COMPLETION_LINK_PREFIX}${encodeURIComponent(t.runId)}`;

  t.status = 'running';
  t.startedAt = Date.now();
  t.sentCount = 0;
  t.lastSentAt = null;
  t.cooldownStep = 0;
  t.cooldownUntil = null;
  t.lastError = '';
  t.stopReason = '';
  t.completedAt = null;
  t.completionSeenSignal = '';
  t.completionSignalType = '';
  await persist();
  renderForm();

  // Do not rely only on chrome.storage.onChanged for the initial send.
  // Explicitly arm the active content script so START is deterministic.
  if (t.mode === 'response' && t.sendImmediately !== false) {
    const tab = await findTargetTab(t.url);
    if (!tab?.id) {
      t.status = 'stopped';
      t.lastError = 'target_tab_not_open';
      await persist();
      renderTargetSelect();
      renderForm();
      return show('대상 ChatGPT 탭을 찾지 못했습니다. 해당 대화 탭을 연 뒤 다시 시작해 주세요.');
    }

    try {
      const reply = await chrome.tabs.sendMessage(tab.id, {
        type: 'PARROT_START',
        targetId: t.id,
        delayMs: Math.max(0, Number(t.delaySec || 0)) * 1000
      });
      if (!reply?.ok) throw new Error(reply?.reason || 'start_not_accepted');
    } catch (error) {
      t.status = 'stopped';
      t.lastError = 'content_script_unavailable';
      await persist();
      renderTargetSelect();
      renderForm();
      return show('대상 탭의 앵무새 연결을 확인할 수 없습니다. ChatGPT 탭을 새로고침한 뒤 다시 시작해 주세요.');
    }
  }

  const signalText = t.completionEnabled ? ' / 완료 신호: 고유 링크' : '';
  const routeText = t.routingEnabled !== false ? ' / 라우팅: ON' : '';
  renderTargetSelect();
  renderForm();
  show((t.mode === 'response' ? '응답 종료 감지 모드로 시작했습니다.' : '주기 모드로 시작했습니다.') + signalText + routeText);
}

async function refreshTargetTitleFromOpenTab(target) {
  const tab = await findTargetTab(target.url);
  if (!tab) return;
  const title = cleanChatTitle(tab.title);
  if (title) target.title = title;
}

async function findTargetTab(url) {
  const wanted = normalizeUrl(url);
  const tabs = await chrome.tabs.query({ url: 'https://chatgpt.com/*' });
  return tabs.find((tab) => normalizeUrl(tab.url || '') === wanted) || null;
}

async function setStatus(status) {
  await saveForm();
  const t = currentTarget();
  if (!t) return;
  t.status = status;
  if (status === 'stopped') {
    t.cooldownUntil = null;
    t.cooldownStep = 0;
  }
  await persist();
  renderForm();
  show(status === 'paused' ? '일시정지했습니다.' : '중지했습니다.');
}

async function deleteTarget() {
  const idx = targets.findIndex((t) => t.id === selectedId);
  if (idx < 0) return;
  targets.splice(idx, 1);
  if (!targets.length) addNewTarget(false);
  selectedId = targets[Math.min(idx, targets.length - 1)]?.id || targets[0]?.id;
  await persist();
  renderTargetSelect();
  renderForm();
  show('타겟을 삭제했습니다.');
}

function updateModeVisibility() {
  const response = els.mode.value === 'response';
  els.responseOptions.hidden = !response;
  els.intervalOptions.hidden = response;
}




function providerForUrl(raw) {
  try {
    const host = new URL(raw).hostname.toLowerCase();
    if (host === 'chatgpt.com' || host.endsWith('.chatgpt.com')) return { id: 'chatgpt', name: 'ChatGPT', supported: true };
    if (host === 'claude.ai' || host.endsWith('.claude.ai')) return { id: 'claude', name: 'Claude', supported: false };
    if (host === 'gemini.google.com') return { id: 'gemini', name: 'Gemini', supported: false };
    if (host === 'grok.com' || host.endsWith('.grok.com') || host === 'x.com' || host.endsWith('.x.com')) return { id: 'grok', name: 'Grok', supported: false };
  } catch {}
  return null;
}

function renderProviderHint(raw) {
  if (!els.providerHint) return;
  const provider = providerForUrl(raw || '');
  els.providerHint.classList.remove('unsupported');
  if (!raw) {
    els.providerHint.textContent = '현재 실행 지원: ChatGPT';
    return;
  }
  if (!provider) {
    els.providerHint.textContent = '알 수 없는 Provider';
    els.providerHint.classList.add('unsupported');
    return;
  }
  if (provider.supported) {
    els.providerHint.textContent = `${provider.name} · 지원됨`;
  } else {
    els.providerHint.textContent = `${provider.name} · 어댑터 미지원`;
    els.providerHint.classList.add('unsupported');
  }
}

function currentTarget() {
  return targets.find((t) => t.id === selectedId) || null;
}

function normalizeUrl(raw) {
  try {
    const u = new URL(raw);
    u.search = '';
    u.hash = '';
    return u.toString().replace(/\/$/, '');
  } catch {
    return raw.replace(/[?#].*$/, '').replace(/\/$/, '');
  }
}

function labelFor(t, idx) {
  const worker = t.workerLabel || indexToLetters(idx);
  const title = t.title || (!t.url ? `타겟 ${idx + 1}` : (() => {
    try {
      const u = new URL(t.url);
      const id = u.pathname.split('/').filter(Boolean).pop();
      return id ? `…${id.slice(-8)}` : `타겟 ${idx + 1}`;
    } catch {
      return `타겟 ${idx + 1}`;
    }
  })());
  return `[${worker}] ${title}`;
}

function nextWorkerLabel(used) {
  for (let i = 0; i < 10000; i++) {
    const label = indexToLetters(i);
    if (!used.has(label)) return label;
  }
  return `W${Date.now()}`;
}

function indexToLetters(index) {
  let n = Number(index) + 1;
  let out = '';
  while (n > 0) {
    n -= 1;
    out = String.fromCharCode(65 + (n % 26)) + out;
    n = Math.floor(n / 26);
  }
  return out;
}


function routeKeyFor(target) {
  const explicit = String(target?.routeKey || '').trim();
  if (explicit) return explicit;
  return String(target?.id || '').replace(/-/g, '').slice(0, 12);
}

function cleanChatTitle(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  const cleaned = raw
    .replace(/\s*[\-–—|]\s*ChatGPT\s*$/i, '')
    .replace(/^ChatGPT\s*[\-–—|]\s*/i, '')
    .trim();
  return cleaned && cleaned.toLowerCase() !== 'chatgpt' ? cleaned : '';
}

function showConnectionPanel(kind) {
  const map = {
    onboarding: ['connectionTabOnboarding', 'connectionPanelOnboarding'],
    wake: ['connectionTabWake', 'connectionPanelWake'],
    message: ['connectionTabMessage', 'connectionPanelMessage']
  };
  for (const [key, [tabId, panelId]] of Object.entries(map)) {
    const active = key === kind;
    $(tabId).classList.toggle('active', active);
    $(panelId).hidden = !active;
  }
}

function validateOnboardingTemplate(template) {
  const value = String(template || '');
  for (const token of ONBOARDING_REQUIRED_TOKENS) {
    const count = value.split(token).length - 1;
    if (count !== 1) return `온보딩 문구에는 ${token}이 정확히 1번 있어야 합니다.`;
  }
  return '';
}

function validateMessageTemplate(template) {
  const value = String(template || '');
  const count = value.split(MESSAGE_TOKEN).length - 1;
  if (count !== 1) return `MESSAGE 형식에는 ${MESSAGE_TOKEN}이 정확히 1번 있어야 합니다.`;
  return '';
}

function validateCompletionInstructionTemplate(template) {
  const value = String(template || '');
  const count = value.split(COMPLETION_URL_TOKEN).length - 1;
  if (count !== 1) return `완료 규칙에는 ${COMPLETION_URL_TOKEN}이 정확히 1번 있어야 합니다.`;
  return '';
}

function statusLabel(status) {
  return ({
    running: '실행 중',
    paused: '일시정지',
    stopped: '중지',
    cooldown: '쿨다운',
    completed: '완료'
  })[status] || status || '중지';
}

function formatCooldown(ts) {
  if (!ts || ts <= Date.now()) return '없음';
  const sec = Math.ceil((ts - Date.now()) / 1000);
  if (sec < 60) return `${sec}초`;
  return `${Math.ceil(sec / 60)}분`;
}

function show(text) {
  els.message.textContent = text;
}
