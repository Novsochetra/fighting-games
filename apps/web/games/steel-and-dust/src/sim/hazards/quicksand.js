import { pullHero } from './quicksand-hero.js';
import { sinkRaider } from './quicksand-raiders.js';

export function createQuicksand(patches) {
  return patches.map(({ x, y }) => ({ x, y }));
}

// raiders still walking in from off screen are not in the fight yet, and a boss is too heavy a
// body for the sand to take
export function updateQuicksand(game) {
  if (!game.quicksand.length) {
    return;
  }

  for (const fighter of game.fighters.slice()) {
    if (fighter.entering || fighter.removed || fighter.def.boss) {
      continue;
    }

    if (fighter === game.player) {
      pullHero(game, fighter);
    } else {
      sinkRaider(game, fighter);
    }
  }
}
