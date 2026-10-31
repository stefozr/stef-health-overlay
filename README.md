# Stef's Health Overlay

A small Foundry VTT module that shows at a glance how hurt a creature is. As a creature loses Stamina (Draw Steel) or
hit points (D&D 5e), its token gets a full-token injury overlay that darkens step by step, from Barely Injured to Near
Death. Draw Steel heroes and retainers who drop below 0 Stamina show Mortally Wounded. Exact numbers stay hidden; the
table only sees the overlay.

## Features

- Five injury statuses with their own overlay art, applied and swapped automatically as health changes.
- Only one injury overlay at a time; healing back above 95% removes it.
- Works for every actor that has a health pool: player characters, NPCs and unlinked tokens.
- Draw Steel: only creatures that can go below 0 Stamina (heroes and retainers) get Mortally Wounded; a monster at 0
  is dead, so its overlay is simply removed.
- The statuses are ordinary status effects, so you can also set them by hand from the Token HUD.

## Installation

In Foundry: **Add-on Modules > Install Module**, paste this manifest URL and click Install:

```
https://github.com/stefozr/stef-health-overlay/releases/latest/download/module.json
```

Then enable **Stef's Health Overlay** in your world's **Manage Modules**.

## Requirements and compatible modules

| Module | Required? | What it adds or why |
|---|---|---|
| Foundry VTT 14 | Yes | Built and tested on version 14. |
| Draw Steel system | One of the two systems | Overlays follow `system.stamina`; Mortally Wounded for heroes and retainers below 0. |
| D&D 5e system | One of the two systems | Overlays follow `system.attributes.hp`. |

The module lists both systems in its manifest, so Foundry only offers it in Draw Steel and D&D 5e worlds.

## Health bands

Health is the current value divided by the maximum.

| Remaining health | Status (overlay) |
|---|---|
| 95% to full | none |
| 75% to under 95% | Barely Injured |
| 50% to under 75% | Injured |
| 25% to under 50% | Badly Injured |
| above 0, under 25% | Near Death (status id `critically-injured`) |
| 0 or less | Mortally Wounded for Draw Steel heroes and retainers (who can go negative); no overlay for everyone else |

The status ids are `barely-injured`, `injured`, `badly-injured`, `critically-injured` and `mortally-wounded`. In Draw
Steel the system's own "Dying" status still applies at its threshold; Mortally Wounded is a separate overlay.

## How it works

- The overlays are applied by the active GM's client whenever an actor's health changes, so a GM must be connected.
  Players see the result like any other status.
- Each change is processed in order per actor, so fast repeated damage never leaves two overlays on one token.
- Nothing happens until health changes: a creature that was already hurt before you enabled the module gets its
  overlay with the next damage or healing.

## Setting the statuses by hand

The five statuses appear in the Token HUD's status list like any other status effect. Right-click an icon to apply it
as a full-token overlay (left-click applies it as a small icon). The next change to that creature's health recalculates
the band and replaces whatever injury status it has, so a hand-set status lasts until the next damage or healing.

## Settings

None.

## API

```js
game.modules.get("stef-health-overlay").api.migrateLegacy({ dryRun: true }) // see "Upgrading" below
```

## Upgrading from Injury Overlay (`injury-overlay`)

1. Install this module, enable it and disable Injury Overlay.
2. On the first load the GM's client updates the injury effects that are already on actors (world actors and unlinked
   tokens on every scene) so their image points at this module's folder instead of `modules/injury-overlay/assets/`.
   The status ids did not change, so existing effects keep working. The old module stored no settings or flags.
3. To check, run `game.modules.get("stef-health-overlay").api.migrateLegacy({ dryRun: true })` in the console (F12);
   it reports what would still change. `migrateLegacy({ force: true })` runs it again.
4. Remove Injury Overlay.

## Known limitations

- Only Draw Steel and D&D 5e are supported.
- If another module or the system already registers a status with one of the five ids, that status is used as it is
  (with its own name and image).
- Compendium actors are not touched.

## Uninstalling

Injury effects stay on the actors that had them when you disable the module; their images go missing once the module
is removed. Remove them from the Token HUD or the actor's effects list if you no longer want them.

## Stef's modules

| Module | What it does |
|---|---|
| [Stef's Automation Suite for Draw Steel](https://github.com/stefozr/stef-ds-automation) | Applies ability results per target (damage, conditions, forced movement, saves, triggered actions, summons, areas) with undo, plus the automation library and editor. |
| [Stef's Quality of Life Improvements for Draw Steel](https://github.com/stefozr/stef-ds-qol) | Small fixes and table conveniences for the Draw Steel system and the Combat Tools family. |
| [Stef's Auto FX for Draw Steel](https://github.com/stefozr/stef-ds-fx) | Sequencer animations for abilities, scaled by tier, per target with the Automation Suite. |
| [Stef's Character Sheets Evolved for Draw Steel](https://github.com/stefozr/stef-ds-charsheet) | A compact hero and monster sheet with class art, collapsible rows and a combat strip. |
| [Stef's Health Overlay](https://github.com/stefozr/stef-health-overlay) | Injury overlays on tokens by remaining Stamina / HP (Draw Steel and D&D 5e). |

## License

MIT, see [LICENSE](LICENSE). Icons © 2026 Stefan, included under the same MIT license.

Stef's Health Overlay is an independent product and is not affiliated with, endorsed or sponsored by MCDM Productions,
LLC. Draw Steel is a trademark of MCDM Productions, LLC.
