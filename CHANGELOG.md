# Changelog

All notable changes to this module are listed here, newest first.

## [1.0.0] - 2026-10-31

First public release.

### Changed
- Renamed from Injury Overlay (`injury-overlay`) to Stef's Health Overlay (`stef-health-overlay`).

### Migration
- On the first load the GM's client points the injury effects already on actors (world actors and unlinked tokens)
  at this module's images. The status ids are unchanged, so existing effects keep working. Rerun with
  `game.modules.get("stef-health-overlay").api.migrateLegacy({ dryRun: true })`.

### Features
- Five injury statuses (Barely Injured, Injured, Badly Injured, Near Death, Mortally Wounded) shown as full-token
  overlays by remaining Stamina (Draw Steel) or hit points (D&D 5e).
- Mortally Wounded only for Draw Steel heroes and retainers below 0 Stamina; monsters at 0 lose the overlay.
- One overlay at a time, applied by the active GM in order per actor.
- The statuses can also be set by hand from the Token HUD.
