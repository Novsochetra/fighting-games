// the passes a side plays in its combo, for the Mekong Current's river to run along: the last
// few, none older than RIVER_TICKS, dropped when the combo breaks
const RIVER_TICKS = 400;
const MOST_PASSES = 6;

export function notePass(effects, match, passer) {
  const player = match.players[passer];
  const passes = effects.passes[player?.team];

  if (passes) {
    passes.push({ x: player.x, y: player.y, z: 0, tick: match.tick });
    passes.splice(0, Math.max(0, passes.length - MOST_PASSES));
  }
}

export function passesOf(effects, match, player) {
  const passes = effects.passes[match.players[player]?.team] ?? [];

  return passes.filter((pass) => match.tick - pass.tick < RIVER_TICKS).map((pass) => ({ ...pass }));
}

export const dropPasses = (effects, team) => effects.passes[team]?.splice(0);
