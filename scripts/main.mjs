import { registerLegacyMigration } from "./legacy-migration.mjs";

const MODULE_ID = "stef-health-overlay";

const INJURY_EFFECTS = [
  { id: "barely-injured",     name: "Barely Injured" },
  { id: "injured",            name: "Injured" },
  { id: "badly-injured",      name: "Badly Injured" },
  { id: "critically-injured", name: "Near Death" },
  { id: "mortally-wounded",   name: "Mortally Wounded" }
];

const INJURY_IDS = INJURY_EFFECTS.map(e => e.id);

// Per-system health pool. `path` is used both as the updateActor gate and as the
// read location, since every supported system exposes { value, max } there.
// `zeroTier` picks the overlay for value <= 0 given that pool, or null to clear.
const SYSTEMS = {
  // dnd5e clamps HP at 0 and has no below-zero state.
  "dnd5e": {
    path: "system.attributes.hp",
    zeroTier: () => null
  },
  // Draw Steel gives only heroes and retainers a negative floor
  // (stamina.min = -winded); NPCs and objects keep min 0 and are clamped there,
  // so reaching 0 means dead rather than dying and must not show the overlay.
  // Note the system's own auto-managed status at this threshold is already
  // called "dying", hence the different id here.
  "draw-steel": {
    path: "system.stamina",
    zeroTier: pool => (pool.min < 0 ? "mortally-wounded" : null)
  }
};

function getInjuryStatusId(value, max, zeroTier) {
  if (value <= 0) return zeroTier;

  const pct = value / max;
  if (pct >= 0.75 && pct < 0.95) return "barely-injured";
  if (pct >= 0.50 && pct < 0.75) return "injured";
  if (pct >= 0.25 && pct < 0.50) return "badly-injured";
  if (pct < 0.25) return "critically-injured";
  return null;
}

function registerInjuryStatuses() {
  for (const def of INJURY_EFFECTS) {
    if (CONFIG.statusEffects[def.id]) continue;
    CONFIG.statusEffects[def.id] = { ...def, img: `modules/${MODULE_ID}/assets/${def.id}.webp` };
  }
}

// The module was called Injury Overlay before 1.0. It stored no
// settings or flags, but the injury effects already on actors carry the old image path.
const legacy = registerLegacyMigration({
  moduleId: MODULE_ID, legacyIds: ["injury-overlay"], version: "1.0.0",
  extra: async ({ report, update, allDocuments }) => {
    const oldPrefix = "modules/injury-overlay/assets/";
    let count = 0;
    for (const doc of allDocuments()) {
      if (doc.documentName !== "ActiveEffect") continue;
      const img = doc._source?.img;
      if (typeof img !== "string" || !img.startsWith(oldPrefix)) continue;
      const changes = { img: `modules/${MODULE_ID}/assets/${img.slice(oldPrefix.length)}` };
      if (await update(doc, changes)) count += 1;
    }
    if (count) report.extra.push(`injury effect images repointed to modules/${MODULE_ID}/assets/: ${count}`);
  }
});

Hooks.once("init", () => {
  game.modules.get(MODULE_ID).api = { migrateLegacy: legacy.migrate };
});

// Registered on setup rather than init: Draw Steel rebuilds CONFIG.statusEffects
// from scratch during init, deleting every entry not on its whitelist.
Hooks.once("setup", registerInjuryStatuses);

// Per-actor promise chain so rapid successive HP updates are processed
// sequentially. Foundry does not await hook callbacks, so without this the
// async body would run concurrently with itself, reading stale actor.statuses
// and leaving multiple injury overlays active at once.
const injuryQueues = new Map(); // actor.id -> Promise

Hooks.on("updateActor", (actor, changes) => {
  if (game.user !== game.users.activeGM) return;

  const cfg = SYSTEMS[game.system.id];
  if (!cfg) return;
  if (!foundry.utils.hasProperty(changes, cfg.path)) return;

  const run = (injuryQueues.get(actor.id) ?? Promise.resolve())
    .then(() => applyInjuryOverlay(actor, cfg))
    .catch(err => console.error(`${MODULE_ID} |`, err))
    .finally(() => { if (injuryQueues.get(actor.id) === run) injuryQueues.delete(actor.id); });

  injuryQueues.set(actor.id, run);
});

async function applyInjuryOverlay(actor, cfg) {
  // Draw Steel declares stamina.value nullable with initial null, and its party
  // actors have no stamina at all, so neither field can be assumed present.
  const pool = foundry.utils.getProperty(actor, cfg.path) ?? {};
  const { value, max } = pool;
  if (typeof value !== "number" || !max) return;

  const targetId = getInjuryStatusId(value, max, cfg.zeroTier(pool));

  for (const id of INJURY_IDS) {
    if (id === targetId) continue;
    if (actor.statuses.has(id)) await actor.toggleStatusEffect(id, { active: false });
  }

  if (targetId && !actor.statuses.has(targetId)) {
    await actor.toggleStatusEffect(targetId, { active: true, overlay: true });
  }
}
