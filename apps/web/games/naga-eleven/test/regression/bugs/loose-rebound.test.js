import { describe, expect, it } from 'vitest';
import { interceptOf } from '../../../src/sim/brains/steering.js';
import { tick } from '../../../src/sim/tick.js';
import { matchInPlay, only, playUntil } from '../../support/match-driver.js';

// a shot parried back out of the box: control stayed on the man by the goal line, nearest the
// ball as it came off the keeper though it ran away from him, and a man the player ran at the
// rebound lost every even race for it to the computer's man
const MIDDLE = 540;

function parriedOut(seed, { ours, theirs }) {
  const match = matchInPlay(seed, { format: '11' });
  const place = (index, spot) =>
    Object.assign(match.players[index], spot, { vx: 0, vy: 0, stun: 0, noPickup: 0 });

  only(match, [7, 9, 11, 16]);
  place(9, { x: 1770, y: MIDDLE + 50 });
  place(7, ours);
  place(16, theirs);
  place(11, { x: 1790, y: MIDDLE });
  match.players[11].noPickup = 30;
  Object.assign(match.ball, {
    owner: null,
    x: 1740,
    y: MIDDLE,
    z: 8,
    vx: -6,
    vy: 0,
    vz: 2,
    lastTouch: 11,
    kick: null,
  });
  match.controlled = 9;
  match.switchCooldown = 0;

  return match;
}

// the player sprints the man he steers at where the ball can be met, with the keys' eight ways
function chase(match) {
  const keys = match.input.sources.keys.held;
  const steered = match.players[match.controlled];
  const spot = interceptOf(match, steered);

  Object.assign(keys, {
    sprint: true,
    left: spot.x < steered.x - 8,
    right: spot.x > steered.x + 8,
    up: spot.y < steered.y - 8,
    down: spot.y > steered.y + 8,
  });
  tick(match);
}

const EVEN_RACES = [1440, 1480, 1520].flatMap((x) =>
  [20, 35, 50].map((off) => ({ ours: { x, y: MIDDLE + off }, theirs: { x, y: MIDDLE - off } })),
);

describe('a shot parried back out of the box', () => {
  it.each([1, 2, 3])('hands control at once to the mate who gets to it first (seed %i)', (seed) => {
    const match = parriedOut(seed, EVEN_RACES[4]);

    playUntil(match, (each) => each.controlled !== 9 || each.ball.owner !== null, 10);

    expect(match.controlled).toBe(7);
  });

  it('goes to a man the player runs at it, in a race the computer’s man is as near for', () => {
    const won = EVEN_RACES.filter((race) => {
      const match = parriedOut(1, race);

      for (let i = 0; i < 150 && match.ball.owner === null && match.phase === 'play'; i += 1) {
        chase(match);
      }

      return match.players[match.ball.owner ?? -1]?.team === 0;
    });

    expect(won.length).toBeGreaterThanOrEqual(EVEN_RACES.length / 2);
  });
});
