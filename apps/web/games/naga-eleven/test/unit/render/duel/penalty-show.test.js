import { describe, expect, it } from 'vitest';

import { UNIT } from '../../../../src/render/duel/layout.js';
import { penaltyHitTest } from '../../../../src/render/duel/penalty-hit.js';
import {
  createPenaltyShow,
  humanPart,
  isPenaltyShowDone,
  sweepOf,
  updatePenaltyShow,
} from '../../../../src/render/duel/penalty-show.js';
import { createShootout } from '../../../../src/sim/duel/index.js';
import { fakeMatch } from '../../../support/duel-fixtures.js';

function play(show, press) {
  const stages = new Set();

  for (let i = 0; i < 20000 && !isPenaltyShowDone(show); i += 1) {
    updatePenaltyShow(show, { pressed: press(show) });
    stages.add(show.stage);
  }

  return stages;
}

describe('the penalty show', () => {
  it('lets the human aim, strike and dive, and plays the shootout to its end', () => {
    const match = fakeMatch({ seed: 9 });
    const show = createPenaltyShow(createShootout(match), { match });
    const stages = play(show, (each) => ({
      pass: ['aim', 'power', 'dive'].includes(each.stage) && each.stageTicks === 15,
    }));

    expect([...stages]).toEqual(
      expect.arrayContaining(['ready', 'aim', 'power', 'dive', 'kick', 'result', 'over', 'done']),
    );
    expect(show.shootout.over).toBe(true);
  });

  it('runs itself with nobody to choose', () => {
    const show = createPenaltyShow(createShootout(fakeMatch({ humanTeam: null })));

    expect([...play(show, () => ({}))]).not.toContain('aim');
    expect(humanPart(show)).toBeNull();
  });

  it('picks a third of the goal with a tap', () => {
    const show = createPenaltyShow(createShootout(fakeMatch()));

    show.stage = 'aim';

    expect(penaltyHitTest(show, { x: 60 * UNIT, y: 60 * UNIT })).toEqual({ aim: -1 });
    expect(penaltyHitTest(show, { x: 128 * UNIT, y: 60 * UNIT })).toEqual({ aim: 0 });
    expect(penaltyHitTest(show, { x: 200 * UNIT, y: 60 * UNIT })).toEqual({ aim: 1 });
    expect(penaltyHitTest(show, { x: 128 * UNIT, y: 140 * UNIT })).toBeNull();
  });

  it('sweeps its gauge up and down between empty and full', () => {
    expect(sweepOf(0)).toBe(0);
    expect(sweepOf(40)).toBe(1);
    expect(sweepOf(80)).toBe(0);
  });
});
