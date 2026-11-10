/* Copyright (c) 2026 Sebrbo and contributors. Code: PolyForm Noncommercial 1.0.0; see LICENCE. */
(() => {
  'use strict';
  const Core = globalThis.PhysioTimerCore;
  const I18n = globalThis.PhysioTimerI18n;
  const Share = globalThis.PhysioTimerShare;
  const Qr = globalThis.PhysioTimerQr;
  const t = (key, params) => I18n.t(key, params);
  const $ = id => document.getElementById(id);
  const DEFAULT_CONFIGS = {
    tabata: { prep: 5, work: 20, rest: 10, rounds: 8, cycles: 1, cycleRest: 30, cooldown: 0 },
    rounds: { prep: 5, work: 60, rest: 30, rounds: 5, cycles: 1, cycleRest: 0, cooldown: 0 }
  };
  const DEFAULT_SETTINGS = { sound: true, volume: 50, soundType: 'beep', countdown: true, voice: false, vibration: false, wakeLock: true, language: 'auto' };
  const KEY = 'physiotimer-v1'; // Preserve stored presets across releases.
  function loadData() {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) || '{}');
      return { configs: { tabata: validOrDefault(saved.configs?.tabata, 'tabata'), rounds: validOrDefault(saved.configs?.rounds, 'rounds') }, settings: { ...DEFAULT_SETTINGS, ...(saved.settings || {}) }, presets: Array.isArray(saved.presets) ? saved.presets.slice(0, 60) : [] };
    } catch { return { configs: structuredClone(DEFAULT_CONFIGS), settings: { ...DEFAULT_SETTINGS }, presets: [] }; }
  }
  function validOrDefault(value, mode) {
    try { return Core.validateConfig(value, mode); } catch { return { ...DEFAULT_CONFIGS[mode] }; }
  }
  const data = loadData();
  I18n.setLang(data.settings.language);
  const saveData = () => { try { localStorage.setItem(KEY, JSON.stringify(data)); } catch { /* Storage may be disabled. */ } };
  let currentMode = 'tabata';
  let sharedProgram = null; // URL sessions stay in memory until the user explicitly saves them.
  let activeShareSvg = ''; 
  let plan = Core.buildSegments(data.configs.tabata, 'tabata');
  let elapsedMs = 0, startedAt = 0, running = false, finished = false, lastSegmentIndex = -1, lastCountSound = '';
  let clockHandle = null, audioCtx = null, wakeLock = null;
  let stopwatchMs = 0, stopwatchStartedAt = 0, stopwatchRunning = false, lastLapMs = 0, laps = [];
  const COLORS = { prep: '#f0b35c', work: '#19d3eb', rest: '#7045b5', cycleRest: '#7953b9', cooldown: '#9ac8ee', done: '#3fc9d9' };
  const labels = () => ({ prep: t('phasePrepare'), work: t('phaseWork'), rest: t('phaseRest'), cycleRest: t('phaseCycleRest'), cooldown: t('phaseCooldown'), done: t('phaseDone') });
  const audioConstructor = globalThis.AudioContext || globalThis.webkitAudioContext;
  const clock = () => performance.now();
  function timelineElapsed() { return running ? Math.min(plan.totalMs, elapsedMs + clock() - startedAt) : elapsedMs; }
  function stopwatchElapsed() { return stopwatchRunning ? stopwatchMs + clock() - stopwatchStartedAt : stopwatchMs; }
  function setTheme(kind) { $('phasePanel').dataset.phase = kind; }
  function announcement(msg) { $('liveAnnouncement').textContent = msg; }
  function renderTimer(triggerEvents = false) {
    const state = Core.locate(plan, timelineElapsed());
    const kind = state.done ? 'done' : state.segment.kind;
    const segment = state.segment;
    setTheme(kind);
    $('phaseLabel').textContent = labels()[kind];
    $('phaseTime').textContent = state.done ? '00:00' : Core.formatTime(state.remainingMs / 1000);
    $('totalRemaining').textContent = Core.formatTime(state.totalRemainingMs / 1000);
    $('roundsLeft').textContent = state.roundsLeft;
    $('cyclesLeft').textContent = state.cyclesLeft;
    $('phaseProgressBar').style.width = `${Math.round(state.progress * 1000) / 10}%`;
    $('phaseProgressLabel').textContent = state.done ? t('sessionFinished') : t('roundCycle', {round: Math.min(segment.round || 1, plan.config.rounds), rounds:plan.config.rounds, cycle:segment.cycle || 1,cycles:plan.config.cycles});
    $('cyclesCaption').innerHTML = t('cyclesLeftCaption');
    $('roundsCaption').innerHTML = t('roundsLeftCaption');
    const next = state.done ? null : plan.segments[state.index + 1];
    $('nextLabel').textContent = next ? t('next') + labels()[next.kind] : t('endOfSession');
    $('nextDuration').textContent = next ? Core.formatTime(next.durationMs / 1000) : '✓';
    document.querySelector('.next-dot').style.backgroundColor = next ? COLORS[next.kind] : COLORS.done;
    $('playIcon').textContent = running ? 'Ⅱ' : finished ? '↻' : '▶';
    $('playButton').classList.toggle('is-running', running);
    $('playButton').setAttribute('aria-label', running ? t('pause') : finished ? t('restart') : elapsedMs > 0 ? t('resume') : t('start'));
    $('playCaption').textContent = running ? t('pause').toUpperCase() : finished ? t('restart').toUpperCase() : elapsedMs > 0 ? t('resume').toUpperCase() : t('start').toUpperCase();
    if (triggerEvents && running) {
      if (state.done) { finishTimer(); return; }
      if (state.index !== lastSegmentIndex) {
        lastSegmentIndex = state.index;
        lastCountSound = '';
        if (state.index > 0 || elapsedMs === 0) notifyPhase(kind);
        announcement(labels()[kind]);
      }
      const secondsLeft = Math.ceil(state.remainingMs / 1000);
      const beepToken = `${state.index}:${secondsLeft}`;
      if (data.settings.countdown && secondsLeft <= 3 && secondsLeft >= 1 && lastCountSound !== beepToken) {
        lastCountSound = beepToken; tone(660, 0.09);
      }
    }
  }
  function stopClock() { if (clockHandle !== null) { clearInterval(clockHandle); clockHandle = null; } }
  function scheduleClock() { stopClock(); clockHandle = setInterval(() => { if (running) renderTimer(true); if (stopwatchRunning) renderStopwatch(); }, 80); }
  async function keepAwake() {
    if (!data.settings.wakeLock || !('wakeLock' in navigator) || !document.visibilityState || document.visibilityState !== 'visible') return;
    try { wakeLock = await navigator.wakeLock.request('screen'); } catch { /* Permission or compatibility */ }
  }
  function releaseWake() { if (wakeLock) { wakeLock.release().catch(() => {}); wakeLock = null; } }
  function unlockAudio() {
    if (!data.settings.sound || !audioConstructor) return;
    try { audioCtx ||= new audioConstructor(); if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {}); } catch { /* Not available */ }
  }
  function tone(freq, duration, bell = false) {
    if (!data.settings.sound || !audioConstructor || !data.settings.volume) return;
    try {
      unlockAudio();
      if (!audioCtx || audioCtx.state !== 'running') return;
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator(), gain = audioCtx.createGain();
      osc.type = bell || data.settings.soundType === 'bell' ? 'sine' : 'square';
      osc.frequency.setValueAtTime(freq, now);
      const level = (Number(data.settings.volume) / 100) * 0.15;
      gain.gain.setValueAtTime(Math.max(.0001, level), now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
      osc.connect(gain).connect(audioCtx.destination);
      osc.start(now); osc.stop(now + duration);
    } catch { /* Keep silent on unsupported browsers. */ }
  }
  function notifyPhase(kind) {
    tone(kind === 'rest' ? 420 : kind === 'work' ? 880 : 620, .32, kind === 'done');
    if (data.settings.vibration && navigator.vibrate) navigator.vibrate(kind === 'work' ? [100, 80, 100] : 150);
    if (data.settings.voice && 'speechSynthesis' in globalThis) {
      const words = { prep: t('voicePrepare'), work: t('exercise'), rest: t('rest'), cycleRest: t('restCycles'), cooldown: t('cooldown'), done: t('sessionFinished') };
      try { speechSynthesis.cancel(); const speech = new SpeechSynthesisUtterance(words[kind]); speech.lang = I18n.language() === 'en' ? 'en-US' : 'fr-FR'; speech.rate = .95; speech.volume = Number(data.settings.volume) / 100; speechSynthesis.speak(speech); } catch { /* Optional voice */ }
    }
  }
  function startTimer() {
    if (running) return;
    if (finished) { elapsedMs = 0; finished = false; lastSegmentIndex = -1; lastCountSound = ''; }
    unlockAudio(); startedAt = clock(); running = true; keepAwake(); scheduleClock(); renderTimer(true);
  }
  function pauseTimer() {
    if (!running) return;
    elapsedMs = timelineElapsed(); running = false; stopClock(); releaseWake(); renderTimer();
    if ('speechSynthesis' in globalThis) speechSynthesis.cancel();
  }
  function finishTimer() {
    running = false; finished = true; elapsedMs = plan.totalMs;
    stopClock(); releaseWake(); notifyPhase('done'); announcement(t('sessionFinished')); renderTimer();
  }
  function resetTimer() {
    running = false; finished = false; elapsedMs = 0; lastSegmentIndex = -1; lastCountSound = '';
    stopClock(); releaseWake(); if ('speechSynthesis' in globalThis) speechSynthesis.cancel(); renderTimer();
  }
  function currentConfig() {
    return sharedProgram && sharedProgram.mode === currentMode ? sharedProgram.config : data.configs[currentMode];
  }
  function discardSharedSession() {
    if (!sharedProgram) return;
    sharedProgram = null;
    $('sharedNotice').hidden = true;
    const url = new URL(location.href);
    url.searchParams.delete('pt');
    try { history.replaceState(null, '', url.pathname + url.search + url.hash); } catch { /* Some embedded or opaque-origin previews disallow history edits. */ }
  }
  function setMode(mode) {
    if (mode === currentMode) return; // Keep ongoing session when current tab is tapped again.
    discardSharedSession();
    if (running) pauseTimer();
    if (stopwatchRunning) pauseStopwatch();
    currentMode = mode;
    const isTimer = mode === 'tabata' || mode === 'rounds';
    $('timerView').hidden = !isTimer;
    $('stopwatchView').hidden = mode !== 'stopwatch';
    $('presetsView').hidden = mode !== 'presets';
    $('headerInfo').hidden = mode === 'presets';
    $('modeTitle').textContent = mode === 'tabata' ? 'TABATA' : mode === 'rounds' ? 'ROUNDS' : t('navStopwatch');
    document.querySelectorAll('.nav-button').forEach(el => { const selected = el.dataset.mode === mode; el.classList.toggle('is-selected', selected); el.setAttribute('aria-current', selected ? 'page' : 'false'); });
    if (isTimer) { plan = Core.buildSegments(currentConfig(), mode); resetTimer(); }
    if (mode === 'stopwatch') { $('totalRemaining').textContent = ''; renderStopwatch(); }
    if (mode === 'presets') renderPresets();
  }
  function openDialog(id) { $(id).showModal(); }
  function closeDialog(id) { $(id).close(); }
  const durationFields = ['prep','work','rest','cycleRest','cooldown'];
  function getFormConfig() {
    const form = $('configForm');
    const raw = {};
    // Minutes and seconds are separate controls so the colon remains visible during editing.
    durationFields.forEach(field => {
      const minsText = form.elements.namedItem(`${field}Min`).value.trim();
      const secsText = form.elements.namedItem(`${field}Sec`).value.trim();
      const valid = /^\d{1,3}$/.test(minsText) && /^\d{1,2}$/.test(secsText);
      const minutes = Number(minsText), seconds = Number(secsText);
      raw[field] = valid && minutes <= 600 && seconds < 60 ? minutes * 60 + seconds : NaN;
    });
    raw.rounds = Number(form.elements.namedItem('rounds').value);
    raw.cycles = currentMode === 'tabata' ? Number(form.elements.namedItem('cycles').value) : 1;
    return Core.validateConfig(raw, currentMode);
  }
  function configPreview() {
    try { $('configTotal').textContent = Core.formatTime(Core.buildSegments(getFormConfig(), currentMode).totalMs / 1000); $('configError').textContent = ''; }
    catch { $('configTotal').textContent = '—'; }
  }
  function editConfig() {
    if (running) pauseTimer();
    const c = currentConfig();
    $('configTitle').textContent = currentMode.toUpperCase();
    $('tabataFields').hidden = currentMode !== 'tabata';
    $('configForm').elements.namedItem('cycles').required = currentMode === 'tabata';
    durationFields.forEach(field => {
      $('configForm').elements.namedItem(`${field}Min`).value = String(Math.floor(c[field] / 60)).padStart(2, '0');
      $('configForm').elements.namedItem(`${field}Sec`).value = String(c[field] % 60).padStart(2, '0');
    });
    $('configForm').elements.namedItem('rounds').value = c.rounds;
    $('configForm').elements.namedItem('cycles').value = c.cycles;
    $('configError').textContent = ''; configPreview(); openDialog('configDialog');
  }
  function saveConfig(event) {
    event.preventDefault();
    try {
      const updated = getFormConfig();
      if (sharedProgram && sharedProgram.mode === currentMode) sharedProgram.config = updated;
      else { data.configs[currentMode] = updated; saveData(); }
      plan = Core.buildSegments(currentConfig(), currentMode); resetTimer(); closeDialog('configDialog');
    } catch (err) { $('configError').textContent = I18n.language()==='en' ? t('invalidConfig') : (err.message || t('invalidConfig')); }
  }
  function renderSettings() {
    const s = data.settings;
    $('settingSound').checked = s.sound; $('settingVolume').value = s.volume; $('settingSoundType').value = s.soundType;
    $('settingCountdown').checked = s.countdown; $('settingVoice').checked = s.voice; $('settingVibration').checked = s.vibration; $('settingWakeLock').checked = s.wakeLock; $('settingLanguage').value = s.language || 'auto';
  }
  function setSettings() {
    data.settings = {
      sound: $('settingSound').checked, volume: Number($('settingVolume').value), soundType: $('settingSoundType').value,
      countdown: $('settingCountdown').checked, voice: $('settingVoice').checked, vibration: $('settingVibration').checked, wakeLock: $('settingWakeLock').checked, language: $('settingLanguage').value
    };
    saveData(); if (!data.settings.wakeLock) releaseWake();
    I18n.setLang(data.settings.language); I18n.translatePage();
    if (currentMode === 'stopwatch') $('modeTitle').textContent = t('navStopwatch');
    renderTimer(); renderStopwatch(); if (currentMode === 'presets') renderPresets();
  }
  function openSave() {
    const c = currentConfig();
    $('presetName').value = `${currentMode === 'tabata' ? 'Tabata' : 'Rounds'} ${Core.formatTime(c.work)}/${Core.formatTime(c.rest)} · ${c.rounds} rounds`;
    openDialog('saveDialog'); $('presetName').focus(); $('presetName').select();
  }
  function savePreset(event) {
    event.preventDefault();
    const name = $('presetName').value.trim();
    if (!name) return;
    data.presets.unshift({ id: globalThis.crypto?.randomUUID?.() || String(Date.now()), name, mode: currentMode, config: { ...currentConfig() } });
    data.presets = data.presets.slice(0, 60); saveData(); closeDialog('saveDialog'); announcement(t('presetSaved'));
  }
  function sessionSummary(mode, config) {
    const c = Core.validateConfig(config, mode);
    const d = Core.formatTime;
    const details = [
      [t('shareMode'), mode.toUpperCase()],
      [t('shareWork'), d(c.work)],
      [t('shareRest'), d(c.rest)],
      [t('shareRounds'), String(c.rounds)]
    ];
    if (mode === 'tabata') details.push([t('shareCycles'), String(c.cycles)]);
    details.push([t('shareTotal'), d(Core.buildSegments(c, mode).totalMs / 1000)]);
    return details;
  }
  function fillSummary(container, mode, config) {
    container.replaceChildren();
    for (const [label, value] of sessionSummary(mode, config)) {
      const row = document.createElement('div');
      const key = document.createElement('span'); key.textContent = label;
      const val = document.createElement('strong'); val.textContent = value;
      row.append(key, val); container.append(row);
    }
  }
  function openShare(mode, config) {
    // The link contains only numeric timing data. Preset names never appear in it.
    try {
      const url = Share.makeUrl(mode, config, location.href);
      activeShareSvg = Qr.createSvg(url);
      $('shareQr').innerHTML = activeShareSvg;
      $('shareUrl').value = url;
      $('shareStatus').textContent = '';
      fillSummary($('shareSummary'), mode, config);
      openDialog('shareDialog');
    } catch { announcement(t('shareError')); }
  }
  async function copyShareUrl() {
    const value = $('shareUrl').value;
    let copied = false;
    try {
      if (navigator.clipboard?.writeText) { await navigator.clipboard.writeText(value); copied = true; }
    } catch { /* Clipboard permission denied; fall back to selecting text. */ }
    if (!copied) {
      const input = $('shareUrl'); input.focus(); input.select();
      try { copied = document.execCommand('copy'); } catch { /* Manual copy remains possible. */ }
    }
    $('shareStatus').textContent = copied ? t('linkCopied') : t('manualCopy');
  }
  function downloadShareQr() {
    if (!activeShareSvg) return;
    const file = new Blob([activeShareSvg], { type: 'image/svg+xml;charset=utf-8' });
    const fileUrl = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = fileUrl; a.download = 'PhysioTimer-QR.svg';
    document.body.appendChild(a); a.click(); a.remove();
    // Revocation is delayed so Safari has time to complete the download.
    setTimeout(() => URL.revokeObjectURL(fileUrl), 3000);
  }
  function receiveSharedProgram() {
    const url = new URL(location.href);
    if (!url.searchParams.has('pt')) return;
    const incoming = Share.decode(url.searchParams.get('pt'));
    if (!incoming) {
      $('receivedTitle').textContent = t('invalidSharedLink');
      $('receivedIntro').textContent = t('invalidSharedHelp');
      $('receivedSummary').hidden = true;
      $('receivedPrivacy').hidden = true;
      $('receivedStartButton').hidden = true;
      $('receivedViewButton').textContent = t('close');
      openDialog('receivedDialog');
      return;
    }
    if (incoming.mode !== currentMode) setMode(incoming.mode);
    sharedProgram = { mode: incoming.mode, config: { ...incoming.config } };
    plan = Core.buildSegments(currentConfig(), currentMode);
    resetTimer();
    $('sharedNotice').hidden = false;
    fillSummary($('receivedSummary'), incoming.mode, incoming.config);
    openDialog('receivedDialog');
  }
  function startSharedSession() {
    closeDialog('receivedDialog');
    startTimer(); // User click unlocks audio on mobile browsers.
  }
  function renderPresets() {
    const list = $('presetsList'); list.replaceChildren();
    if (!data.presets.length) { const el = document.createElement('div'); el.className = 'preset-empty'; el.textContent = t('emptyPresets'); list.append(el); return; }
    for (const entry of data.presets) {
      const c = validOrDefault(entry.config, entry.mode === 'rounds' ? 'rounds' : 'tabata');
      const card = document.createElement('article'); card.className = 'preset-card';
      const info = document.createElement('div'); const name = document.createElement('b'); name.textContent = entry.name;
      const detail = document.createElement('p'); detail.textContent = `${entry.mode.toUpperCase()} · ${c.rounds} rounds · ${Core.formatTime(c.work)} / ${Core.formatTime(c.rest)} · ${Core.formatTime(Core.buildSegments(c,entry.mode).totalMs/1000)}`;
      info.append(name,detail);
      const actions = document.createElement('div'); actions.className = 'preset-card-actions';
      const load = document.createElement('button'); load.type='button'; load.textContent=t('load'); load.setAttribute('aria-label',t('loadPreset', {name:entry.name}));
      load.addEventListener('click', () => { const mode = entry.mode === 'rounds' ? 'rounds' : 'tabata'; data.configs[mode] = c; saveData(); setMode(mode); });
      const share = document.createElement('button'); share.type='button'; share.textContent=t('share'); share.className='preset-share';
      share.setAttribute('aria-label',t('sharePreset', {name:entry.name}));
      share.addEventListener('click', () => openShare(entry.mode, c));
      const remove = document.createElement('button'); remove.type='button'; remove.textContent='✕'; remove.setAttribute('aria-label',t('deletePreset', {name:entry.name}));
      remove.addEventListener('click', () => { if (!confirm(t('confirmDelete', {name:entry.name}))) return; data.presets=data.presets.filter(p=>p.id!==entry.id); saveData(); renderPresets(); });
      actions.append(load,share,remove); card.append(info,actions); list.append(card);
    }
  }
  function formatStopwatch(ms) {
    const whole = Math.max(0, Math.floor(ms / 100)), tenths = whole % 10;
    return Core.formatTime(Math.floor(whole / 10)) + '.' + tenths;
  }
  function renderStopwatch() { $('stopwatchTime').textContent = formatStopwatch(stopwatchElapsed()); $('stopwatchPlay').textContent = stopwatchRunning ? 'Ⅱ' : '▶'; $('stopwatchPlay').setAttribute('aria-label', stopwatchRunning ? t('pause') : t('start')); }
  function startStopwatch() { unlockAudio(); keepAwake(); stopwatchStartedAt = clock(); stopwatchRunning = true; scheduleClock(); renderStopwatch(); }
  function pauseStopwatch() { if (!stopwatchRunning) return; stopwatchMs=stopwatchElapsed(); stopwatchRunning=false; stopClock(); releaseWake(); renderStopwatch(); }
  function resetStopwatch() { pauseStopwatch(); stopwatchMs=0; lastLapMs=0; laps=[]; $('lapList').replaceChildren(); renderStopwatch(); }
  function addLap() {
    if (!stopwatchRunning) return;
    const current=stopwatchElapsed(), lap=current-lastLapMs; lastLapMs=current; laps.unshift({number:laps.length+1,time:lap,total:current});
    const list=$('lapList'); list.replaceChildren();
    laps.forEach(entry=>{const item=document.createElement('li'); const name=document.createElement('span');name.textContent=t('lapN', {n:entry.number});const time=document.createElement('b');time.textContent=`${formatStopwatch(entry.time)} / ${formatStopwatch(entry.total)}`;item.append(name,time);list.append(item);});
  }
  function registerEvents() {
    $('playButton').addEventListener('click', () => running ? pauseTimer() : startTimer());
    $('resetButton').addEventListener('click', resetTimer);
    $('editProgramButton').addEventListener('click', editConfig);
    $('savePresetButton').addEventListener('click', openSave);
    $('shareProgramButton').addEventListener('click', () => openShare(currentMode, currentConfig()));
    $('saveSharedButton').addEventListener('click', openSave);
    $('copyShareButton').addEventListener('click', copyShareUrl);
    $('downloadQrButton').addEventListener('click', downloadShareQr);
    $('receivedViewButton').addEventListener('click', () => {
      closeDialog('receivedDialog');
      if (!sharedProgram) {
        const url = new URL(location.href);
        url.searchParams.delete('pt');
        try { history.replaceState(null, '', url.pathname + url.search + url.hash); } catch { /* Preview frame. */ }
      }
    });
    $('receivedStartButton').addEventListener('click', startSharedSession);
    $('configForm').addEventListener('submit', saveConfig);
    // Select an entire number when tapped; normalize to two digits on leaving the field.
    document.querySelectorAll('.duration-entry input').forEach(input => {
      input.addEventListener('focus', () => input.select());
      input.addEventListener('click', () => input.select());
      input.addEventListener('input', () => {
        const maxLength = input.name.endsWith('Min') ? 3 : 2;
        const sanitized = input.value.replace(/\D/g, '').slice(0, maxLength);
        if (input.value !== sanitized) input.value = sanitized;
      });
      input.addEventListener('blur', () => {
        if (input.value) input.value = input.value.padStart(2, '0');
      });
    });
    $('configForm').addEventListener('input', configPreview);
    $('saveForm').addEventListener('submit', savePreset);
    $('settingsButton').addEventListener('click', () => { renderSettings(); openDialog('settingsDialog'); });
    ['settingSound','settingVolume','settingSoundType','settingCountdown','settingVoice','settingVibration','settingWakeLock','settingLanguage'].forEach(id=>$(id).addEventListener('change',setSettings));
    document.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click',() => closeDialog(button.dataset.close)));
    document.querySelectorAll('.nav-button').forEach(button=>button.addEventListener('click',()=>setMode(button.dataset.mode)));
    $('fullscreenButton').addEventListener('click',async()=>{
      try { if(document.fullscreenElement) await document.exitFullscreen(); else if(document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen(); else announcement(t('fullscreenUnavailable')); }
      catch { announcement(t('fullscreenUnavailable')); }
    });
    $('stopwatchPlay').addEventListener('click',()=>stopwatchRunning?pauseStopwatch():startStopwatch());
    $('stopwatchReset').addEventListener('click',resetStopwatch);
    $('stopwatchLap').addEventListener('click',addLap);
    document.addEventListener('visibilitychange',()=>{
      if (document.visibilityState === 'visible') { if (running) { keepAwake(); renderTimer(true); } if (stopwatchRunning) { keepAwake(); renderStopwatch(); } }
      else releaseWake();
    });
    document.addEventListener('keydown', e=>{
      if (e.code !== 'Space' || document.querySelector('dialog[open]') || ['INPUT','TEXTAREA','BUTTON','SELECT'].includes(document.activeElement?.tagName)) return;
      e.preventDefault();
      if (currentMode==='tabata'||currentMode==='rounds') running?pauseTimer():startTimer();
      else if(currentMode==='stopwatch') stopwatchRunning?pauseStopwatch():startStopwatch();
    });
  }
  I18n.translatePage(); registerEvents(); renderTimer(); renderStopwatch(); receiveSharedProgram();
  if ('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('./service-worker.js').catch(()=>{});
})();
