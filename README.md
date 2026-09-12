# Helldivers Macro Machine

A Windows tray app that fires HELLDIVERS 2 stratagem codes from global hotkeys.
Press <kbd>Ctrl</kbd>+<kbd>3</kbd> in game and it types Up, Right, Down, Down,
Down for you, with the 0.04 s spacing the game requires between inputs.

All 112 stratagems ship with the app, codes taken from the
[HELLDIVERS 2 wiki](https://helldivers.wiki.gg/wiki/Stratagems).

## Install

Windows 10 or 11. Nothing else needed - no Node, no runtime, no dependencies.

### Step 1 - Download it

Open the [**Releases page**](../../releases) and, under the newest release, click
**Assets** to expand the file list. Download **one** of these:

| File | Choose this if |
| --- | --- |
| `HelldiversMacroMachine-1.0.0-setup.exe` | **Recommended.** Installs properly, adds a Start menu and desktop shortcut, and opens instantly every time. |
| `HelldiversMacroMachine-1.0.0-portable.exe` | You just want to try it, or run it off a USB stick. Nothing is installed, but it takes a few seconds to start each time. |

They are the same app - only how they get onto your PC differs.

### Step 2 - Get past the Windows warning

When you run the file, Windows shows a blue box: **"Windows protected your PC"**.

> Click **More info**, then click the **Run anyway** button that appears.

This happens because the app isn't code-signed - a signing certificate costs a
few hundred dollars a year, which is hard to justify for a free macro tool. It is
not a sign anything is wrong, and you only have to do it once. If you would
rather not take that on trust, [build it yourself](#building-it-yourself) from
this source in two commands.

Your antivirus may also flag it. The app simulates keypresses, which is the same
Windows API a keylogger would use - so heuristic scanners sometimes get twitchy.
It does not read your keyboard, and it makes no network connections at all.

### Step 3 - Install (installer only)

Click through the wizard. It installs into your own user folder, so **Windows
will not ask for an administrator password**. When it finishes, the app opens by
itself.

If you downloaded the portable version instead, skip this - double-clicking the
file *is* running it. Put it somewhere sensible first, like your Desktop.

### Step 4 - Match the keys to your game

This is the one step people miss, and the app does nothing without it.

Open **Settings** in the app and check the **In-game keys** section against your
HELLDIVERS 2 controls:

- **Stratagem key** - default `Left Ctrl`. This is the key you hold in game to
  open the stratagem menu.
- **Up / Down / Left / Right** - default `W` `S` `A` `D`.

If you never changed your controls in HELLDIVERS 2, the defaults already match
and there is nothing to do. If you rebound anything - arrow keys are a common
choice - set it here to match, or the macros will press the wrong keys.

### Step 5 - Use it in game

1. Leave the app running. Closing the window only hides it to the **system
   tray** (bottom-right of your taskbar, possibly under the `^` arrow). Click the
   tray icon to bring it back.
2. Check the top-right of the app reads **ARMED** in green. If it says DISABLED,
   click **Arm macros**.
3. Launch HELLDIVERS 2 and press <kbd>Ctrl</kbd>+<kbd>3</kbd> in a mission - the
   Eagle 500kg Bomb gets called in.

Set your own hotkeys to whatever loadout you're running before you drop - click
any hotkey chip to change the key, or a stratagem name to change what it calls.

### Uninstalling

Installer version: **Settings → Apps → Installed apps → Helldivers Macro
Machine → Uninstall**, the same as any other program.

Portable version: delete the `.exe`.

Either way, your hotkeys and settings are kept in
`%APPDATA%\Helldivers Macro Machine`. Delete that folder too if you want it
gone completely.

## Using it

The app opens with six hotkeys already set up:

| Hotkey | Stratagem |
| --- | --- |
| <kbd>Ctrl</kbd>+<kbd>1</kbd> | AC-8 Autocannon |
| <kbd>Ctrl</kbd>+<kbd>2</kbd> | SH-32 Shield Generator Pack |
| <kbd>Ctrl</kbd>+<kbd>3</kbd> | Eagle 500kg Bomb |
| <kbd>Ctrl</kbd>+<kbd>4</kbd> | Orbital Railcannon Strike |
| <kbd>Ctrl</kbd>+<kbd>5</kbd> | Resupply |
| <kbd>Ctrl</kbd>+<kbd>6</kbd> | Reinforce |

<kbd>Ctrl</kbd>+<kbd>1</kbd> through <kbd>Ctrl</kbd>+<kbd>4</kbd> match the four
stratagem slots a mission allows. Resupply and Reinforce sit below them because
they are mission stratagems: always available, and they take no loadout slot.

Change any of them by clicking the hotkey chip, or click the stratagem name to
swap which stratagem the key calls. Nothing stops you binding more than four -
handy if you run several loadouts and want them all ready - but only the four
you actually equipped exist in any given mission.

- **Arm / disarm** with the button in the top right or <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>H</kbd>.
  While disarmed, none of the macro hotkeys do anything, so you can type normally.
- **Cancel a running macro** by pressing its hotkey again, or
  <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>Space</kbd>. Useful for the seven-input barrages.
- **Bind anything** from the Stratagems list with its *Bind* button.
- The **play button** next to any stratagem runs it immediately, for testing
  outside the game.
- Closing the window minimises to the tray; quit from the tray menu.

Your hotkeys, custom macros and settings live in
`%APPDATA%\Helldivers Macro Machine\config.json`.

### Custom macros

**+ Custom macro** opens an editor where you can build any direction sequence -
click the arrow buttons, or hit **Record keys** and press the arrows / WASD to
enter it by hand. Custom macros bind to hotkeys exactly like the built-in ones.

## Settings that matter

**In-game keys.** The app defaults to a stock HELLDIVERS 2 install: the
stratagem key is Left Ctrl and the directions are WASD. If you rebound either in
game, change it here to match, or nothing will register. Arrow keys, IJKL and the
numpad are all available.

**Timing.** The 40 ms delay between inputs is the game's own limit - inputs
arriving faster than that get dropped, which is the usual reason a macro works
"most of the time". If stratagems start failing intermittently, raise it.

The other three delays cover opening the stratagem menu, how long each direction
is physically held, and the pause before releasing the stratagem key. All four
default to 40 ms, so a five-input stratagem completes in a little under half a
second.

Windows timers only tick every ~15.6 ms, so a 40 ms delay actually lands
somewhere between 40 and 56 ms. That errs slow, which is the safe direction -
setting anything below about 30 ms buys you nothing real.

## If it isn't working

**Nothing happens in game, but the play button works in a text editor.**
HELLDIVERS 2 is probably running as administrator. Windows blocks input sent
from a lower privilege level to a higher one, so right-click the app and *Run as
administrator* too.

**A hotkey shows in red.** Another program already owns that combination
system-wide - Discord, GeForce Experience and Steam are the usual culprits.
Pick a different one.

**The macro fires but only some arrows land.** Raise the delay between inputs.

**The game reads a different direction than expected.** Check the direction keys
in Settings match your in-game bindings. Note that arrow keys and the numpad are
different keys even though both have arrows on them.

## Building it yourself

Needs [Node.js](https://nodejs.org) 20 or newer.

```
npm install
npm run dist
```

The build lands in `dist/`, and a copy is placed in the project root as
`Helldivers Macro Machine.exe` so it's easy to find. `npm run dist:installer`
builds the setup wizard instead, and `npm run dist:all` builds both.

To run from source without building: `npm start`.

Pushing a version tag builds and publishes both binaries automatically - see
[.github/workflows/release.yml](.github/workflows/release.yml).

## How input is sent

Games like HELLDIVERS 2 read the keyboard through raw input rather than window
messages, so the usual scripting approaches (`SendKeys`, `PostMessage`,
AutoHotkey's default send mode) are invisible to them. This app calls Win32
`SendInput` with `KEYEVENTF_SCANCODE`, which injects at the same level the
keyboard driver does, and resolves each scan code from your active keyboard
layout so non-US layouts work.

Nothing is read from the game, no game files are touched, and no network calls
are made. It is a keyboard macro tool that happens to know the stratagem codes.

## Layout

```
.github/workflows/
  release.yml    builds and publishes binaries on a version tag
src/
  main/        Electron main process - hotkeys, input injection, config
    input.js         SendInput / scan-code layer
    macro-runner.js  sequencing and timing
    store.js         config load/save/validation
  renderer/    the UI
  shared/      stratagem data and key tables
scripts/
  make-icon.js   generates build/icon.ico
  place-exe.js   copies the build into the project root
```
