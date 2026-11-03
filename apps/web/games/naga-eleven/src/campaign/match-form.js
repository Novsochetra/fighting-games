import { isHeroSlot } from './teams.js';

const STAT_FLOOR = 1;

const STAT_CEILING = 99;

const shiftedStats = (stats, points) =>
  Object.fromEntries(
    Object.entries(stats ?? {}).map(([name, value]) => [
      name,
      Math.min(STAT_CEILING, Math.max(STAT_FLOOR, value + points)),
    ]),
  );

// a match can field a side above or below its table (Brazil at their very best the first time
// Sochetra meets them, his teammates nervous at their first World Championship), so the tables
// stay inside their README bands and every other match plays them as they are. Sochetra himself
// always plays as the save has him: his level is the player's own
export function inForm(spec, form) {
  if (!spec || !form?.stats) {
    return spec;
  }

  return {
    ...spec,
    players: spec.players.map((player) =>
      isHeroSlot(player) ? player : { ...player, stats: shiftedStats(player.stats, form.stats) },
    ),
  };
}
