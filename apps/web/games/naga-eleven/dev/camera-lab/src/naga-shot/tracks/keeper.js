import { KEEPER_SPOT } from '../world.js';
import { afterTicks } from './after.js';
import { phaseOf } from './ease.js';

// the dive's frames from the sheet as the keeper sees it coming: crouch and push, then flying
// (3 to 5) and down on the grass (6, 7); a goal beats him, so he goes late
const FLYING = [3, 4, 5];

const LATE = { goal: 8 };

const LIFT = { catch: 18, punch: 24, parry: 12, goal: 8, post: 4 };

function diveFrame(clock, ending) {
  if (clock.stage === 'keeper') {
    const share = phaseOf(clock.share, 0.55, 0.45);

    return share <= 0 ? null : Math.min(2, Math.floor(share * 3));
  }

  const since = afterTicks(clock) - (LATE[ending] ?? 0);

  return since < 0 ? 2 : Math.min(7, 3 + Math.floor(since / 9));
}

function liftOf(frame, ending) {
  if (!FLYING.includes(frame) && frame !== 2) {
    return 0;
  }

  const shape = { 2: 0.45, 3: 1, 4: 0.8, 5: 0.35 }[frame];

  return Math.round((LIFT[ending] ?? 10) * shape);
}

const REACH = [0, 0, 3, 8, 12, 15, 17, 18];

export function keeperAt(clock, ending) {
  const before = ['awakening', 'charge', 'manifest', 'impact', 'flight'].includes(clock.stage);
  const frame = before ? null : diveFrame(clock, ending);
  const x = KEEPER_SPOT.x - (frame === null ? 0 : REACH[frame]);
  const y = KEEPER_SPOT.y - (frame === null ? 0 : liftOf(frame, ending));
  const lying = frame !== null && frame >= 6;

  return {
    x,
    y,
    animation: frame === null ? 'idle' : 'dive',
    frame: frame ?? 0,
    direction: 'west',
    lit: litOf(clock),
    hands: { x: x - 24, y: y - (lying ? 8 : 24) },
  };
}

const LIGHT = {
  flight: (clock) => clock.share * 0.4,
  keeper: (clock) => 0.4 + clock.share * 0.6,
  collision: (clock) => 1 - phaseOf(clock.ticks, 10, 34) * 0.6,
  aftermath: (clock) => 0.4 * (1 - phaseOf(clock.share, 0, 0.4)),
};

export const litOf = (clock) => LIGHT[clock.stage]?.(clock) ?? 0;
