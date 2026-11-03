import { describe, expect, it } from 'vitest';
import { TICKS_PER_SECOND } from '../../../src/config.js';
import { FORMATS } from '../../../src/data/formats.js';
import { createMatch } from '../../../src/sim/create-match.js';
import { createInput } from '../../../src/sim/input-state.js';
import { plainTeams } from '../../../src/sim/plain-teams.js';

describe('a new match', () => {
  it('is a quick 11 v 11 of two plain sides with no options', () => {
    const match = createMatch({ seed: 7 });

    expect(match.format).toBe('11');
    expect(match.players).toHaveLength(22);
    expect(match.pitch).toEqual(FORMATS['11'].pitch);
    expect(match).toMatchObject({ phase: 'kickoff', half: 1, minute: 0, score: [0, 0] });
    expect(match.halfTicks).toBe(FORMATS['11'].halfSeconds * TICKS_PER_SECOND);
    expect(match.restart).toMatchObject({ kind: 'kickoff', team: 0 });
    expect(match.events).toEqual([]);
  });

  it('plays the format, the teams and the half the options ask for', () => {
    const teams = plainTeams('7');
    const input = createInput();

    teams[1].name = { en: 'Royal Kids', km: 'រ៉ូយ៉ាល់' };

    const match = createMatch({
      seed: 7,
      format: '7',
      teams,
      halfSeconds: 30,
      humanTeam: 0,
      input,
    });

    expect(match.players).toHaveLength(14);
    expect(match.teams[1]).toEqual({ id: 'away', name: teams[1].name, short: 'AWY', kit: 'japan' });
    expect(match.halfTicks).toBe(30 * TICKS_PER_SECOND);
    expect(match.input).toBe(input);
    expect(match.players[match.controlled].index).toBe(FORMATS['7'].kicker);
  });

  it('keeps no hooks, so it plays with no duels attached', () => {
    expect(createMatch({ seed: 1 }).hooks).toEqual({});
  });
});

describe('a match of the game’s own teams', () => {
  it('plays the format the teams carry', () => {
    const teams = plainTeams('7').map((team) => ({ ...team, format: '7' }));

    expect(createMatch({ seed: 2, teams }).format).toBe('7');
  });
});
