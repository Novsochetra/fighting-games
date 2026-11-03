import { describe, expect, it } from 'vitest';
import { inForm } from '../../../src/campaign/match-form.js';

const player = (id, stats, extra = {}) => ({
  id,
  name: id,
  star: null,
  moves: [],
  stats,
  ...extra,
});

const side = () => ({
  id: 'dragon-youth',
  name: 'Dragon Youth',
  players: [
    player('keeper', { speed: 60, keeping: 95, stamina: 70 }),
    player(
      'striker',
      { speed: 4, shot: 80, keeping: 12 },
      { star: 'haruto', moves: ['power-shot'] },
    ),
    player('sochetra', { speed: 70, shot: 72 }, { star: 'sochetra', hero: true }),
  ],
});

describe('a side in form', () => {
  it('plays every stat of every player that many points above its table, 99 at most', () => {
    const [keeper, striker] = inForm(side(), { stats: 6 }).players;

    expect(keeper.stats).toEqual({ speed: 66, keeping: 99, stamina: 76 });
    expect(striker.stats).toEqual({ speed: 10, shot: 86, keeping: 18 });
    expect(striker).toMatchObject({ star: 'haruto', moves: ['power-shot'] });
  });

  it('plays below its table for a form under 0, 1 at least', () => {
    const [keeper, striker] = inForm(side(), { stats: -5 }).players;

    expect(keeper.stats).toEqual({ speed: 55, keeping: 90, stamina: 65 });
    expect(striker.stats).toEqual({ speed: 1, shot: 75, keeping: 7 });
  });

  it('leaves Sochetra as the save has him', () => {
    const team = side();

    expect(inForm(team, { stats: -5 }).players[2]).toBe(team.players[2]);
  });

  it('leaves the table it was given as it was', () => {
    const team = side();
    const before = structuredClone(team);

    inForm(team, { stats: 6 });

    expect(team).toEqual(before);
  });

  it('is the side itself with no form, or none', () => {
    const team = side();

    expect(inForm(team, undefined)).toBe(team);
    expect(inForm(team, {})).toBe(team);
    expect(inForm(null, { stats: 6 })).toBeNull();
  });
});
