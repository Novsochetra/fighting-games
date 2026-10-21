import { fxLength } from '../../data/fx-sprites.js';

// a one-shot effect strip that only plays and strikes nothing; drawn facing left for direction -1
export function addBurst(game, { sprite, x, y, scale, direction = 1 }) {
  game.summons.push({ kind: 'burst', sprite, x, y, scale, direction, time: 0 });
}

export function updateBurst(_game, burst) {
  burst.done = burst.time >= fxLength(burst.sprite);
}
