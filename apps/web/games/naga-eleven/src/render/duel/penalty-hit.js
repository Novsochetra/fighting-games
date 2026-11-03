import { UNIT } from './layout.js';
import { PEN_GOAL } from './penalty-layout.js';

// a tap on the goal picks the third of it under the finger: { aim: -1 | 0 | 1 }; during the
// power gauge any tap lets fly
export function penaltyHitTest(show, point) {
  const x = point.x / UNIT;
  const y = point.y / UNIT;

  if (show.stage === 'power') {
    return { aim: show.cursor - 1, power: true };
  }

  const picking = show.stage === 'aim' || show.stage === 'dive';
  const inside =
    x >= PEN_GOAL.left && x < PEN_GOAL.right && y >= PEN_GOAL.bar - 10 && y < PEN_GOAL.line + 10;

  if (!picking || !inside) {
    return null;
  }

  const third = (PEN_GOAL.right - PEN_GOAL.left) / 3;

  return { aim: Math.min(2, Math.floor((x - PEN_GOAL.left) / third)) - 1 };
}
