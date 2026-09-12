'use strict';

const path = require('path');
const { app, BrowserWindow, Tray, Menu, globalShortcut, ipcMain, nativeImage, shell } = require('electron');

const { Store } = require('./store');
const { MacroRunner } = require('./macro-runner');
const { drawIconBGRA } = require('./icon');
const input = require('./input');
const { STRATAGEMS, GROUP_ORDER } = require('../shared/stratagems');
const {
  KEYS, STRATAGEM_KEY_CHOICES, DIRECTION_KEY_CHOICES,
  DIRECTIONS, DIRECTION_LABELS, DIRECTION_ARROWS
} = require('../shared/keymap');

let store;
let runner;
let mainWindow = null;
let tray = null;
let quitting = false;

/** Hotkeys we asked Windows for but did not get — surfaced in the UI. */
let hotkeyErrors = [];

// ---------------------------------------------------------------- utilities

function makeIcon(size) {
  return nativeImage.createFromBitmap(drawIconBGRA(size), { width: size, height: size });
}

/**
 * Electron accelerators name modifiers generically ("Control"); the injector
 * needs a concrete key. Windows hotkeys fire on either side, and the left-hand
 * keys are what a player's hand is actually on.
 */
const MODIFIER_TO_KEY = {
  Control: 'LeftControl',
  Ctrl: 'LeftControl',
  CommandOrControl: 'LeftControl',
  CmdOrCtrl: 'LeftControl',
  Shift: 'LeftShift',
  Alt: 'LeftAlt',
  Option: 'LeftAlt',
  AltGr: 'RightAlt'
};

function modifierKeysOf(accelerator) {
  return String(accelerator || '')
    .split('+')
    .map((part) => MODIFIER_TO_KEY[part.trim()])
    .filter(Boolean);
}

function send(channel, payload) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send(channel, payload);
  }
}

function pushState() {
  send('state', buildState());
}

function buildState() {
  return {
    config: store.data,
    running: runner.isRunning,
    runningMacroId: runner.current ? runner.current.macro.id : null,
    hotkeyErrors
  };
}

// ------------------------------------------------------------------ hotkeys

function runMacroFor(binding) {
  const macro = store.allMacros().get(binding.macroId);
  if (!macro) return;

  // Pressing a macro hotkey mid-run cancels it. A 380mm barrage is 7 inputs
  // and ~3 seconds; being able to bail out matters more than queueing.
  if (runner.isRunning) {
    runner.abort();
    return;
  }

  const held = store.data.settings.releaseTriggerModifiers
    ? modifierKeysOf(binding.hotkey)
    : [];

  runner.run(macro, store.data.settings, held).then((result) => {
    if (!result.ok && result.reason === 'error') {
      send('toast', { kind: 'error', message: result.error });
    }
  });
}

function registerHotkeys() {
  globalShortcut.unregisterAll();
  hotkeyErrors = [];

  const settings = store.data.settings;
  const register = (accelerator, handler, label) => {
    if (!accelerator) return;
    try {
      if (!globalShortcut.register(accelerator, handler)) {
        hotkeyErrors.push({ hotkey: accelerator, label });
      }
    } catch (err) {
      hotkeyErrors.push({ hotkey: accelerator, label, error: err.message });
    }
  };

  // The master toggle and abort stay live even while macros are disabled —
  // otherwise there would be no way to switch back on from the keyboard.
  register(settings.toggleHotkey, () => setEnabled(!store.data.enabled), 'Master toggle');
  register(settings.abortHotkey, () => {
    if (runner.abort()) send('toast', { kind: 'info', message: 'Macro aborted' });
  }, 'Abort');

  if (store.data.enabled) {
    for (const binding of store.data.bindings) {
      if (!binding.macroId) continue;
      const macro = store.allMacros().get(binding.macroId);
      register(binding.hotkey, () => runMacroFor(binding), macro ? macro.name : binding.hotkey);
    }
  }

  updateTray();
}

function setEnabled(enabled) {
  store.update({ enabled });
  if (!enabled) runner.abort();
  registerHotkeys();
  pushState();
  send('toast', {
    kind: enabled ? 'success' : 'info',
    message: enabled ? 'Macros ARMED' : 'Macros DISABLED'
  });
}

// --------------------------------------------------------------------- tray

function updateTray() {
  if (!tray) return;

  const enabled = store.data.enabled;
  tray.setToolTip(`Helldivers Macro Machine — ${enabled ? 'ARMED' : 'DISABLED'}`);
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: `Status: ${enabled ? 'ARMED' : 'DISABLED'}`, enabled: false },
    { type: 'separator' },
    {
      label: enabled ? 'Disable macros' : 'Enable macros',
      click: () => setEnabled(!enabled)
    },
    { label: 'Show window', click: showWindow },
    { type: 'separator' },
    { label: 'Quit', click: () => { quitting = true; app.quit(); } }
  ]));
}

function showWindow() {
  if (!mainWindow) return createWindow();
  if (mainWindow.isMinimized()) mainWindow.restore();
  mainWindow.show();
  mainWindow.focus();
}

// ------------------------------------------------------------------- window

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1180,
    height: 820,
    minWidth: 900,
    minHeight: 620,
    show: false,
    backgroundColor: '#0d0f12',
    icon: makeIcon(256),
    // The app draws its own caption buttons into the header bar, so there is no
    // OS title bar above it. Resizing still works: Electron keeps the sizing
    // border on frameless windows.
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, '..', 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  mainWindow.loadFile(path.join(__dirname, '..', 'renderer', 'index.html'));

  // Surface renderer errors on the terminal during development; a silent
  // renderer exception otherwise just looks like a blank panel.
  if (!app.isPackaged) {
    mainWindow.webContents.on('console-message', (...args) => {
      const event = args[0];
      const message = (event && typeof event === 'object' && 'message' in event)
        ? `[renderer] ${event.message} (${event.sourceId}:${event.lineNumber})`
        : `[renderer] ${args[1]} (${args[3]}:${args[2]})`;
      console.log(message);
    });
  }

  mainWindow.once('ready-to-show', () => {
    if (!store.data.settings.startMinimized) mainWindow.show();
  });

  mainWindow.on('close', (event) => {
    if (!quitting && store.data.settings.minimizeToTray) {
      event.preventDefault();
      mainWindow.hide();
    }
  });

  mainWindow.on('closed', () => { mainWindow = null; });

  // Keep the maximise/restore button's icon in step with the real window state,
  // including when the change came from a drag-to-top snap or Win+Up.
  const pushWindowState = () => send('window-state', { maximized: mainWindow.isMaximized() });
  mainWindow.on('maximize', pushWindowState);
  mainWindow.on('unmaximize', pushWindowState);

  // Keep external links out of the app shell.
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:\/\//.test(url)) shell.openExternal(url);
    return { action: 'deny' };
  });
}

// ---------------------------------------------------------------------- IPC

function registerIpc() {
  ipcMain.handle('bootstrap', () => ({
    state: buildState(),
    stratagems: STRATAGEMS,
    groupOrder: GROUP_ORDER,
    keys: KEYS,
    stratagemKeyChoices: STRATAGEM_KEY_CHOICES,
    directionKeyChoices: DIRECTION_KEY_CHOICES,
    directions: DIRECTIONS,
    directionLabels: DIRECTION_LABELS,
    directionArrows: DIRECTION_ARROWS,
    appVersion: app.getVersion(),
    configPath: store.file,
    inputOk: input.selfTest(),
    maximized: mainWindow ? mainWindow.isMaximized() : false
  }));

  ipcMain.handle('window-minimize', () => {
    if (mainWindow) mainWindow.minimize();
  });

  ipcMain.handle('window-maximize-toggle', () => {
    if (!mainWindow) return false;
    if (mainWindow.isMaximized()) mainWindow.unmaximize();
    else mainWindow.maximize();
    return mainWindow.isMaximized();
  });

  // Goes through close() rather than hide() so the minimise-to-tray setting and
  // the quitting flag are honoured exactly as they are for an OS close.
  ipcMain.handle('window-close', () => {
    if (mainWindow) mainWindow.close();
  });

  ipcMain.handle('set-enabled', (_e, enabled) => {
    setEnabled(Boolean(enabled));
    return buildState();
  });

  ipcMain.handle('update-settings', (_e, patch) => {
    store.update({ settings: { ...store.data.settings, ...patch } });
    registerHotkeys();
    pushState();
    return buildState();
  });

  ipcMain.handle('set-bindings', (_e, bindings) => {
    store.update({ bindings });
    registerHotkeys();
    pushState();
    return buildState();
  });

  ipcMain.handle('set-custom-macros', (_e, customMacros) => {
    store.update({ customMacros });
    registerHotkeys();
    pushState();
    return buildState();
  });

  /** Fire a macro from the UI — same path as a hotkey, minus the modifiers. */
  ipcMain.handle('test-macro', async (_e, macroId) => {
    const macro = store.allMacros().get(macroId);
    if (!macro) return { ok: false, reason: 'not-found' };
    return runner.run(macro, store.data.settings, []);
  });

  ipcMain.handle('abort', () => ({ aborted: runner.abort() }));

  ipcMain.handle('reset-config', () => {
    store.reset();
    registerHotkeys();
    pushState();
    return buildState();
  });

  ipcMain.handle('open-config-folder', () => {
    shell.showItemInFolder(store.file);
  });

  ipcMain.handle('hide-window', () => {
    if (mainWindow) mainWindow.hide();
  });
}

// --------------------------------------------------------------- app startup

if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on('second-instance', showWindow);

  app.whenReady().then(() => {
    store = new Store();
    store.load();

    runner = new MacroRunner({
      onStateChange: (state) => {
        send('run-state', {
          running: state.running,
          macroId: state.macro ? state.macro.id : null,
          macroName: state.macro ? state.macro.name : null,
          step: state.step || 0,
          total: state.total || 0,
          aborted: Boolean(state.aborted),
          completed: Boolean(state.completed),
          error: state.error || null
        });
      }
    });

    registerIpc();
    createWindow();

    tray = new Tray(makeIcon(16));
    tray.on('click', showWindow);
    updateTray();

    registerHotkeys();
  });

  app.on('will-quit', () => {
    globalShortcut.unregisterAll();

    // Quitting mid-macro would otherwise leave the stratagem key held down in
    // the game, with nothing left running to lift it.
    if (runner) {
      runner.abort();
      try {
        runner.releaseAll(store.data.settings);
      } catch (err) {
        console.error('Failed to release keys on quit:', err.message);
      }
    }
  });

  // Tray app: closing the window is not quitting.
  app.on('window-all-closed', () => {});

  app.on('before-quit', () => { quitting = true; });
}
