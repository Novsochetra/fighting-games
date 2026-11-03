import { describe, expect, it } from 'vitest';
import { act, intentOf } from '../../../src/sim/intents.js';
import { planTeams } from '../../../src/sim/team-plan.js';
import { holdBallAt, matchInPlay, steered } from '../../support/match-driver.js';

describe('what each player does', () => {
  it('comes from the human for the one steered, the computer for the rest', () => {
    const match = matchInPlay();

    planTeams(match);
    match.input.sources.keys.held.up = true;

    expect(intentOf(match, steered(match)).move).toEqual({ x: 0, y: -1 });
    expect(intentOf(match, match.players[15])).toHaveProperty('move');
  });

  it('hands a special to the duels, which may take it up', () => {
    const match = matchInPlay();
    const shooter = holdBallAt(match, { x: 1500, y: 540 });
    const asked = [];

    match.hooks = { special: (each, player) => asked.push(player.index) > 0 };
    act(match, shooter, { action: { kind: 'special', power: 1, aimY: 540 } });

    expect(asked).toEqual([shooter.index]);
    expect(match.ball.owner).toBe(shooter.index);
  });

  it('strikes a special the duels do not take up as the shot it was charged as', () => {
    const match = matchInPlay();
    const shooter = holdBallAt(match, { x: 1500, y: 540 });

    act(match, shooter, { action: { kind: 'special', power: 1, aimY: 540 } });

    expect(match.ball.owner).toBe(null);
    expect(match.ball.kick).toBe('shot');
  });
});
