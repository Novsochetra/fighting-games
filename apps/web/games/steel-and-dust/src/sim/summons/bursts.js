import { fxLength } from '../../data/fx-sprites.js';

// a one-shot effect strip that only plays and strikes nothing; drawn facing left for direction -1,
// and behind the fighters when `behind` is set
export function addBurst(game, { sprite, x, y, scale, direction = 1, behind = false }) {
  game.summons.push({ kind: 'burst', sprite, x, y, scale, direction, behind, time: 0 });
}

export function updateBurst(_game, burst) {
  burst.done = burst.time >= fxLength(burst.sprite);
}
