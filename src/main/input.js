'use strict';

/**
 * Low-level Windows keyboard injection.
 *
 * HELLDIVERS 2 reads keyboard state through raw input / DirectInput rather than
 * the window message queue, so the usual "send a WM_KEYDOWN" tricks (PostMessage,
 * WScript.SendKeys, Electron's webContents.sendInputEvent) are invisible to it.
 *
 * What the game *does* see is SendInput with KEYEVENTF_SCANCODE, which injects
 * events at the same level the HID stack does. We resolve the scan code for each
 * virtual key through MapVirtualKeyW so the injection follows the user's actual
 * keyboard layout instead of a hardcoded US table.
 */

const koffi = require('koffi');

const user32 = koffi.load('user32.dll');

// UINT SendInput(UINT cInputs, LPINPUT pInputs, int cbSize)
const SendInput = user32.func('__stdcall', 'SendInput', 'uint32', ['uint32', 'void *', 'int32']);
// UINT MapVirtualKeyW(UINT uCode, UINT uMapType)
const MapVirtualKeyW = user32.func('__stdcall', 'MapVirtualKeyW', 'uint32', ['uint32', 'uint32']);

const INPUT_KEYBOARD = 1;
const KEYEVENTF_EXTENDEDKEY = 0x0001;
const KEYEVENTF_KEYUP = 0x0002;
const KEYEVENTF_SCANCODE = 0x0008;

const MAPVK_VK_TO_VSC_EX = 4;

const IS_64 = process.arch === 'x64' || process.arch === 'arm64';

// sizeof(INPUT) and the offsets of the KEYBDINPUT fields inside it. The union
// is sized by MOUSEINPUT, which is why there is trailing padding after the
// 24-byte (x64) / 16-byte (x86) KEYBDINPUT.
const INPUT_SIZE = IS_64 ? 40 : 28;
const OFF_VK = IS_64 ? 8 : 4;
const OFF_SCAN = OFF_VK + 2;
const OFF_FLAGS = OFF_VK + 4;

const scanCache = new Map();

/**
 * Keys that live on the E0-prefixed side of the scan-code table.
 *
 * MAPVK_VK_TO_VSC_EX is documented to return the prefix in the high byte, but
 * in practice it does not do so for the grey navigation cluster: VK_UP comes
 * back as 0x48, which without the extended flag *is* numpad 8. Injecting that
 * would make an arrow-key stratagem binding press the numpad instead, so the
 * prefix is applied from this table and the API result is only a fallback.
 */
const EXTENDED_VKS = new Set([
  0x03, // VK_CANCEL (Ctrl+Break)
  0x21, 0x22, 0x23, 0x24, // PageUp, PageDown, End, Home
  0x25, 0x26, 0x27, 0x28, // Left, Up, Right, Down
  0x2c, // PrintScreen
  0x2d, 0x2e, // Insert, Delete
  0x5b, 0x5c, 0x5d, // LWin, RWin, Apps
  0x6f, // Numpad divide
  0x90, // NumLock
  0xa3, // Right Ctrl
  0xa5  // Right Alt
]);

/**
 * Resolve a virtual-key code to { scan, extended } for the active layout.
 * The scan code itself is layout-dependent (so it comes from Windows), while
 * "extendedness" is a property of the physical key and comes from the table.
 */
function resolveScan(vk) {
  if (scanCache.has(vk)) return scanCache.get(vk);

  const raw = MapVirtualKeyW(vk, MAPVK_VK_TO_VSC_EX);
  const prefix = (raw >> 8) & 0xff;
  const resolved = {
    scan: raw & 0xff,
    extended: EXTENDED_VKS.has(vk) || prefix === 0xe0 || prefix === 0xe1
  };

  scanCache.set(vk, resolved);
  return resolved;
}

/** Drop cached scan codes — call when the keyboard layout may have changed. */
function clearScanCache() {
  scanCache.clear();
}

/**
 * Build the INPUT[] block by hand rather than via a koffi struct definition.
 * The layout is fixed by the Win32 ABI, and writing the bytes directly keeps us
 * immune to any struct-packing surprises across koffi versions.
 */
function buildInputBuffer(events) {
  const buf = Buffer.alloc(INPUT_SIZE * events.length);

  events.forEach((event, i) => {
    const base = i * INPUT_SIZE;
    const { scan, extended } = resolveScan(event.vk);

    let flags = KEYEVENTF_SCANCODE;
    if (extended) flags |= KEYEVENTF_EXTENDEDKEY;
    if (event.up) flags |= KEYEVENTF_KEYUP;

    buf.writeUInt32LE(INPUT_KEYBOARD, base);
    // wVk stays 0: with KEYEVENTF_SCANCODE the driver derives it from wScan.
    buf.writeUInt16LE(0, base + OFF_VK);
    buf.writeUInt16LE(scan, base + OFF_SCAN);
    buf.writeUInt32LE(flags, base + OFF_FLAGS);
    // time and dwExtraInfo stay zero.
  });

  return buf;
}

function send(events) {
  if (!events.length) return 0;

  const buf = buildInputBuffer(events);
  const sent = SendInput(events.length, buf, INPUT_SIZE);

  if (sent !== events.length) {
    // Most common cause is UIPI: the foreground window belongs to a process
    // running at a higher integrity level than we are.
    throw new Error(
      `SendInput injected ${sent}/${events.length} events. ` +
      'If the game is running as administrator, this app must be too.'
    );
  }

  return sent;
}

function keyDown(vk) {
  send([{ vk, up: false }]);
}

function keyUp(vk) {
  send([{ vk, up: true }]);
}

/**
 * Verify the FFI bindings actually work before we promise the user a working
 * hotkey. Injects a lone key-*up* for F24 — a real, mappable key that nothing
 * binds, and a release for a key nobody pressed is discarded everywhere.
 */
function selfTest() {
  const VK_F24 = 0x87;
  try {
    send([{ vk: VK_F24, up: true }]);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

module.exports = { send, keyDown, keyUp, resolveScan, clearScanCache, selfTest, INPUT_SIZE };
