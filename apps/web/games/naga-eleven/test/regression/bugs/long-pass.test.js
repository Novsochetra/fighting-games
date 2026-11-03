import { describe, expect, it } from 'vitest';
import { holdBallAt, matchInPlay, only, playTicks, playUntil } from '../../support/match-driver.js';

// a held pass to a free mate up the pitch was almost never his: it was aimed where he stood and
// not where he would be, landed far off him, and the mate, handed to the player, ran wherever the
// stick still pointed instead of onto the ball, or headed it on to someone else
const MIDDLE = 540;
const SEEDS = [1, 2, 3, 4, 5, 6, 7, 8];

function longBallScene(seed) {
  const match = matchInPlay(seed, { format: '11' });
  const passer = holdBallAt(match, { x: 500, y: MIDDLE });
  const mate = Object.assign(match.players[10], { x: 1050, y: MIDDLE - 100, vx: 0, vy: 0 });

  only(match, [passer.index, mate.index, 11, 12, 13]);
  Object.assign(match.players[12], { x: 1190, y: MIDDLE - 80, stun: 0, noPickup: 0 });
  Object.assign(match.players[13], { x: 1170, y: MIDDLE + 80, stun: 0, noPickup: 0 });
  Object.assign(match.players[11], { stun: 0, noPickup: 0 });

  return { match, mate };
}

// the player holds pass with the stick toward the mate, lets go of pass, and either keeps the
// stick there or lets go of it too
function holdPassToward(match, stickAfter) {
  playTicks(match, 1, { held: { pass: true, right: true }, pressed: { pass: true } });
  playTicks(match, 20, { held: { pass: true, right: true } });
  playTicks(match, 1, { held: { pass: false, right: stickAfter } });
}

function caughtBy(seed, stickAfter) {
  const { match, mate } = longBallScene(seed);

  holdPassToward(match, stickAfter);
  playUntil(match, (each) => each.ball.owner !== null || each.phase !== 'play', 300);

  return match.ball.owner === mate.index;
}

describe('a held pass to a free mate thirty metres up the pitch', () => {
  it('is his most of the time when the player keeps the stick on', () => {
    const caught = SEEDS.filter((seed) => caughtBy(seed, true));

    expect(caught.length).toBeGreaterThanOrEqual(6);
  });

  it('is his most of the time when the player lets go of the stick', () => {
    const caught = SEEDS.filter((seed) => caughtBy(seed, false));

    expect(caught.length).toBeGreaterThanOrEqual(6);
  });
});
