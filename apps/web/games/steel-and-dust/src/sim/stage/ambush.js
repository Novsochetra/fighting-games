import { BURROW, DROP } from '../../data/ambush.js';
import { onScreen, screenEdges } from '../fighters/arena-bounds.js';
import { markDrop } from '../hazards/drop-marks.js';
import { burrowAt } from '../hazards/mounds.js';
import { findPerch, perchesOf, perchX } from '../hazards/drop-perches.js';
import { nextTurn, perchesTaken } from '../hazards/perch-turns.js';
import { spawnEnemy } from './spawn-enemy.js';

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

// a road with perches has its raiders wait on the place nearest their spot with room for them,
// or wait their turn on one taken; with none in sight they walk in as any raider does
function dropIn(game, { kind, slot }) {
  const x = dropSpot(game, slot);

  if (!perchesOf(game)) {
    markDrop(game, { kind, x });
    return;
  }

  const perch = findPerch(game, x, perchesTaken(game));
  const turn = perch ? { perch, delay: 0 } : nextTurn(game, x);

  if (turn) {
    markDrop(game, { kind, x: perchX(game, turn.perch), ...turn });
  } else {
    spawnEnemy(game, kind, slot % 2 ? 1 : -1);
  }
}

export function startAmbush(game, { kind, ambush, slot }) {
  if (ambush === 'drop') {
    dropIn(game, { kind, slot });
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
