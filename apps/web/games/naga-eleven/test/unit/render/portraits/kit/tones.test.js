import { describe, expect, it } from 'vitest';
import { GEAR_TONES } from '../../../../../src/art/face-kit/index.js';
import { gearColours, kitGridFor } from '../../../../../src/render/portraits/kit/index.js';

const PALETTE = { clothLight: 'a', cloth: 'b', clothShade: 'c', clothDeep: 'd' };

describe('the colours a band or a trinket is painted in', () => {
  it('are the side’s shirt for a band', () => {
    expect(gearColours('kit', PALETTE)).toEqual({
      accentPale: 'a',
      accentLight: 'b',
      accent: 'c',
      accentShade: 'd',
    });
  });

  it('are its own for a tone the kit has', () => {
    expect(gearColours('gold', PALETTE).accentPale).toBe(GEAR_TONES.gold[0]);
  });

  it('leave the recipe’s accents alone with nothing on', () => {
    expect(gearColours(null, PALETTE)).toEqual({});
  });

  it('are gold for a plain player’s earring and the side’s for his band', () => {
    const tones = Array.from({ length: 40 }, (_, place) =>
      kitGridFor({
        character: 'footballer',
        age: 'adult',
        mood: 'neutral',
        variant: { team: 'brazil', kit: 'brazil', wear: 'home', place },
      }),
    ).map(({ tone }) => tone);

    expect(tones).toContain('gold');
    expect(tones).toContain('kit');
  });
});
