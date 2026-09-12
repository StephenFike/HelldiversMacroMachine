'use strict';

const { contextBridge, ipcRenderer } = require('electron');

/**
 * The renderer gets an explicit, closed API surface — no ipcRenderer, no Node.
 */
contextBridge.exposeInMainWorld('hmm', {
  bootstrap: () => ipcRenderer.invoke('bootstrap'),
  setEnabled: (enabled) => ipcRenderer.invoke('set-enabled', enabled),
  updateSettings: (patch) => ipcRenderer.invoke('update-settings', patch),
  setBindings: (bindings) => ipcRenderer.invoke('set-bindings', bindings),
  setCustomMacros: (macros) => ipcRenderer.invoke('set-custom-macros', macros),
  testMacro: (macroId) => ipcRenderer.invoke('test-macro', macroId),
  abort: () => ipcRenderer.invoke('abort'),
  resetConfig: () => ipcRenderer.invoke('reset-config'),
  openConfigFolder: () => ipcRenderer.invoke('open-config-folder'),
  hideWindow: () => ipcRenderer.invoke('hide-window'),

  minimizeWindow: () => ipcRenderer.invoke('window-minimize'),
  toggleMaximizeWindow: () => ipcRenderer.invoke('window-maximize-toggle'),
  closeWindow: () => ipcRenderer.invoke('window-close'),

  onState: (cb) => ipcRenderer.on('state', (_e, payload) => cb(payload)),
  onRunState: (cb) => ipcRenderer.on('run-state', (_e, payload) => cb(payload)),
  onToast: (cb) => ipcRenderer.on('toast', (_e, payload) => cb(payload)),
  onWindowState: (cb) => ipcRenderer.on('window-state', (_e, payload) => cb(payload))
});
