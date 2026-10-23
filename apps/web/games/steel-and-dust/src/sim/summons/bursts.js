import { FX_SPRITES, fxLength } from '../../data/fx-sprites.js';
import { bodyPoint } from '../fighters/body-point.js';

// a one-shot effect strip that only plays and strikes nothing; drawn facing left for direction -1,
// and behind the fighters when `behind` is set. One that `follow`s a fighter stays on the point
// `at` on its body and loops the frames `loop` while the fighter's move has `whileMove`, then
// plays out
export function addBurst(game, { sprite, x, y, scale, direction = 1, behind = false, follow }) {
  game.summons.push({ kind: 'burst', sprite, x, y, scale, direction, behind, follow, time: 0 });
}

function followBody(burst) {
  const { fighter, at, loop, whileMove } = burst.follow;
  const { ticks } = FX_SPRITES[burst.sprite];
  if (fighter.state !== 'attack' || !fighter.move?.[whileMove]) {
    burst.follow = null;
    burst.time = Math.max(burst.time, (loop[1] + 1) * ticks);
    return;
  }
  Object.assign(burst, bodyPoint(fighter, at), { direction: fighter.facing });
  if (burst.time >= (loop[1] + 1) * ticks) {
    burst.time = loop[0] * ticks;
  }
}

export function updateBurst(_game, burst) {
  if (burst.follow) {
    followBody(burst);
  }
  burst.done = !burst.follow && burst.time >= fxLength(burst.sprite);
}
