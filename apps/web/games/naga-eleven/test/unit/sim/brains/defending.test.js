import { describe, expect, it } from 'vitest';
import { defendIntent, defensivePlaceOf } from '../../../../src/sim/brains/defending.js';
import { planTeams } from '../../../../src/sim/team-plan.js';
import { distance } from '../../../../src/sim/vector.js';
import { holdBallAt, matchInPlay } from '../../../support/match-driver.js';

function attackAt(spot) {
  const match = matchInPlay(5, { humanTeam: null });
  const carrier = holdBallAt(match, spot, match.players[20]);

  Object.assign(match.players[19], { x: spot.x - 150, y: 300 });
  Object.assign(match.players[21], { x: spot.x - 150, y: 800 });
  planTeams(match);

  return { match, carrier, plan: match.plans[0] };
}

describe('the side without the ball', () => {
  it('closes the carrier down from the goal side, sprinting from far', () => {
    const { match, carrier, plan } = attackAt({ x: 700, y: 540 });
    const presser = match.players[plan.pressers[0]];

    Object.assign(presser, { x: 400, y: 540 });

    const intent = defendIntent(match, presser, plan);

    expect(intent.move.x).toBeGreaterThan(0.9);
    expect(intent.sprint).toBe(true);
    expect(carrier.x).toBe(700);
  });

  it('tackles a carrier in reach now and then, once he has had the ball a moment', () => {
    const { match, carrier, plan } = attackAt({ x: 700, y: 540 });
    const presser = match.players[plan.pressers[0]];
    let tackles = 0;

    Object.assign(presser, { x: 676, y: 540, facing: { x: 1, y: 0 }, recover: 0 });
    carrier.holding = 60;

    for (let i = 0; i < 200; i += 1) {
      tackles += defendIntent(match, presser, plan).action ? 1 : 0;
    }

    expect(tackles).toBeGreaterThan(3);
    expect(tackles).toBeLessThan(100);
  });

  it('marks goal side of a man, and covers behind the presser', () => {
    const { match, plan } = attackAt({ x: 700, y: 540 });
    const [markerIndex, markIndex] = Object.entries(plan.marks)[0];
    const mark = match.players[markIndex];
    const spot = defensivePlaceOf(match, match.players[markerIndex], plan);

    expect(spot.x).toBeLessThan(mark.x + 40);

    const cover = defensivePlaceOf(match, match.players[plan.cover], plan);
    const presser = match.players[plan.pressers[0]];

    expect(cover.x).toBeLessThan(presser.x);
    expect(distance(cover, presser)).toBeLessThan(100);
  });

  it('keeps its defenders from stepping up past the back line', () => {
    const { match, plan } = attackAt({ x: 1300, y: 540 });

    for (const defender of match.sides[0].filter((player) => player.role === 'defender')) {
      if (plan.cover !== defender.index && !plan.pressers.includes(defender.index)) {
        expect(defensivePlaceOf(match, defender, plan).x).toBeLessThanOrEqual(
          plan.line + 0.031 * 1800,
        );
      }
    }
  });
});
