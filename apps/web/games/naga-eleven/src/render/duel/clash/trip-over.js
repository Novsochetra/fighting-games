import { clamp01, easeOut } from '../hash.js';
import { DEFENDER, GROUND } from '../paths.js';

// the frames of the dive a tripped dribbler goes through, from the tick after the tackle each
// starts at: he pitches forward off his feet, flies flat over the slide, comes down on his chest,
// then lies flat on the grass
const TRIP = [
  [0, 2],
  [3, 4],
  [7, 5],
  [10, 6],
  [13, 7],
];

const LANDS = 10;
const FLIGHT = 40;
const SKID = 6;

// how far the slide has carried the tackler as the ball meets him, closing from DEFENDER.x
export const slideReach = (approach) => Math.round((Math.min(approach, 1) - 0.55) * 24);

export const SLID = DEFENDER.x - slideReach(1);

const tripAt = (since) => TRIP.filter(([from]) => since >= from).at(-1);

const flownTo = (scene, since) => scene.impact.x - 14 + FLIGHT * clamp01(since / LANDS);

// his run carries him over the slide, so he lands beyond the tackler, clear of him
function dribbler(scene) {
  const since = Math.max(0, scene.sinceHit);
  const [, frame] = tripAt(since);

  return {
    pose: frame < 6 ? 'dive' : 'fallen',
    sheet: 'trip',
    frame,
    x: Math.round(flownTo(scene, since) + SKID * easeOut((since - LANDS) / 8)),
    y: GROUND,
    facing: 1,
  };
}

// he faces the way his side attacks, away from the man he brought down
function winner(scene) {
  const since = scene.sinceHit;
  const ball = Math.round(scene.ball.x);
  const at = { y: GROUND, facing: -1 };

  if (since < 10) {
    return { ...at, pose: 'slide', frame: 2, x: Math.min(SLID, ball + 22) };
  }

  if (since < 16) {
    return { ...at, pose: 'run', sheet: 'rise', x: ball + 22 };
  }

  return { ...at, pose: 'stand', x: ball + 15 };
}

export const TRIP_OVER = {
  dribbler,
  winner,
  lands: LANDS,
  landing: (scene) => Math.round(flownTo(scene, LANDS)),
};
