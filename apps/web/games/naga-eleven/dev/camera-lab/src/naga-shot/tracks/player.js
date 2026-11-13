import { NAGA_TIMINGS } from '../sequence.js';
import { KICK_SPOT } from '../world.js';
import { easeOut, phaseOf } from './ease.js';

// the share of the awakening Sochetra runs in for, the ball at his feet, before he plants
export const RUN_SHARE = 0.55;

const RUN_FROM = 76;

const pose = (animation, frame, extra = {}) => ({
  x: KICK_SPOT.x,
  y: KICK_SPOT.y,
  animation,
  frame,
  direction: 'east',
  ...extra,
});

function awakening(clock) {
  if (clock.share >= RUN_SHARE) {
    return pose('idle', 0);
  }

  const run = easeOut(clock.share / RUN_SHARE);

  return pose('run', Math.floor(clock.ticks / 4) % 6, { x: KICK_SPOT.x - RUN_FROM * (1 - run) });
}

// back-swing, then the strike a few ticks before the boot meets the ball and held through the
// hit-stop, then the follow-through
function impact(clock) {
  const { contact } = NAGA_TIMINGS;

  if (clock.ticks < contact - 3) {
    return pose('kick', 0);
  }

  return pose('kick', clock.ticks <= contact + clock.holds.hit + 4 ? 1 : 2);
}

function aftermath(clock, ending) {
  if (ending === 'goal' && clock.share > 0.2) {
    return pose('celebrate', Math.floor(clock.ticks / 6) % 8, { direction: 'south' });
  }

  return pose('idle', 0);
}

const BY_STAGE = {
  awakening,
  charge: () => pose('kick', 0),
  manifest: () => pose('kick', 0),
  impact,
  flight: (clock) => (phaseOf(clock.ticks, 0, 24) < 1 ? pose('kick', 2) : pose('idle', 0)),
  aftermath,
};

// Sochetra's pose: where his feet stand, and the frame of the game's own sprite he shows
export const playerAt = (clock, ending) =>
  (BY_STAGE[clock.stage] ?? (() => pose('idle', 0)))(clock, ending);
