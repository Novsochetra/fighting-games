import { describe, expect, it } from 'vitest';

import { DUELS } from '../../../../src/data/duels.js';
import { attackChance, scoreOf, winChance, wideChanceOf } from '../../../../src/sim/duel/odds.js';
import { statsOf } from '../../../support/duel-fixtures.js';

const shoot = { kind: 'shot', power: 0 };
const block = { kind: 'block', power: 0 };

describe('duel odds', () => {
  it('weighs the stats an option leans on, and adds its power', () => {
    const player = { stats: { ...statsOf(50), dribble: 90, speed: 30 } };

    expect(scoreOf(player, { kind: 'dribble', power: 0 })).toBeCloseTo(90 * 0.7 + 30 * 0.3);
    expect(scoreOf(player, { kind: 'dribble', power: 20 })).toBeCloseTo(90 * 0.7 + 30 * 0.3 + 20);
  });

  it('is even between equals and never certain', () => {
    expect(winChance(0)).toBe(0.5);
    expect(winChance(1000)).toBe(DUELS.mostChance);
    expect(winChance(-1000)).toBe(DUELS.leastChance);
    expect(DUELS.mostChance).toBeLessThan(1);
    expect(DUELS.leastChance).toBeGreaterThan(0);
  });

  it('favours the stronger side and the right read', () => {
    const strong = { stats: statsOf(80) };
    const weak = { stats: statsOf(40) };
    const dribble = { kind: 'dribble', power: 0 };

    expect(
      attackChance({ attacker: strong, defender: weak, attack: shoot, defend: block }),
    ).toBeGreaterThan(0.5);
    expect(
      attackChance({ attacker: weak, defender: strong, attack: shoot, defend: block }),
    ).toBeLessThan(0.5);

    const misread = attackChance({
      attacker: weak,
      defender: weak,
      attack: dribble,
      defend: block,
    });
    const read = attackChance({
      attacker: weak,
      defender: weak,
      attack: dribble,
      defend: { kind: 'tackle', power: 0 },
    });

    expect(misread).toBeGreaterThan(read);
  });

  it('sends a strong special wide less often than a plain shot from afar', () => {
    const shooter = { stats: statsOf(70) };

    expect(wideChanceOf(shooter, { power: 40 }, 0.1)).toBeLessThan(
      wideChanceOf(shooter, { power: 0 }, 0.4),
    );
    expect(wideChanceOf(shooter, { power: 99 }, 0)).toBeGreaterThan(0);
  });
});
