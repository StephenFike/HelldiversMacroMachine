'use strict';

/**
 * Executes a stratagem code as real keystrokes, with the timing HELLDIVERS 2
 * needs.
 *
 * Shape of a run:
 *
 *   [stratagem key DOWN]
 *      ... openDelayMs ...
 *   [dir DOWN] tapHoldMs [dir UP]   ... stepDelayMs ...   (x N)
 *      ... closeDelayMs ...
 *   [stratagem key UP]
 *
 * stepDelayMs defaults to 40ms: the game drops direction inputs that arrive
 * faster than that, which is the single most common reason a macro "sometimes"
 * works. tapHoldMs is how long each direction is physically held — too short and
 * the game's input poll can miss the press entirely between frames.
 *
 * Note that Windows timer granularity is ~15.6ms, so a 40ms sleep lands
 * somewhere in 40-56ms. Overshooting is harmless here; undershooting would not
 * be, which is why the delay is not trimmed any finer.
 */

const input = require('./input');
const { vkFor, DIRECTIONS } = require('../shared/keymap');

class AbortedError extends Error {
  constructor() {
    super('Macro aborted');
    this.name = 'AbortedError';
  }
}

class MacroRunner {
  constructor({ onStateChange } = {}) {
    this.onStateChange = onStateChange || (() => {});
    this.current = null; // { macro, token, startedAt }
    this._token = 0;
  }

  get isRunning() {
    return this.current !== null;
  }

  /**
   * Wait, but wake up early if the run is aborted, so a cancelled 380mm
   * barrage stops on the next step instead of 3 seconds later.
   */
  _sleep(ms, token) {
    return new Promise((resolve, reject) => {
      if (token !== this._token) return reject(new AbortedError());

      const timer = setTimeout(() => {
        clearInterval(watch);
        if (token !== this._token) reject(new AbortedError());
        else resolve();
      }, ms);

      const watch = setInterval(() => {
        if (token !== this._token) {
          clearTimeout(timer);
          clearInterval(watch);
          reject(new AbortedError());
        }
      }, 15);
    });
  }

  _checkToken(token) {
    if (token !== this._token) throw new AbortedError();
  }

  /**
   * @param {{id: string, name: string, code: string}} macro
   * @param {object} settings
   * @param {string[]} [heldModifierKeys] keys the trigger hotkey is holding down
   *   that should be released before injecting (e.g. Alt, which would otherwise
   *   put the game into a menu). The stratagem key itself is never released.
   */
  async run(macro, settings, heldModifierKeys = []) {
    if (this.isRunning) {
      return { ok: false, reason: 'busy' };
    }

    const code = String(macro.code || '').toUpperCase();
    const bad = [...code].find((c) => !DIRECTIONS.includes(c));
    if (!code.length || bad) {
      return { ok: false, reason: 'invalid-code' };
    }

    const token = ++this._token;
    const stratagemVk = vkFor(settings.stratagemKey);
    const dirVks = {};
    for (const dir of DIRECTIONS) dirVks[dir] = vkFor(settings.directions[dir]);

    this.current = { macro, token, startedAt: Date.now() };
    this.onStateChange({ running: true, macro, step: 0, total: code.length });

    try {
      // Release any trigger modifier the game would misread. Ctrl is skipped
      // when it *is* the stratagem key, since we need it held anyway.
      for (const keyName of heldModifierKeys) {
        if (keyName === settings.stratagemKey) continue;
        input.keyUp(vkFor(keyName));
      }

      input.keyDown(stratagemVk);
      await this._sleep(settings.openDelayMs, token);

      for (let i = 0; i < code.length; i++) {
        this._checkToken(token);

        const vk = dirVks[code[i]];
        input.keyDown(vk);
        await this._sleep(settings.tapHoldMs, token);
        input.keyUp(vk);

        this.onStateChange({ running: true, macro, step: i + 1, total: code.length });

        if (i < code.length - 1) {
          await this._sleep(settings.stepDelayMs, token);
        }
      }

      await this._sleep(settings.closeDelayMs, token);
      input.keyUp(stratagemVk);

      this.current = null;
      this.onStateChange({ running: false, macro, completed: true });
      return { ok: true };
    } catch (err) {
      // Whatever went wrong, do not leave keys stuck down in the game.
      this._releaseAll(stratagemVk, dirVks);
      this.current = null;

      if (err instanceof AbortedError) {
        this.onStateChange({ running: false, macro, aborted: true });
        return { ok: false, reason: 'aborted' };
      }

      this.onStateChange({ running: false, macro, error: err.message });
      return { ok: false, reason: 'error', error: err.message };
    }
  }

  _releaseAll(stratagemVk, dirVks) {
    const release = (vk) => {
      try { input.keyUp(vk); } catch { /* nothing useful to do here */ }
    };
    for (const dir of DIRECTIONS) release(dirVks[dir]);
    release(stratagemVk);
  }

  /**
   * Synchronously lift every key this runner is able to press.
   *
   * Used on shutdown. A normal abort cleans up at the running loop's next
   * checkpoint, but if the process is exiting there is no next checkpoint — and
   * the game would be left with the stratagem key held down.
   */
  releaseAll(settings) {
    const dirVks = {};
    for (const dir of DIRECTIONS) dirVks[dir] = vkFor(settings.directions[dir]);
    this._releaseAll(vkFor(settings.stratagemKey), dirVks);
  }

  /** Cancel the in-flight macro, if any. Returns true if something was running. */
  abort() {
    if (!this.isRunning) return false;
    this._token++; // invalidates the running loop on its next checkpoint
    return true;
  }
}

module.exports = { MacroRunner };
