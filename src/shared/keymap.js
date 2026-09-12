'use strict';

/**
 * Keys the user is allowed to pick for the stratagem key and the four
 * directions. `vk` is the Win32 virtual-key code; the scan code the game
 * actually reads is derived at runtime from the active keyboard layout
 * (see input.js), so this table stays layout-agnostic.
 */

const KEYS = {
  // Modifiers (HELLDIVERS 2's stratagem key defaults to Left Ctrl)
  LeftControl:  { vk: 0xa2, label: 'Left Ctrl' },
  RightControl: { vk: 0xa3, label: 'Right Ctrl' },
  LeftShift:    { vk: 0xa0, label: 'Left Shift' },
  RightShift:   { vk: 0xa1, label: 'Right Shift' },
  LeftAlt:      { vk: 0xa4, label: 'Left Alt' },
  RightAlt:     { vk: 0xa5, label: 'Right Alt' },

  // Common non-letter keys
  Space:        { vk: 0x20, label: 'Space' },
  Tab:          { vk: 0x09, label: 'Tab' },
  CapsLock:     { vk: 0x14, label: 'Caps Lock' },
  Backspace:    { vk: 0x08, label: 'Backspace' },
  Enter:        { vk: 0x0d, label: 'Enter' },

  // Arrows
  Up:           { vk: 0x26, label: 'Up Arrow' },
  Down:         { vk: 0x28, label: 'Down Arrow' },
  Left:         { vk: 0x25, label: 'Left Arrow' },
  Right:        { vk: 0x27, label: 'Right Arrow' }
};

// A-Z
for (let i = 0; i < 26; i++) {
  const letter = String.fromCharCode(65 + i);
  KEYS[letter] = { vk: 0x41 + i, label: letter };
}

// 0-9 (top row)
for (let i = 0; i < 10; i++) {
  KEYS['Digit' + i] = { vk: 0x30 + i, label: String(i) };
}

// Numpad 0-9
for (let i = 0; i < 10; i++) {
  KEYS['Numpad' + i] = { vk: 0x60 + i, label: 'Numpad ' + i };
}

// F1-F12
for (let i = 1; i <= 12; i++) {
  KEYS['F' + i] = { vk: 0x6f + i, label: 'F' + i };
}

/** Sensible subset offered for the "stratagem key" dropdown. */
const STRATAGEM_KEY_CHOICES = [
  'LeftControl', 'RightControl', 'LeftShift', 'RightShift',
  'LeftAlt', 'RightAlt', 'CapsLock', 'Tab', 'Space', 'Q', 'E', 'X', 'Z', 'C', 'V', 'B'
];

/** Sensible subset offered for the four direction dropdowns. */
const DIRECTION_KEY_CHOICES = [
  'W', 'A', 'S', 'D',
  'Up', 'Down', 'Left', 'Right',
  'I', 'J', 'K', 'L',
  'Numpad8', 'Numpad4', 'Numpad2', 'Numpad6'
];

const DIRECTIONS = ['U', 'D', 'L', 'R'];

const DIRECTION_LABELS = { U: 'Up', D: 'Down', L: 'Left', R: 'Right' };
const DIRECTION_ARROWS = { U: '↑', D: '↓', L: '←', R: '→' };

function vkFor(keyName) {
  const entry = KEYS[keyName];
  if (!entry) throw new Error(`Unknown key: ${keyName}`);
  return entry.vk;
}

module.exports = {
  KEYS,
  STRATAGEM_KEY_CHOICES,
  DIRECTION_KEY_CHOICES,
  DIRECTIONS,
  DIRECTION_LABELS,
  DIRECTION_ARROWS,
  vkFor
};
