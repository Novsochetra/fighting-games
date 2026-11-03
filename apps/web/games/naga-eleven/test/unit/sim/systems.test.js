import { describe, expect, it } from 'vitest';
import { DUO_COMBOS } from '../../../src/data/combos.js';
import { systemsOf } from '../../../src/sim/systems.js';

describe('the systems a match plays', () => {
  it('are all on for a match made without them, every duo too', () => {
    expect(systemsOf(undefined)).toEqual({
      passCombo: true,
      roleSkills: true,
      chains: true,
      duos: DUO_COMBOS.map((duo) => duo.move),
    });
  });

  it('keep what the story gives, and only that', () => {
    expect(systemsOf({ passCombo: true, roleSkills: false, chains: false, duos: [] })).toEqual({
      passCombo: true,
      roleSkills: false,
      chains: false,
      duos: [],
    });
  });
});
