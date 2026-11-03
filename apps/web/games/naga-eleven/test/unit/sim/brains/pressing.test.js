import { describe, expect, it } from 'vitest';
import { AI } from '../../../../src/data/tuning.js';
import { pressIntent } from '../../../../src/sim/brains/pressing.js';
import { distance, segmentGap } from '../../../../src/sim/vector.js';
import { holdBallAt, matchInPlay } from '../../../support/match-driver.js';

// the first presser, facing the carrier from a step off, asked often what he does
function tacklesOn(match, carrier, { holding, tries = 400 }) {
  const presser = Object.assign(match.players[match.sides[0].length + 3], {
    x: carrier.x + 26,
    y: carrier.y,
    facing: { x: -1, y: 0 },
    recover: 0,
  });
  let tackles = 0;

  for (let i = 0; i < tries; i += 1) {
    carrier.holding = holding;
    tackles += pressIntent(match, presser, true).action ? 1 : 0;
  }

  return tackles;
}

describe('pressing the carrier', () => {
  it('gives the player a moment with a ball they have just taken', () => {
    const match = matchInPlay(6);
    const carrier = holdBallAt(match, { x: 700, y: 540 });

    expect(tacklesOn(match, carrier, { holding: AI.graceTicks - 1 })).toBe(0);
    expect(tacklesOn(match, carrier, { holding: AI.graceTicks + 30 })).toBeGreaterThan(0);
  });

  it('goes in on the player less often than the computer goes in on itself', () => {
    const steeredMatch = matchInPlay(6);
    const computerMatch = matchInPlay(6, { humanTeam: null });
    const onPlayer = tacklesOn(steeredMatch, holdBallAt(steeredMatch, { x: 700, y: 540 }), {
      holding: 200,
      tries: 3000,
    });
    const onComputer = tacklesOn(
      computerMatch,
      holdBallAt(computerMatch, { x: 700, y: 540 }, computerMatch.players[9]),
      { holding: 200, tries: 3000 },
    );

    expect(onPlayer).toBeLessThan(onComputer * 0.85);
  });

  it('lets the computer’s own carrier have a ball he has just won a moment too', () => {
    const match = matchInPlay(6, { humanTeam: null });
    const carrier = holdBallAt(match, { x: 700, y: 540 }, match.players[9]);

    expect(tacklesOn(match, carrier, { holding: AI.takeGraceTicks - 1 })).toBe(0);
  });

  it('goes in on nobody again straight after a tackle he rode, unless he stands on the ball', () => {
    const match = matchInPlay(6, { humanTeam: null });
    const carrier = holdBallAt(match, { x: 700, y: 540 }, match.players[9]);

    carrier.respite = 10;

    expect(tacklesOn(match, carrier, { holding: 200 })).toBe(0);

    carrier.still = AI.standTicks + 1;

    expect(tacklesOn(match, carrier, { holding: 200 })).toBeGreaterThan(0);
  });

  it('sends the second presser into the way of the pass the carrier faces', () => {
    const match = matchInPlay(6, { humanTeam: null });
    const carrier = holdBallAt(match, { x: 700, y: 540 }, match.players[9]);
    const mate = Object.assign(match.players[10], { x: 900, y: 540, stun: 0 });
    const second = Object.assign(match.players[15], { x: 760, y: 700 });
    const { move } = pressIntent(match, second, false);
    const spot = { x: second.x + move.x * 60, y: second.y + move.y * 60 };

    expect(segmentGap(carrier, mate, spot).gap).toBeLessThan(distance(second, carrier) * 0.6);
  });
});
