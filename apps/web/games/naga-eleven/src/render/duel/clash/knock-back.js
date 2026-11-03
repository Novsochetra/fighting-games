import { clamp01, easeOut, lerp } from '../hash.js';
import { DEFENDER, GROUND } from '../paths.js';
import { SLID } from './trip-over.js';

const LANDS = 8;
const THROWN = 28;
const HOP = 4;

const thrownTo = (scene, since) =>
  Math.round(scene.impact.x - 16 - THROWN * easeOut(since / LANDS));

// he lies the way he was thrown, head first
function dribbler(scene) {
  const since = Math.max(0, scene.sinceHit);
  const at = { pose: 'fallen', x: thrownTo(scene, since), y: GROUND };

  if (since < LANDS) {
    return { ...at, sheet: 'knocked', frame: since < 4 ? 0 : 1, facing: 1 };
  }

  return { ...at, sheet: 'trip', frame: 7, facing: -1 };
}

const restOf = (scene) => (scene.defend.kind === 'tackle' ? SLID : DEFENDER.x);

function winner(scene, acting) {
  const since = scene.sinceHit;
  const at = { x: restOf(scene), y: GROUND, facing: -1 };

  if (since < LANDS) {
    return acting;
  }

  if (acting.pose === 'slide' && since < LANDS + 6) {
    return { ...at, pose: 'run', sheet: 'rise' };
  }

  return { ...at, pose: 'stand' };
}

function ball(scene) {
  const share = clamp01(scene.sinceHit / 10);

  return {
    x: lerp(scene.impact.x, restOf(scene) - 15, easeOut(share)),
    y: lerp(scene.impact.y, GROUND - 5, share) - Math.sin(Math.PI * share) * HOP,
  };
}

// he is thrown back on his own side and the ball stays on the tackler's, so the two never cross
export const KNOCK_BACK = {
  dribbler,
  winner,
  ball,
  lands: LANDS,
  landing: (scene) => thrownTo(scene, LANDS),
};
