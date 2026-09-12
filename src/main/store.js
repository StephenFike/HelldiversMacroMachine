'use strict';

const fs = require('fs');
const path = require('path');
const { app } = require('electron');

const { STRATAGEMS } = require('../shared/stratagems');
const { KEYS, DIRECTIONS } = require('../shared/keymap');

const CONFIG_VERSION = 2;

/**
 * Defaults match a stock HELLDIVERS 2 install: stratagem key on Left Ctrl,
 * directions on WASD. Delays default to the 40ms minimum the game enforces
 * between inputs; they are exposed because modded and heavily loaded setups
 * sometimes need more headroom.
 */
const DEFAULT_SETTINGS = {
  stratagemKey: 'LeftControl',
  directions: { U: 'W', D: 'S', L: 'A', R: 'D' },
  openDelayMs: 40,
  stepDelayMs: 40,
  tapHoldMs: 40,
  closeDelayMs: 40,
  releaseTriggerModifiers: true,
  toggleHotkey: 'Control+Shift+H',
  abortHotkey: 'Control+Shift+Space',
  startMinimized: false,
  minimizeToTray: true
};

/**
 * A workable starting loadout so the app does something useful on first run.
 *
 * Ctrl+1..4 mirror the four stratagem slots a mission actually allows. Resupply
 * and Reinforce are mission stratagems — always available, and they do not take
 * up a loadout slot — so they get their own keys below the four.
 */
const DEFAULT_BINDINGS = [
  { hotkey: 'Control+1', macroId: 'ac-8-autocannon' },
  { hotkey: 'Control+2', macroId: 'sh-32-shield-generator' },
  { hotkey: 'Control+3', macroId: 'eagle-500kg-bomb' },
  { hotkey: 'Control+4', macroId: 'orbital-railcannon-strike' },
  { hotkey: 'Control+5', macroId: 'resupply' },
  { hotkey: 'Control+6', macroId: 'reinforce' }
];

function defaultConfig() {
  return {
    version: CONFIG_VERSION,
    enabled: true,
    settings: { ...DEFAULT_SETTINGS, directions: { ...DEFAULT_SETTINGS.directions } },
    bindings: DEFAULT_BINDINGS.map((b) => ({ ...b })),
    customMacros: []
  };
}

/**
 * v1 shipped with 400ms delays, from a tenfold misreading of the game's minimum
 * gap between inputs. v2 corrects them to 40ms.
 *
 * Only values still sitting on the old default are rewritten — a config whose
 * delays were deliberately tuned keeps whatever the player chose.
 */
const LEGACY_V1_DELAYS = { openDelayMs: 400, stepDelayMs: 400, closeDelayMs: 400 };

function migrate(parsed) {
  if (!parsed || typeof parsed !== 'object') return parsed;
  if ((Number(parsed.version) || 1) >= CONFIG_VERSION) return parsed;

  const settings = { ...(parsed.settings || {}) };
  for (const [key, legacy] of Object.entries(LEGACY_V1_DELAYS)) {
    if (settings[key] === legacy) settings[key] = DEFAULT_SETTINGS[key];
  }

  return { ...parsed, settings };
}

function clampInt(value, min, max, fallback) {
  const n = Number.parseInt(value, 10);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

function sanitizeSettings(raw) {
  const base = { ...DEFAULT_SETTINGS, directions: { ...DEFAULT_SETTINGS.directions } };
  if (!raw || typeof raw !== 'object') return base;

  if (KEYS[raw.stratagemKey]) base.stratagemKey = raw.stratagemKey;

  if (raw.directions && typeof raw.directions === 'object') {
    for (const dir of DIRECTIONS) {
      if (KEYS[raw.directions[dir]]) base.directions[dir] = raw.directions[dir];
    }
  }

  base.openDelayMs = clampInt(raw.openDelayMs, 0, 5000, base.openDelayMs);
  base.stepDelayMs = clampInt(raw.stepDelayMs, 20, 5000, base.stepDelayMs);
  base.tapHoldMs = clampInt(raw.tapHoldMs, 5, 1000, base.tapHoldMs);
  base.closeDelayMs = clampInt(raw.closeDelayMs, 0, 5000, base.closeDelayMs);

  if (typeof raw.releaseTriggerModifiers === 'boolean') base.releaseTriggerModifiers = raw.releaseTriggerModifiers;
  if (typeof raw.startMinimized === 'boolean') base.startMinimized = raw.startMinimized;
  if (typeof raw.minimizeToTray === 'boolean') base.minimizeToTray = raw.minimizeToTray;
  if (typeof raw.toggleHotkey === 'string') base.toggleHotkey = raw.toggleHotkey.trim();
  if (typeof raw.abortHotkey === 'string') base.abortHotkey = raw.abortHotkey.trim();

  return base;
}

function sanitizeCustomMacros(raw) {
  if (!Array.isArray(raw)) return [];

  const seen = new Set();
  const out = [];

  for (const macro of raw) {
    if (!macro || typeof macro !== 'object') continue;

    const id = String(macro.id || '').trim();
    const name = String(macro.name || '').trim();
    const code = String(macro.code || '').toUpperCase().replace(/[^UDLR]/g, '');

    if (!id || !name || !code || seen.has(id)) continue;
    seen.add(id);
    out.push({ id, name, code, group: 'Custom', custom: true });
  }

  return out;
}

function sanitizeBindings(raw, validMacroIds) {
  if (!Array.isArray(raw)) return [];

  const seenHotkeys = new Set();
  const out = [];

  for (const binding of raw) {
    if (!binding || typeof binding !== 'object') continue;

    const hotkey = String(binding.hotkey || '').trim();
    const macroId = String(binding.macroId || '').trim();

    if (!hotkey || seenHotkeys.has(hotkey)) continue;
    // Drop bindings whose macro was deleted rather than silently keeping a
    // hotkey that would fire nothing.
    if (macroId && !validMacroIds.has(macroId)) continue;

    seenHotkeys.add(hotkey);
    out.push({ hotkey, macroId });
  }

  return out;
}

class Store {
  constructor() {
    this.file = path.join(app.getPath('userData'), 'config.json');
    this.data = defaultConfig();
  }

  load() {
    try {
      if (fs.existsSync(this.file)) {
        const parsed = JSON.parse(fs.readFileSync(this.file, 'utf8'));
        const upgraded = (Number(parsed && parsed.version) || 1) < CONFIG_VERSION;
        this.data = this._sanitize(parsed);
        if (upgraded) this.save();
      } else {
        this.save();
      }
    } catch (err) {
      // A corrupt config should never stop the app from starting; keep the
      // broken file around so the user can recover anything they'd customised.
      console.error('Failed to read config, falling back to defaults:', err.message);
      try {
        fs.renameSync(this.file, this.file + '.broken');
      } catch { /* best effort */ }
      this.data = defaultConfig();
    }
    return this.data;
  }

  _sanitize(rawParsed) {
    const parsed = migrate(rawParsed);
    const customMacros = sanitizeCustomMacros(parsed && parsed.customMacros);

    const validIds = new Set(STRATAGEMS.map((s) => s.id));
    for (const macro of customMacros) validIds.add(macro.id);

    return {
      version: CONFIG_VERSION,
      enabled: typeof parsed?.enabled === 'boolean' ? parsed.enabled : true,
      settings: sanitizeSettings(parsed && parsed.settings),
      bindings: sanitizeBindings(parsed && parsed.bindings, validIds),
      customMacros
    };
  }

  save() {
    try {
      fs.mkdirSync(path.dirname(this.file), { recursive: true });
      fs.writeFileSync(this.file, JSON.stringify(this.data, null, 2), 'utf8');
      return true;
    } catch (err) {
      console.error('Failed to write config:', err.message);
      return false;
    }
  }

  update(patch) {
    this.data = this._sanitize({ ...this.data, ...patch });
    this.save();
    return this.data;
  }

  reset() {
    this.data = defaultConfig();
    this.save();
    return this.data;
  }

  /** Built-in stratagems plus the user's own macros, keyed by id. */
  allMacros() {
    const map = new Map();
    for (const s of STRATAGEMS) map.set(s.id, s);
    for (const m of this.data.customMacros) map.set(m.id, m);
    return map;
  }
}

module.exports = { Store, DEFAULT_SETTINGS, defaultConfig };
