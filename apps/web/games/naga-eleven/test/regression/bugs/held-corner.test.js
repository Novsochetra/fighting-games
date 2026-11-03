import { describe, expect, it } from 'vitest';
import { AI, PLAYER } from '../../../src/data/tuning.js';
import { cornerGoers, cornerSpotOf } from '../../../src/sim/corner-spots.js';
import { startRestart } from '../../../src/sim/restart-setup.js';
import { distance } from '../../../src/sim/vector.js';
import { matchInPlay, playTicks, playUntil } from '../../support/match-driver.js';

// the player's corner, held for a long ball, came down at the feet of a mate in a crowd and was
// cleared every time; the taker jogged to the flag with the clock running, and a corner the
// player never took was never taken
function cornerSet(seed) {
  const match = matchInPlay(seed, { format: '11' });

  Object.assign(match.ball, {
    owner: null,
    x: match.pitch.length + 8,
    y: 30,
    vx: 1,
    vy: 0,
    lastTouch: 14,
    kick: null,
  });
  startRestart(match);

  const clockAtOut = match.clock;
  const taker = match.players[match.controlled];

  playUntil(match, (each) => each.ball.owner === taker.index && each.restart?.set, 900);

  return { match, taker, clockAtOut };
}

// the height of the ball as it passes the mate it was played to, everyone held where they stand
// so that nobody meets it on the way
function heightAtTarget(match) {
  const mate = match.players.find((player) => player.receiving > 0);
  let nearest = { gap: Infinity, z: 0 };

  for (const player of match.players) {
    Object.assign(player, { vx: 0, vy: 0, stun: 9999, noPickup: 9999 });
  }

  for (let i = 0; i < 120 && match.phase === 'play'; i += 1) {
    const gap = distance(match.ball, mate);

    nearest = gap < nearest.gap ? { gap, z: match.ball.z } : nearest;
    playTicks(match, 1);
  }

  return nearest.z;
}

// the men going up for it stand in their places, as they would after an attack
function goersInPlace(match) {
  for (const player of cornerGoers(match, 0)) {
    Object.assign(player, cornerSpotOf(match, player), { vx: 0, vy: 0 });
  }
}

describe('the player’s corner', () => {
  it.each([1, 2, 3, 4])('held for a long ball comes in at head height (seed %i)', (seed) => {
    const { match } = cornerSet(seed);

    goersInPlace(match);
    const held = { pass: true, down: true, left: true };

    playTicks(match, 1, { held, pressed: { pass: true } });
    playTicks(match, 20, { held });
    playTicks(match, 1, { held: { pass: false, down: false, left: false } });

    expect(heightAtTarget(match)).toBeGreaterThan(PLAYER.reachHeight);
  });

  it('costs no time on the clock while the taker gets to the flag', () => {
    const { match, clockAtOut } = cornerSet(5);

    expect(clockAtOut - match.clock).toBeLessThan(5);
  });

  it('is taken for the player when they leave it standing', () => {
    const { match } = cornerSet(6);

    expect(playUntil(match, (each) => each.phase === 'play', AI.restartIdle + 60)).toBe(true);
  });
});
