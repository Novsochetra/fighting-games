import { describe, expect, it } from 'vitest';
import { drainEvents } from '../../../src/sim/events.js';
import { tick } from '../../../src/sim/tick.js';
import { holdBallAt, matchInPlay, only, playTicks, playUntil } from '../../support/match-driver.js';

// a tap of pass as a pass reached the mate was read as "take another man": control jumped to
// someone else for a tick or two and no pass was played, so passing first time never worked
function passComing(seed) {
  const match = matchInPlay(seed, { format: '11' });
  const middle = match.pitch.width / 2;
  const passer = holdBallAt(match, { x: 600, y: middle }, match.players[6]);
  const mate = Object.assign(match.players[9], { x: 820, y: middle, vx: 0, vy: 0, stun: 0 });
  const third = Object.assign(match.players[8], { x: 1000, y: middle - 200, vx: 0, vy: 0 });

  only(match, [passer.index, mate.index, third.index, 11]);
  match.controlled = passer.index;
  playTicks(match, 1, { held: { pass: true, right: true }, pressed: { pass: true } });
  playTicks(match, 1, { held: { pass: false, right: false } });
  playUntil(match, (each) => Math.hypot(each.ball.x - mate.x, each.ball.y - mate.y) < 40, 200);

  return { match, mate };
}

describe('a tap of pass as a pass reaches the mate', () => {
  it.each([1, 2, 3, 4, 5])('plays it on first time along the stick (seed %i)', (seed) => {
    const { match, mate } = passComing(seed);
    const steeredBefore = match.controlled;
    let passed = false;

    playTicks(match, 1, { held: { pass: true, right: true, up: true }, pressed: { pass: true } });

    expect(match.controlled).toBe(steeredBefore);

    playTicks(match, 1, { held: { pass: false, right: false, up: false } });

    for (let i = 0; i < 40 && !passed; i += 1) {
      tick(match);
      passed = drainEvents(match).some(
        (event) => event.type === 'pass' && event.player === mate.index,
      );
    }

    expect(steeredBefore).toBe(mate.index);
    expect(passed).toBe(true);
  });
});
