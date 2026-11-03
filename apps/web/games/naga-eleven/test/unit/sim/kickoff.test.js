import { describe, expect, it } from 'vitest';
import { PHASE_TICKS } from '../../../src/data/tuning.js';
import { createMatch } from '../../../src/sim/create-match.js';
import { kickerOf } from '../../../src/sim/formation.js';
import { kickoffTick, setKickoff } from '../../../src/sim/kickoff.js';

describe('a kick off', () => {
  it('puts the ball on the centre spot and each side in its place, play stopped', () => {
    const match = createMatch({ seed: 1, humanTeam: 0 });

    setKickoff(match, 1);

    expect(match).toMatchObject({ phase: 'kickoff', kickoffTeam: 1 });
    expect(match.restart).toMatchObject({ kind: 'kickoff', team: 1, x: 900, y: 540 });
    expect(match.ball).toMatchObject({ x: 900, y: 540, owner: null });
    expect(match.players.every((player) => player.vx === 0 && player.stun === 0)).toBe(true);
    expect(match.players[match.controlled].team).toBe(0);
  });

  it('hands the human the kicker at their own kick off', () => {
    const match = createMatch({ seed: 1, humanTeam: 0, format: '7' });

    setKickoff(match, 0);

    expect(match.controlled).toBe(kickerOf(match, 0).index);
  });

  it('gives the kicker the ball and blows the whistle once the pause is over', () => {
    const match = createMatch({ seed: 1 });

    match.phaseTicks = PHASE_TICKS.kickoff - 1;
    kickoffTick(match);
    expect(match.phase).toBe('kickoff');

    match.phaseTicks = PHASE_TICKS.kickoff;
    kickoffTick(match);

    expect(match.phase).toBe('play');
    expect(match.ball.owner).toBe(kickerOf(match, 0).index);
    expect(match.restart).toBe(null);
    expect(match.events).toEqual([{ type: 'whistle', kind: 'kickoff', half: 1 }]);
  });
});
