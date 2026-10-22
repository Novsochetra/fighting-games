import { randomBetween } from '../../lib/math.js';
import { screenEdges } from '../fighters/arena-bounds.js';
import { dropBoulder } from '../hazards/boulders.js';

// which boulder of the rockfall drops on this tick of the move, or -1
export function rockfallIndex(move, time) {
  const { count, every } = move.rockfall;
  const since = time - move.startup;
  const index = since / every;
  return since >= 0 && since % every === 0 && index < count ? index : -1;
}

// every other boulder falls on the spot the hero stands on, the rest anywhere on the screen
export function dropRockfall(game, boss, index) {
  const { left, right } = screenEdges(game);
  const x = index % 2 === 0 ? game.player.x : randomBetween(left + 16, right - 16);
  dropBoulder(game, { x, side: boss.side });
}
