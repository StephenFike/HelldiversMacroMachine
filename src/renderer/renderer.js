'use strict';

/* global window, document */

let boot = null;
let state = null;

// Library view state
let search = '';
let groupFilter = 'All';

// Modal state
let capture = { open: false, value: null, onConfirm: null };
let picker = { open: false, onPick: null, query: '' };
let editor = { open: false, id: null, code: '', recording: false };

const $ = (id) => document.getElementById(id);

// ---------------------------------------------------------------- helpers

/** Map a DOM KeyboardEvent to an Electron accelerator string. */
const CODE_TO_ACCEL = {
  ArrowUp: 'Up', ArrowDown: 'Down', ArrowLeft: 'Left', ArrowRight: 'Right',
  Space: 'Space', Tab: 'Tab', Backspace: 'Backspace', Enter: 'Return',
  Insert: 'Insert', Delete: 'Delete', Home: 'Home', End: 'End',
  PageUp: 'PageUp', PageDown: 'PageDown', CapsLock: 'Capslock',
  Minus: '-', Equal: '=', BracketLeft: '[', BracketRight: ']',
  Backslash: '\\', Semicolon: ';', Quote: "'", Comma: ',', Period: '.',
  Slash: '/', Backquote: '`',
  NumpadAdd: 'numadd', NumpadSubtract: 'numsub', NumpadMultiply: 'nummult',
  NumpadDivide: 'numdiv', NumpadDecimal: 'numdec',
  ScrollLock: 'Scrolllock', Pause: 'Pause', PrintScreen: 'PrintScreen'
};

function keyNameFromCode(code) {
  if (/^Key[A-Z]$/.test(code)) return code.slice(3);
  if (/^Digit\d$/.test(code)) return code.slice(5);
  if (/^F([1-9]|1\d|2[0-4])$/.test(code)) return code;
  if (/^Numpad\d$/.test(code)) return 'num' + code.slice(6);
  return CODE_TO_ACCEL[code] || null;
}

function accelFromEvent(event) {
  const key = keyNameFromCode(event.code);
  if (!key) return null; // modifier-only press: keep listening

  const parts = [];
  if (event.ctrlKey) parts.push('Control');
  if (event.altKey) parts.push('Alt');
  if (event.shiftKey) parts.push('Shift');
  if (event.metaKey) parts.push('Super');
  parts.push(key);
  return parts.join('+');
}

function prettyAccel(accel) {
  return String(accel || '')
    .replace(/CommandOrControl|CmdOrCtrl/g, 'Ctrl')
    .replace(/Control/g, 'Ctrl')
    .replace(/\+/g, ' + ');
}

function arrowsHtml(code) {
  return [...code]
    .map((c) => `<span>${boot.directionArrows[c] || '?'}</span>`)
    .join('');
}

function allMacros() {
  return [...boot.stratagems, ...state.config.customMacros];
}

function macroById(id) {
  return allMacros().find((m) => m.id === id) || null;
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}

/**
 * Swap the caption button between "maximise" and "restore".
 *
 * These are SVG elements, and `hidden` is an HTMLElement property — assigning
 * `svg.hidden = true` sets a plain JS property that reflects to nothing. The
 * attribute has to be toggled directly for the CSS to see it.
 */
function setMaximized(maximized) {
  $('iconMaximize').toggleAttribute('hidden', maximized);
  $('iconRestore').toggleAttribute('hidden', !maximized);
  $('winMaximize').title = maximized ? 'Restore' : 'Maximise';
  $('winMaximize').setAttribute('aria-label', maximized ? 'Restore' : 'Maximise');
}

function toast(kind, message) {
  const node = el('div', `toast ${kind}`, message);
  $('toasts').appendChild(node);
  setTimeout(() => node.remove(), 2600);
}

// ------------------------------------------------------------------ render

function render() {
  renderHeader();
  renderBanners();
  renderLoadout();
  renderLibrary();
}

function renderHeader() {
  const enabled = state.config.enabled;

  $('status').className = `status ${enabled ? 'on' : 'off'}`;
  $('statusText').textContent = enabled ? 'ARMED' : 'DISABLED';
  $('toggleBtn').textContent = enabled ? 'Disarm' : 'Arm macros';
  $('toggleHint').textContent = state.config.settings.toggleHotkey
    ? `or ${prettyAccel(state.config.settings.toggleHotkey)}`
    : '';
}

function renderBanners() {
  const inputBanner = $('inputBanner');
  if (boot.inputOk && !boot.inputOk.ok) {
    inputBanner.hidden = false;
    inputBanner.textContent =
      `Keyboard injection is not working: ${boot.inputOk.error} ` +
      'Macros will not reach the game until this is resolved.';
  } else {
    inputBanner.hidden = true;
  }

  const hotkeyBanner = $('hotkeyBanner');
  if (state.hotkeyErrors && state.hotkeyErrors.length) {
    hotkeyBanner.hidden = false;
    const list = state.hotkeyErrors
      .map((e) => `${prettyAccel(e.hotkey)}${e.label ? ` (${e.label})` : ''}`)
      .join(', ');
    hotkeyBanner.textContent =
      `Windows refused these hotkeys — another app already owns them: ${list}. Pick different combinations.`;
  } else {
    hotkeyBanner.hidden = true;
  }
}

function renderLoadout() {
  const list = $('bindingList');
  list.textContent = '';

  const bindings = state.config.bindings;
  $('bindingCount').textContent = `${bindings.length} hotkey${bindings.length === 1 ? '' : 's'}`;

  if (!bindings.length) {
    list.appendChild(el('div', 'empty-note', 'No hotkeys yet. Add one, or bind a stratagem from the list.'));
    return;
  }

  const failed = new Set((state.hotkeyErrors || []).map((e) => e.hotkey));

  bindings.forEach((binding, index) => {
    const macro = binding.macroId ? macroById(binding.macroId) : null;
    const row = el('div', 'binding');
    if (state.runningMacroId && macro && state.runningMacroId === macro.id) {
      row.classList.add('active');
    }

    const chip = el('button', 'hotkey-chip', prettyAccel(binding.hotkey));
    if (failed.has(binding.hotkey)) chip.classList.add('conflict');
    chip.title = 'Click to change this hotkey';
    chip.addEventListener('click', () => rebindHotkey(index));
    row.appendChild(chip);

    const body = el('div', 'binding-body');
    body.title = 'Click to change the stratagem';
    const name = el('div', `binding-name${macro ? '' : ' empty'}`, macro ? macro.name : 'No stratagem assigned');
    body.appendChild(name);

    if (macro) {
      const arrows = el('div', 'arrows');
      arrows.innerHTML = arrowsHtml(macro.code);
      body.appendChild(arrows);
    }

    body.addEventListener('click', () => openPicker((id) => {
      const next = state.config.bindings.map((b, i) => (i === index ? { ...b, macroId: id } : b));
      saveBindings(next);
    }));
    row.appendChild(body);

    const actions = el('div', 'binding-actions');

    const test = el('button', 'btn btn-icon btn-ghost', '▶');
    test.title = 'Run now (test)';
    test.disabled = !macro;
    test.addEventListener('click', () => runTest(binding.macroId));
    actions.appendChild(test);

    const remove = el('button', 'btn btn-icon btn-ghost', '✕');
    remove.title = 'Remove this hotkey';
    remove.addEventListener('click', () => {
      saveBindings(state.config.bindings.filter((_, i) => i !== index));
    });
    actions.appendChild(remove);

    row.appendChild(actions);
    list.appendChild(row);
  });
}

function renderGroupChips() {
  const chips = $('groupChips');
  chips.textContent = '';

  const groups = ['All', ...boot.groupOrder];
  if (state.config.customMacros.length) groups.push('Custom');

  for (const group of groups) {
    const chip = el('button', `chip${groupFilter === group ? ' on' : ''}`, group);
    chip.addEventListener('click', () => {
      groupFilter = group;
      renderLibrary();
    });
    chips.appendChild(chip);
  }
}

function renderLibrary() {
  renderGroupChips();

  const list = $('libraryList');
  list.textContent = '';

  const query = search.trim().toLowerCase();
  const boundIds = new Map();
  for (const binding of state.config.bindings) {
    if (binding.macroId && !boundIds.has(binding.macroId)) boundIds.set(binding.macroId, binding.hotkey);
  }

  const matches = allMacros().filter((macro) => {
    if (groupFilter !== 'All' && macro.group !== groupFilter) return false;
    if (!query) return true;
    return macro.name.toLowerCase().includes(query) ||
      (macro.unlock || '').toLowerCase().includes(query) ||
      macro.code.toLowerCase().includes(query);
  });

  $('libraryCount').textContent = `${matches.length} of ${allMacros().length}`;

  if (!matches.length) {
    list.appendChild(el('div', 'empty-note', 'Nothing matches that search.'));
    return;
  }

  const order = [...boot.groupOrder, 'Custom'];
  const byGroup = new Map();
  for (const macro of matches) {
    if (!byGroup.has(macro.group)) byGroup.set(macro.group, []);
    byGroup.get(macro.group).push(macro);
  }

  for (const group of order) {
    const items = byGroup.get(group);
    if (!items) continue;

    list.appendChild(el('div', 'group-label', group));

    for (const macro of items) {
      const row = el('div', 'strat');

      const info = el('div');
      info.appendChild(el('div', 'strat-name', macro.name));
      if (macro.unlock) info.appendChild(el('div', 'strat-unlock', macro.unlock));
      row.appendChild(info);

      const arrows = el('div', 'arrows');
      arrows.innerHTML = arrowsHtml(macro.code);
      row.appendChild(arrows);

      const actions = el('div', 'strat-actions');

      if (boundIds.has(macro.id)) {
        actions.appendChild(el('span', 'bound-flag', prettyAccel(boundIds.get(macro.id))));
        actions.style.opacity = '1';
      }

      const bind = el('button', 'btn btn-small btn-ghost', 'Bind');
      bind.title = 'Assign a hotkey to this stratagem';
      bind.addEventListener('click', () => bindMacro(macro.id, macro.name));
      actions.appendChild(bind);

      const test = el('button', 'btn btn-small btn-ghost', '▶');
      test.title = 'Run now (test)';
      test.addEventListener('click', () => runTest(macro.id));
      actions.appendChild(test);

      if (macro.custom) {
        const edit = el('button', 'btn btn-small btn-ghost', '✎');
        edit.title = 'Edit this macro';
        edit.addEventListener('click', () => openEditor(macro));
        actions.appendChild(edit);
      }

      row.appendChild(actions);
      list.appendChild(row);
    }
  }
}

// ------------------------------------------------------------------ actions

async function saveBindings(bindings) {
  state = await window.hmm.setBindings(bindings);
  render();
}

async function saveCustomMacros(macros) {
  state = await window.hmm.setCustomMacros(macros);
  render();
}

async function runTest(macroId) {
  if (!macroId) return;
  const result = await window.hmm.testMacro(macroId);
  if (!result.ok && result.reason === 'busy') toast('info', 'A macro is already running');
  if (!result.ok && result.reason === 'error') toast('error', result.error);
}

function bindMacro(macroId, macroName) {
  openCapture(`Hotkey for ${macroName}`, (accel) => {
    const existing = state.config.bindings.filter((b) => b.hotkey !== accel);
    saveBindings([...existing, { hotkey: accel, macroId }]);
    toast('success', `${prettyAccel(accel)} → ${macroName}`);
  });
}

function rebindHotkey(index) {
  const binding = state.config.bindings[index];
  const macro = binding.macroId ? macroById(binding.macroId) : null;

  openCapture(macro ? `Hotkey for ${macro.name}` : 'Choose a hotkey', (accel) => {
    // Map first so indices stay stable, then drop any *other* slot that was
    // using the same combination.
    const next = state.config.bindings
      .map((b, i) => (i === index ? { ...b, hotkey: accel } : b))
      .filter((b, i) => i === index || b.hotkey !== accel);
    saveBindings(next);
  });
}

function addBinding() {
  openCapture('Choose a hotkey', (accel) => {
    openPicker((macroId) => {
      const existing = state.config.bindings.filter((b) => b.hotkey !== accel);
      saveBindings([...existing, { hotkey: accel, macroId }]);
    });
  });
}

// ------------------------------------------------------- hotkey capture modal

function openCapture(title, onConfirm) {
  capture = { open: true, value: null, onConfirm };
  $('captureTitle').textContent = title;
  $('captureDisplay').textContent = '…';
  $('captureWarning').hidden = true;
  $('captureConfirm').disabled = true;
  $('captureModal').hidden = false;
}

function closeCapture() {
  capture = { open: false, value: null, onConfirm: null };
  $('captureModal').hidden = true;
}

function onCaptureKeydown(event) {
  event.preventDefault();
  event.stopPropagation();

  if (event.code === 'Escape') return closeCapture();

  const accel = accelFromEvent(event);
  if (!accel) return;

  capture.value = accel;
  $('captureDisplay').textContent = prettyAccel(accel);
  $('captureConfirm').disabled = false;

  const warning = $('captureWarning');
  const hasModifier = /Control|Alt|Shift|Super/.test(accel);
  const clash = state.config.bindings.find((b) => b.hotkey === accel);

  if (!hasModifier) {
    warning.hidden = false;
    warning.textContent =
      'No modifier — this key will be captured system-wide and stop working everywhere else.';
  } else if (clash) {
    const macro = clash.macroId ? macroById(clash.macroId) : null;
    warning.hidden = false;
    warning.textContent = `Already assigned to ${macro ? macro.name : 'another slot'} — it will be reassigned.`;
  } else {
    warning.hidden = true;
  }
}

// --------------------------------------------------------- macro picker modal

function openPicker(onPick) {
  picker = { open: true, onPick, query: '' };
  $('pickerSearch').value = '';
  $('pickerModal').hidden = false;
  renderPicker();
  $('pickerSearch').focus();
}

function closePicker() {
  picker = { open: false, onPick: null, query: '' };
  $('pickerModal').hidden = true;
}

function renderPicker() {
  const list = $('pickerList');
  list.textContent = '';

  const query = picker.query.trim().toLowerCase();
  const matches = allMacros()
    .filter((m) => !query || m.name.toLowerCase().includes(query))
    .slice(0, 300);

  for (const macro of matches) {
    const item = el('button', 'picker-item');
    item.appendChild(el('span', null, macro.name));

    const arrows = el('span', 'arrows');
    arrows.innerHTML = arrowsHtml(macro.code);
    item.appendChild(arrows);

    item.addEventListener('click', () => {
      const handler = picker.onPick;
      closePicker();
      if (handler) handler(macro.id);
    });

    list.appendChild(item);
  }
}

// ---------------------------------------------------- custom macro editor

function openEditor(macro) {
  editor = {
    open: true,
    id: macro ? macro.id : null,
    code: macro ? macro.code : '',
    recording: false
  };

  $('macroModalTitle').textContent = macro ? 'Edit macro' : 'New custom macro';
  $('macroName').value = macro ? macro.name : '';
  $('macroDelete').hidden = !macro;
  $('macroModal').hidden = false;
  renderSequence();
  $('macroName').focus();
}

function closeEditor() {
  editor = { open: false, id: null, code: '', recording: false };
  $('macroModal').hidden = true;
  $('recordNote').hidden = true;
  $('seqRecord').classList.remove('recording');
  $('seqRecord').textContent = '● Record keys';
}

function renderSequence() {
  const display = $('sequenceDisplay');
  display.textContent = '';

  if (!editor.code) {
    display.appendChild(el('span', 'ph', 'Empty — use the arrow buttons or record keys.'));
    return;
  }

  for (const dir of editor.code) {
    display.appendChild(el('span', 'step', boot.directionArrows[dir]));
  }
}

function appendDirection(dir) {
  if (editor.code.length >= 24) return;
  editor.code += dir;
  renderSequence();
}

function toggleRecording() {
  editor.recording = !editor.recording;
  $('recordNote').hidden = !editor.recording;
  $('seqRecord').classList.toggle('recording', editor.recording);
  $('seqRecord').textContent = editor.recording ? '■ Stop' : '● Record keys';
}

/** While recording, translate arrow keys / WASD / IJKL into directions. */
const RECORD_CODES = {
  ArrowUp: 'U', ArrowDown: 'D', ArrowLeft: 'L', ArrowRight: 'R',
  KeyW: 'U', KeyS: 'D', KeyA: 'L', KeyD: 'R',
  KeyI: 'U', KeyK: 'D', KeyJ: 'L', KeyL: 'R',
  Numpad8: 'U', Numpad2: 'D', Numpad4: 'L', Numpad6: 'R'
};

function onEditorKeydown(event) {
  if (!editor.recording) {
    if (event.code === 'Escape') {
      event.preventDefault();
      closeEditor();
    }
    return;
  }

  const dir = RECORD_CODES[event.code];
  if (dir) {
    event.preventDefault();
    appendDirection(dir);
    return;
  }

  if (event.code === 'Backspace') {
    event.preventDefault();
    editor.code = editor.code.slice(0, -1);
    renderSequence();
  } else if (event.code === 'Escape') {
    event.preventDefault();
    toggleRecording();
  }
}

async function saveEditor() {
  const name = $('macroName').value.trim();

  if (!name) return toast('error', 'Give the macro a name');
  if (!editor.code) return toast('error', 'The sequence is empty');

  const macros = [...state.config.customMacros];

  if (editor.id) {
    const index = macros.findIndex((m) => m.id === editor.id);
    if (index >= 0) macros[index] = { ...macros[index], name, code: editor.code };
  } else {
    macros.push({
      id: `custom-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
      name,
      code: editor.code,
      group: 'Custom',
      custom: true
    });
  }

  closeEditor();
  await saveCustomMacros(macros);
  toast('success', `Saved "${name}"`);
}

async function deleteEditorMacro() {
  if (!editor.id) return;

  const id = editor.id;
  closeEditor();

  // Drop the macro and any hotkey that pointed at it, so no hotkey is left
  // registered with nothing behind it.
  await saveCustomMacros(state.config.customMacros.filter((m) => m.id !== id));
  const orphaned = state.config.bindings.filter((b) => b.macroId === id);
  if (orphaned.length) {
    await saveBindings(state.config.bindings.filter((b) => b.macroId !== id));
  }
  toast('info', 'Macro deleted');
}

// ------------------------------------------------------------ settings modal

function fillSelect(select, choices, selected) {
  select.textContent = '';
  for (const name of choices) {
    const option = document.createElement('option');
    option.value = name;
    option.textContent = (boot.keys[name] && boot.keys[name].label) || name;
    if (name === selected) option.selected = true;
    select.appendChild(option);
  }
}

function openSettings() {
  const s = state.config.settings;

  fillSelect($('setStratagemKey'), boot.stratagemKeyChoices, s.stratagemKey);
  for (const dir of boot.directions) {
    fillSelect($(`setDir${dir}`), boot.directionKeyChoices, s.directions[dir]);
  }

  $('setStepDelay').value = s.stepDelayMs;
  $('setTapHold').value = s.tapHoldMs;
  $('setOpenDelay').value = s.openDelayMs;
  $('setCloseDelay').value = s.closeDelayMs;

  $('setToggleHotkey').textContent = prettyAccel(s.toggleHotkey) || 'Not set';
  $('setAbortHotkey').textContent = prettyAccel(s.abortHotkey) || 'Not set';

  $('setReleaseMods').checked = s.releaseTriggerModifiers;
  $('setMinimizeToTray').checked = s.minimizeToTray;
  $('setStartMinimized').checked = s.startMinimized;

  $('configPath').textContent = boot.configPath;
  $('settingsModal').hidden = false;
}

async function patchSettings(patch) {
  state = await window.hmm.updateSettings(patch);
  render();
  return state;
}

function wireSettings() {
  $('setStratagemKey').addEventListener('change', (e) =>
    patchSettings({ stratagemKey: e.target.value }));

  for (const dir of ['U', 'D', 'L', 'R']) {
    $(`setDir${dir}`).addEventListener('change', async (e) => {
      const directions = { ...state.config.settings.directions, [dir]: e.target.value };
      await patchSettings({ directions });
    });
  }

  const numberFields = [
    ['setStepDelay', 'stepDelayMs'],
    ['setTapHold', 'tapHoldMs'],
    ['setOpenDelay', 'openDelayMs'],
    ['setCloseDelay', 'closeDelayMs']
  ];

  for (const [id, key] of numberFields) {
    $(id).addEventListener('change', async (e) => {
      await patchSettings({ [key]: e.target.value });
      // Echo back the clamped value so the field can't show a rejected number.
      e.target.value = state.config.settings[key];
    });
  }

  $('setToggleHotkey').addEventListener('click', () => {
    openCapture('Hotkey to arm / disarm', async (accel) => {
      await patchSettings({ toggleHotkey: accel });
      $('setToggleHotkey').textContent = prettyAccel(accel);
    });
  });

  $('setAbortHotkey').addEventListener('click', () => {
    openCapture('Hotkey to abort a running macro', async (accel) => {
      await patchSettings({ abortHotkey: accel });
      $('setAbortHotkey').textContent = prettyAccel(accel);
    });
  });

  $('setReleaseMods').addEventListener('change', (e) =>
    patchSettings({ releaseTriggerModifiers: e.target.checked }));
  $('setMinimizeToTray').addEventListener('change', (e) =>
    patchSettings({ minimizeToTray: e.target.checked }));
  $('setStartMinimized').addEventListener('change', (e) =>
    patchSettings({ startMinimized: e.target.checked }));

  $('openConfigBtn').addEventListener('click', () => window.hmm.openConfigFolder());

  $('resetBtn').addEventListener('click', async () => {
    if (!window.confirm('Reset every hotkey, custom macro and setting to defaults?')) return;
    state = await window.hmm.resetConfig();
    render();
    openSettings();
    toast('info', 'Reset to defaults');
  });

  $('settingsClose').addEventListener('click', () => { $('settingsModal').hidden = true; });
}

// -------------------------------------------------------------------- wiring

function wire() {
  $('toggleBtn').addEventListener('click', async () => {
    state = await window.hmm.setEnabled(!state.config.enabled);
    render();
  });

  $('settingsBtn').addEventListener('click', openSettings);

  $('winMinimize').addEventListener('click', () => window.hmm.minimizeWindow());
  $('winMaximize').addEventListener('click', async () => {
    setMaximized(await window.hmm.toggleMaximizeWindow());
  });
  $('winClose').addEventListener('click', () => window.hmm.closeWindow());

  $('addBindingBtn').addEventListener('click', addBinding);
  $('newMacroBtn').addEventListener('click', () => openEditor(null));
  $('abortBtn').addEventListener('click', () => window.hmm.abort());

  $('search').addEventListener('input', (e) => {
    search = e.target.value;
    renderLibrary();
  });

  // Capture modal
  $('captureCancel').addEventListener('click', closeCapture);
  $('captureConfirm').addEventListener('click', () => {
    const { value, onConfirm } = capture;
    closeCapture();
    if (value && onConfirm) onConfirm(value);
  });

  // Picker modal
  $('pickerCancel').addEventListener('click', closePicker);
  $('pickerSearch').addEventListener('input', (e) => {
    picker.query = e.target.value;
    renderPicker();
  });

  // Macro editor
  for (const btn of document.querySelectorAll('.btn-dir')) {
    btn.addEventListener('click', () => appendDirection(btn.dataset.dir));
  }
  $('seqBackspace').addEventListener('click', () => {
    editor.code = editor.code.slice(0, -1);
    renderSequence();
  });
  $('seqClear').addEventListener('click', () => {
    editor.code = '';
    renderSequence();
  });
  $('seqRecord').addEventListener('click', toggleRecording);
  $('macroCancel').addEventListener('click', closeEditor);
  $('macroSave').addEventListener('click', saveEditor);
  $('macroDelete').addEventListener('click', deleteEditorMacro);

  wireSettings();

  // Global keys. The capture modal gets first refusal so it can swallow the
  // very combinations these shortcuts would otherwise act on.
  window.addEventListener('keydown', (event) => {
    if (capture.open) return onCaptureKeydown(event);
    if (editor.open) return onEditorKeydown(event);

    if (event.code === 'Escape') {
      if (!$('pickerModal').hidden) return closePicker();
      if (!$('settingsModal').hidden) { $('settingsModal').hidden = true; return; }
    }

    if (event.code === 'KeyF' && event.ctrlKey) {
      event.preventDefault();
      $('search').focus();
      $('search').select();
    }
  }, true);

  // Click the dimmed area to dismiss.
  for (const id of ['pickerModal', 'settingsModal', 'macroModal']) {
    $(id).addEventListener('mousedown', (event) => {
      if (event.target !== $(id)) return;
      if (id === 'pickerModal') closePicker();
      else if (id === 'macroModal') closeEditor();
      else $(id).hidden = true;
    });
  }
}

// ------------------------------------------------------------------ startup

async function init() {
  boot = await window.hmm.bootstrap();
  state = boot.state;

  $('version').textContent = `v${boot.appVersion}`;

  wire();
  render();
  setMaximized(boot.maximized);

  window.hmm.onWindowState(({ maximized }) => setMaximized(maximized));

  window.hmm.onState((next) => {
    state = next;
    render();
  });

  window.hmm.onToast(({ kind, message }) => toast(kind, message));

  window.hmm.onRunState((run) => {
    const status = $('runStatus');
    const fill = $('runProgress');

    // Abort is only reachable from here while testing a macro in the app; in
    // game the hotkey does the job, so an always-visible button is just noise.
    $('abortBtn').hidden = !run.running;

    if (run.running) {
      status.className = 'run-status active';
      status.textContent = `${run.macroName} — input ${run.step}/${run.total}`;
      fill.style.width = `${(run.step / Math.max(1, run.total)) * 100}%`;
      state.runningMacroId = run.macroId;
    } else {
      status.className = 'run-status';
      if (run.error) status.textContent = `Failed: ${run.error}`;
      else if (run.aborted) status.textContent = `Aborted: ${run.macroName}`;
      else if (run.completed) status.textContent = `Sent: ${run.macroName}`;
      else status.textContent = 'Idle';

      fill.style.width = '0%';
      state.runningMacroId = null;
    }

    renderLoadout();
  });
}

init();
