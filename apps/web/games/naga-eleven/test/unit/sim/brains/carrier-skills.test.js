import { describe, expect, it } from 'vitest';
import {
  burstDecision,
  duoPassDecision,
  withSkillPass,
  withSkillShot,
} from '../../../../src/sim/brains/carrier-skills.js';
import { AI } from '../../../../src/data/tuning.js';
import { attachDuels } from '../../../../src/sim/duel/index.js';
import { holdBallAt, matchInPlay } from '../../../support/match-driver.js';

const SHOT = { kind: 'shoot', power: 0.7, aimY: 540, aimZ: 10 };

// the computer's side (team 1), its forward with the ball in range of team 0's goal
function computerForward(fields = {}, seed = 1) {
  const match = attachDuels(matchInPlay(seed));
  const forward = holdBallAt(match, { x: 380, y: 540 }, match.players[20]);

  Object.assign(forward, { spirit: 100, ...fields });

  return { match, forward };
}

const kindsOver = (make, decide) =>
  new Set(Array.from({ length: 30 }, (_, i) => decide(make(i + 1))?.kind ?? null));

describe('the computer’s carrier and his skills', () => {
  it('strikes his shot skill in the open about half the time he shoots', () => {
    const kinds = kindsOver(
      (seed) => computerForward({}, seed),
      ({ match, forward }) => withSkillShot(match, forward, SHOT),
    );

    expect(kinds).toEqual(new Set(['skillShot', 'shoot']));
  });

  it('lets a special go for the duel when one is on offer, and shoots plain with nothing', () => {
    const kinds = kindsOver(
      (seed) => computerForward({ star: 'haruto', skill: null, moves: ['silent-moon'] }, seed),
      ({ match, forward }) => withSkillShot(match, forward, SHOT),
    );

    expect(kinds.has('special')).toBe(true);

    const { match, forward } = computerForward({ spirit: 0 });

    expect(withSkillShot(match, forward, SHOT)).toBe(SHOT);
  });

  it('plays some of his long balls as his skill, never a short one', () => {
    const pass = { kind: 'pass', target: 19, lofted: true };
    const kinds = kindsOver(
      (seed) => computerForward({ skill: 'curl-pass' }, seed),
      ({ match, forward }) => withSkillPass(match, forward, pass),
    );
    const { match, forward } = computerForward({ skill: 'curl-pass' });

    expect(kinds).toEqual(new Set(['skillPass', 'pass']));
    expect(withSkillPass(match, forward, { ...pass, lofted: false }).kind).toBe('pass');
  });

  it('weighs a dribble skill once as a man comes at him, and a duo’s pass once as he settles', () => {
    const { match, forward } = computerForward({
      star: 'rafael',
      skill: null,
      moves: ['samba-mirage'],
    });

    Object.assign(match.players[2], { x: 340, y: 540 });
    forward.facing = { x: -1, y: 0 };
    burstDecision(match, forward);

    expect(forward.dribbleLook).toBe(match.tick);
    expect(burstDecision(match, forward)).toBeNull();

    forward.holding = AI.firstTouchTicks + 1;
    expect(duoPassDecision(match, forward)).toBeNull();
  });
});
