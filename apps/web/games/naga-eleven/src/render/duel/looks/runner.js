import { drawAfterimage } from '../figure.js';
import { lerp } from '../hash.js';
import { GROUND } from '../paths.js';

export const runFrame = (tick) => (Math.floor(tick / 5) % 2 === 0 ? 'run' : 'run2');

// where a dribbler is at a share of the way after the moves met: on past the defender, or down
export function runnerAt(scene, after = scene.after) {
  if (!scene.hit) {
    return { pose: runFrame(scene.tick), x: scene.ball.x - 16, y: GROUND, facing: 1 };
  }

  if (!scene.attackWins) {
    return { pose: 'fallen', x: scene.impact.x - 30, y: GROUND, facing: 1 };
  }

  return {
    pose: runFrame(scene.tick),
    x: lerp(scene.impact.x - 16, 240, after),
    y: GROUND,
    facing: 1,
  };
}

// copies of the dribbler left behind, fading the further back they are; with the clash's `cast`
// ({ show, actors }) they are his own frames in the move's tint
export function trailOf(pen, { at, count, gap, tint, cast }) {
  for (let i = count; i >= 1; i -= 1) {
    drawAfterimage(pen, {
      ...at(i),
      body: tint.body,
      rim: tint.rim,
      alpha: (0.55 * (count + 1 - i)) / (count + 1),
      ...cast,
      side: 'attack',
    });
  }

  return gap;
}
