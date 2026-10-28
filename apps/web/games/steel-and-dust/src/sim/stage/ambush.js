import { BURROW, DROP } from '../../data/ambush.js';
import { onScreen, screenEdges } from '../fighters/arena-bounds.js';
import { markDrop } from '../hazards/drop-marks.js';
import { burrowAt } from '../hazards/mounds.js';

const DROP_MARGIN = 18;
// in gaps from the hero: beside them on either side, then right on top of them (dodge it), then
// further out
const DROP_SPOTS = [-1, 1, 0, -2, 2];

// where the `slot`-th raider of a wave drops, round the hero wherever they stand
export function dropSpot(game, slot) {
  const gaps = DROP_SPOTS[slot % DROP_SPOTS.length];

  return onScreen(game, game.player.x + gaps * DROP.gap, DROP_MARGIN);
}

// where the `slot`-th raider of a wave digs in, at the screen's edges in turn
export function burrowSpot(game, slot) {
  const { left, right } = screenEdges(game);

  return slot % 2 ? right - BURROW.inset : left + BURROW.inset;
}

export function startAmbush(game, { kind, ambush, slot }) {
  if (ambush === 'drop') {
    markDrop(game, { kind, x: dropSpot(game, slot) });
  } else {
    burrowAt(game, { kind, x: burrowSpot(game, slot) });
  }
}

const isWaiting = (shot) =>
  (shot.kind === 'dropMark' && !shot.raider) || (shot.kind === 'mound' && !shot.eruptAt);

// raiders still in the trees or under the sand
export function pendingAmbushes(game) {
  return game.projectiles.filter(isWaiting).length;
}
