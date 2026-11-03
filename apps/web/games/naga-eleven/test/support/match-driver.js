import { createMatch } from '../../src/sim/create-match.js';
import { drainEvents } from '../../src/sim/events.js';
import { tick } from '../../src/sim/tick.js';

export function playTicks(match, count, { held = {}, pressed = {} } = {}) {
  const keys = match.input.sources.keys;

  for (let i = 0; i < count; i += 1) {
    Object.assign(keys.held, held);

    if (i === 0) {
      Object.assign(match.input.pressed, pressed);
    }

    tick(match);
  }
}

export function playUntil(match, isDone, most = 600) {
  for (let i = 0; i < most; i += 1) {
    if (isDone(match)) {
      return true;
    }

    tick(match);
  }

  return isDone(match);
}

// a match of the player's against the computer, just after kick off
export function matchInPlay(seed = 1, options = {}) {
  const match = createMatch({ seed, humanTeam: 0, ...options });

  playUntil(match, (each) => each.phase === 'play');

  return match;
}

export const steered = (match) => match.players[match.controlled];

// gives the steered player the ball where the test wants them, facing the goal they attack
export function holdBallAt(match, { x, y }, player = steered(match)) {
  const facing = { x: player.team === 0 ? 1 : -1, y: 0 };

  Object.assign(player, { x, y, vx: 0, vy: 0, facing, stun: 0, noPickup: 0 });
  Object.assign(match.ball, {
    x: x + facing.x * 12,
    y,
    z: 0,
    vx: 0,
    vy: 0,
    vz: 0,
    owner: player.index,
    lastTouch: player.index,
    kick: null,
  });

  return player;
}

// clears every player off the pitch but the ones the test names
export function only(match, indices) {
  for (const player of match.players) {
    if (!indices.includes(player.index)) {
      Object.assign(player, { x: 9, y: 9, vx: 0, vy: 0, noPickup: 9999, stun: 9999 });
    }
  }
}

export function looseBallAt(match, fields) {
  Object.assign(match.ball, { owner: null, z: 0, vx: 0, vy: 0, vz: 0, kick: null }, fields);
}

// plays a whole match out, counting what the tests look at
export function playOut(match, watch = () => {}) {
  while (match.phase !== 'over') {
    tick(match);
    watch(match, drainEvents(match));
  }

  return match;
}
