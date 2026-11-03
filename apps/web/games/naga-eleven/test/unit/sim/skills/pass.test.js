import { describe, expect, it } from 'vitest';
import { SKILL_PLAY } from '../../../../src/data/skills.js';
import { playSkillPass } from '../../../../src/sim/skills/pass.js';
import { holdBallAt, matchInPlay, only, playUntil } from '../../../support/match-driver.js';

const DUO = { move: 'kite-header', shares: { striker: 25, partner: 25 } };

describe('a skill pass', () => {
  it('goes to the mate it is played to, cut out only by a man near him', () => {
    const match = matchInPlay(3);
    const passer = holdBallAt(match, { x: 700, y: 540 }, match.players[6]);
    const mate = Object.assign(match.players[9], { x: 1000, y: 540, vx: 0, vy: 0 });
    const inTheWay = Object.assign(match.players[16], { x: 850, y: 540, stun: 0, noPickup: 0 });

    only(match, [passer.index, mate.index, inTheWay.index]);
    passer.spirit = 60;
    playSkillPass(match, passer, { move: 'apsara-curl', target: mate.index });
    playUntil(match, (each) => each.ball.owner !== null, 200);

    expect(match.ball.owner).toBe(mate.index);
  });

  it('is two steps of the pass combo and pays its cost', () => {
    const match = matchInPlay(3);
    const passer = holdBallAt(match, { x: 700, y: 540 }, match.players[6]);

    passer.spirit = 60;
    playSkillPass(match, passer, { move: 'apsara-curl', target: 9 });

    expect(match.comboPass).toMatchObject({ passer: 6, steps: SKILL_PLAY.pass.steps });
    expect(match.ball.skillPass).toMatchObject({ receiver: 9, cross: false });
    expect(passer.spirit).toBe(20);
  });

  it('plays a cross in the air, and for a duo pays the partner’s share and marks the striker', () => {
    const match = matchInPlay(3);
    const wing = holdBallAt(match, { x: 1400, y: 900 }, match.players[8]);

    wing.spirit = 60;
    playSkillPass(match, wing, { move: 'kite-cross', target: 9, duo: DUO });

    expect(match.ball.vz).toBeGreaterThan(0);
    expect(match.ball.skillPass).toMatchObject({ receiver: 9, cross: true });
    expect(match.duoPass).toMatchObject({ move: 'kite-header', striker: 9, partner: 8 });
    expect(wing.spirit).toBe(35);
  });
});
