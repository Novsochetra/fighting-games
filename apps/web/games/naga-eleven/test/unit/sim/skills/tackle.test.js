import { describe, expect, it } from 'vitest';
import { SKILL_PLAY } from '../../../../src/data/skills.js';
import { tackleLiftOf } from '../../../../src/sim/skills/tackle.js';
import { matchInPlay } from '../../../support/match-driver.js';

describe('a tackle skill', () => {
  it('lifts the odds of a tackle as it fires, and only for one who has it', () => {
    const match = matchInPlay();
    const lukas = Object.assign(match.players[13], { moves: ['iron-gate'], spirit: 80 });

    expect(tackleLiftOf(match, lukas)).toBe(SKILL_PLAY.tackle.odds);
    expect(lukas.cooldown).toBeGreaterThan(0);
    expect(tackleLiftOf(match, lukas)).toBe(0);
    expect(tackleLiftOf(match, match.players[14])).toBe(0);
  });
});
