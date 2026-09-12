# Helldivers Macro Machine

> **A tool to help spread Managed Democracy throughout the cosmos!** Eliminate
> threats with efficient stratagem inputs that would make your Democracy Officer
> proud. **For Super Earth!**

Every second spent fumbling <kbd>↑</kbd> <kbd>→</kbd> <kbd>↓</kbd> <kbd>↓</kbd>
<kbd>↓</kbd> with a Charger bearing down is a second of Liberty denied.
Helldivers Macro Machine binds every stratagem in the arsenal to a single
keypress and enters the code for you, at the exact 40-millisecond cadence the
stratagem beacon demands. No faster. No slower. No excuses.

Press <kbd>Ctrl</kbd>+<kbd>3</kbd>. Somewhere below, a bug nest is about to learn
what 500 kilograms of Freedom feels like.

All **112 stratagems** are cleared for use, with codes taken from the
[HELLDIVERS 2 wiki](https://helldivers.wiki.gg/wiki/Stratagems) and checked
against it — which is more than the Ministry of Truth can say.

> **Unofficial.** A fan-made tool. Not affiliated with, endorsed by, or approved
> by Arrowhead Game Studios, Sony Interactive Entertainment, or the Ministry of
> Truth, who would like it known that they have never heard of it.

---

## Enlistment

Enlistment takes about two minutes, which by Helldiver standards is a
respectable fraction of your life expectancy.

**Requirements:** Windows 10 or 11. That's it. No Node, no runtime, no
dependencies. Super Earth provides.

### Step 1 — Requisition your equipment

Open the [**Releases page**](../../releases). Under the newest release, click
**Assets** to expand the file list, and download:

> **`HelldiversMacroMachine-1.0.0-setup.exe`**

If a newer version has been issued, the number will be higher — always take the
newest. Outdated equipment is a disservice to Democracy.

### Step 2 — Clear Windows security screening

When you run the installer, Windows shows a blue box:
**"Windows protected your PC"**.

> Click **More info**, then click the **Run anyway** button that appears.

Windows does not recognise the app because it isn't code-signed. A signing
certificate costs a few hundred dollars a year, and every one of those dollars
is better spent on the war effort. This is **not** a sign anything is wrong, and
you only have to do it once.

If you would rather not take that on faith — a healthy instinct, citizen, if a
slightly suspicious one — you can
[build it yourself](#ministry-of-science-build-it-yourself) from this source in
two commands.

Your antivirus may also flag it. The app simulates keypresses, which uses the
same Windows API a keylogger would, so heuristic scanners get twitchy. It does
not read your keyboard and it makes no network connections. There is nothing
here to report to the authorities.

### Step 3 — Complete induction

Click through the installer. It installs into your own user folder, so **Windows
will not ask for an administrator password**. When it finishes, the app opens by
itself.

You now have a desktop shortcut and a Start menu entry, and the app launches in
about half a second. Helldivers do not wait.

### Step 4 — Calibrate to your controls

> ⚠️ **This is the step recruits skip. Do not skip it.**

The app presses whatever keys it is told to. If those don't match your
HELLDIVERS 2 controls, nothing gets called in — and you are left standing in the
open, holding Ctrl, explaining yourself to a Bile Titan.

Open **Settings** in the app and check the **In-game keys** section against your
HELLDIVERS 2 controls:

- **Stratagem key** — default `Left Ctrl`. This is the key you hold in game to
  open the stratagem menu.
- **Up / Down / Left / Right** — default `W` `S` `A` `D`.

**If you never changed your controls in HELLDIVERS 2, the defaults already
match** and there is nothing to do. If you rebound anything — arrow keys are a
popular choice — set it here to match.

### Step 5 — Deploy

1. **Leave the app running.** Closing the window only hides it to the **system
   tray** (bottom-right of your taskbar, possibly under the `^` arrow). Click the
   tray icon to bring it back.
2. **Check the top-right of the app reads ARMED** in green. If it says DISABLED,
   click **Arm macros**.
3. **Launch HELLDIVERS 2**, drop into a mission, and press
   <kbd>Ctrl</kbd>+<kbd>3</kbd>. The Eagle 500kg Bomb is on its way.

Before each drop, set your hotkeys to match the loadout you're bringing — click
any hotkey chip to change its key, or a stratagem name to change what it calls.

*Democracy has landed.*

### Honourable discharge

To uninstall: **Settings → Apps → Installed apps → Helldivers Macro Machine →
Uninstall**, the same as any other program.

Your service record (hotkeys and settings) is kept in
`%APPDATA%\Helldivers Macro Machine`. Delete that folder too for a complete
discharge.

---

## Field manual

Your Super Destroyer ships with a standard-issue loadout, pre-bound and ready to
liberate:

| Hotkey | Stratagem |
| --- | --- |
| <kbd>Ctrl</kbd>+<kbd>1</kbd> | AC-8 Autocannon |
| <kbd>Ctrl</kbd>+<kbd>2</kbd> | SH-32 Shield Generator Pack |
| <kbd>Ctrl</kbd>+<kbd>3</kbd> | Eagle 500kg Bomb |
| <kbd>Ctrl</kbd>+<kbd>4</kbd> | Orbital Railcannon Strike |
| <kbd>Ctrl</kbd>+<kbd>5</kbd> | Resupply |
| <kbd>Ctrl</kbd>+<kbd>6</kbd> | Reinforce |

<kbd>Ctrl</kbd>+<kbd>1</kbd> through <kbd>Ctrl</kbd>+<kbd>4</kbd> match the four
stratagem slots High Command allows per mission. Resupply and Reinforce sit
below them because they are mission stratagems: always available, and they take
no loadout slot.

Swap any of them by clicking the hotkey chip, or click the stratagem name to
change what the key calls. You may bind more than four — useful if you run
several loadouts and want them all ready — but only the four you actually
equipped exist once you're on the ground.

- **Arm / disarm** with the button in the top right, or
  <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>H</kbd>. While disarmed, no macro hotkey
  does anything, so you can type in chat without accidentally calling an orbital
  strike on your own squad.
- **Cancel a running macro** by pressing its hotkey again, or
  <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>Space</kbd>. For the moment you realise,
  mid-code, that the 380mm Barrage is about to land on your own extraction.
- **Bind anything** from the Stratagems list with its **Bind** button.
- **The play button** next to any stratagem runs it immediately, for testing
  outside the game.
- **Closing the window** hides it to the tray. Freedom never clocks off. Quit
  from the tray menu.

Your hotkeys, custom macros and settings live in
`%APPDATA%\Helldivers Macro Machine\config.json`.

### Custom stratagems

Super Earth encourages initiative, within approved limits.

**+ Custom macro** opens an editor where you can build any direction sequence —
click the arrow buttons, or hit **Record keys** and press the arrows or WASD to
enter it by hand. Custom macros bind to hotkeys exactly like the built-in ones.

---

## Calibration

**In-game keys.** The app defaults to a stock HELLDIVERS 2 install: stratagem
key on Left Ctrl, directions on WASD. If you rebound either in game, change them
here to match, or nothing will register. Arrow keys, IJKL and the numpad are all
available.

**Timing.** The 40 ms gap between inputs is the tolerance of the stratagem
beacon itself. Inputs arriving faster than that are dropped, which is the usual
reason a macro works "most of the time." **If stratagems start failing
intermittently, raise it.**

The other three delays cover opening the stratagem menu, how long each direction
is physically held, and the pause before releasing the stratagem key. All four
default to 40 ms, so a five-input stratagem is called in a little under half a
second.

Windows timers only tick every ~15.6 ms, so a 40 ms delay actually lands
somewhere between 40 and 56 ms. That errs slow, which is the safe direction.
Setting anything below about 30 ms gains you nothing but a sense of daring.

---

## Field repairs

**Nothing happens in game, but the play button works in a text editor.**
HELLDIVERS 2 is probably running as administrator. Windows blocks input sent
from a lower privilege level to a higher one, so right-click the app and choose
**Run as administrator** too.

**A hotkey shows in red.** Another program has already claimed that key
combination system-wide. Discord, GeForce Experience and Steam are the usual
collaborators. Choose a different combination.

**The macro fires, but only some arrows land.** Raise the delay between inputs
in Settings.

**The game reads a different direction than expected.** Check the direction keys
in Settings match your in-game bindings. Note that the arrow keys and the numpad
are different keys, even though both have arrows printed on them.

---

## Ministry of Science: build it yourself

*For authorised personnel.* Requires [Node.js](https://nodejs.org) 20 or newer.

```
npm install
npm run dist
```

That produces the installer in `dist/`, and copies it to the project root as
`Helldivers Macro Machine Setup.exe` so it's easy to find.

To run from source without building: `npm start`.

Pushing a version tag builds and publishes the installer automatically — see
[.github/workflows/release.yml](.github/workflows/release.yml).

Only an installed build is issued, deliberately. A portable single-file build
has to unpack its entire ~370 MB payload into `%TEMP%` on every launch, which
measured **~9.8 seconds to open, against ~0.4 seconds installed**. Super Earth
does not issue equipment that makes a Helldiver wait ten seconds to spread
Democracy.

## Classified: how the stratagem uplink works

Games like HELLDIVERS 2 read the keyboard through raw input rather than window
messages, so the usual scripting approaches (`SendKeys`, `PostMessage`,
AutoHotkey's default send mode) are invisible to them. This app calls Win32
`SendInput` with `KEYEVENTF_SCANCODE`, which injects input at the same level the
keyboard driver does, and resolves each scan code from your active keyboard
layout so non-US layouts work.

Nothing is read from the game. No game files are touched. No network
connections are made. It is a keyboard macro tool that happens to know the
stratagem codes — which makes it considerably less nosy than the Ministry of
Truth.

## Ship schematics

```
.github/workflows/
  release.yml    builds and publishes the installer on a version tag
src/
  main/        Electron main process: hotkeys, input injection, config
    input.js         SendInput / scan-code layer
    macro-runner.js  sequencing and timing
    store.js         config load/save/validation
  renderer/    the UI
  shared/      stratagem data and key tables
scripts/
  make-icon.js   generates build/icon.ico
  place-exe.js   copies the installer into the project root
```
