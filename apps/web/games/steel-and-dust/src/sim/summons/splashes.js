import { fxLength } from '../../data/fx-sprites.js';
import { MOAT_SPLASH } from '../../data/moat.js';

// water bursting up out of the moat where a body fell in; drawn with the water, behind the road,
// so the banks' rock faces stand in front of it
export function addSplash(game, { x, y }) {
  game.summons.push({ kind: 'splash', x, y, scale: MOAT_SPLASH.scale, time: 0 });
}

export function updateSplash(_game, splash) {
  splash.done = splash.time >= fxLength('splash');
}
