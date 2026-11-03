import { describe, expect, it } from 'vitest';
import { KITS } from '../../../../src/art/kits.js';
import {
  NUMBER_COLOURS,
  NUMBER_INKS,
  PLAIN_NUMBER_COLOURS,
  SPARE_NUMBER_COLOURS,
} from '../../../../src/art/shirt-numbers.js';
import {
  contrastRatio,
  numberColoursOf,
  numberFillOf,
} from '../../../../src/render/actors/number-colours.js';

describe('the contrast between two colours', () => {
  it('runs from 1 for one colour to 21 for black on white, either way round', () => {
    expect(contrastRatio('#808080', '#808080')).toBeCloseTo(1);
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21);
    expect(contrastRatio('#ffffff', '#000000')).toBeCloseTo(21);
  });
});

describe("a shirt's number colour", () => {
  it('is the one its kit names for the shirt worn', () => {
    expect(numberFillOf('cambodia', 'home', KITS.cambodia.home.shirt)).toBe(
      NUMBER_COLOURS.cambodia.home,
    );
    expect(numberFillOf('japan', 'away', KITS.japan.away.shirt)).toBe(NUMBER_COLOURS.japan.away);
  });

  it("is a spare keeper shirt's own, whichever kit he changed out of", () => {
    expect(numberFillOf('brazil', 'keeper-1', KITS.brazil.keeper.shirt)).toBe(
      SPARE_NUMBER_COLOURS[1],
    );
  });

  it("is a plain side's by its side", () => {
    expect(numberFillOf('plain-1', 'away', KITS.japan.home.shirt)).toBe(
      PLAIN_NUMBER_COLOURS[1].away,
    );
  });

  it('is the ink that reads better on a kit that names none', () => {
    const navy = ['#0a0f30', '#141c48', '#1f2c5a', '#2c3c70'];
    const lemon = ['#9a8a20', '#c8b430', '#f2e050', '#fff080'];

    expect(numberFillOf('unknown', 'home', navy)).toBe(NUMBER_INKS.light);
    expect(numberFillOf('unknown', 'home', lemon)).toBe(NUMBER_INKS.dark);
  });

  it("is outlined in the shirt's deepest shade when pale, its lightest when dark", () => {
    const { shirt } = KITS.cambodia.home;

    expect(numberColoursOf(NUMBER_INKS.light, shirt).edge).toBe(shirt[0]);
    expect(numberColoursOf(NUMBER_INKS.dark, KITS.germany.home.shirt).edge).toBe(
      KITS.germany.home.shirt[3],
    );
  });

  it('keys its colours, so two kits printing alike share their numbers', () => {
    const first = numberColoursOf('#ffffff', KITS.cambodia.home.shirt);
    const second = numberColoursOf('#ffffff', KITS.cambodia.home.shirt);

    expect(first.key).toBe(second.key);
    expect(numberColoursOf('#000000', KITS.cambodia.home.shirt).key).not.toBe(first.key);
  });
});
