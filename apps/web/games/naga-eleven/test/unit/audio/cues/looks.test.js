import { describe, expect, it } from 'vitest';
import { LAYER_KINDS } from '../../../../src/audio/cues/impact.js';
import { SPECIAL_LOOKS } from '../../../../src/audio/cues/looks.js';
import { LOOK_ART } from '../../../../src/art/duel/looks.js';
import { MOVES } from '../../../../src/data/moves.js';

describe("the specials' own sounds", () => {
  it('give every move look a charge and an impact of its own', () => {
    for (const move of Object.values(MOVES)) {
      expect(SPECIAL_LOOKS[move.look], move.id).toBeDefined();
    }
  });

  it('sound every look the duel draws in, the skills and combos too', () => {
    for (const look of Object.keys(LOOK_ART)) {
      expect(SPECIAL_LOOKS[look], look).toBeDefined();
    }

    expect(Object.keys(SPECIAL_LOOKS)).toEqual(
      expect.arrayContaining(['bayon', 'mekong', 'eclipse']),
    );
  });

  it('build every impact from layers the impact knows, each with a level', () => {
    for (const [look, { shimmer, layers }] of Object.entries(SPECIAL_LOOKS)) {
      expect(shimmer, look).toBeGreaterThan(50);
      expect(layers.length, look).toBeGreaterThan(0);

      for (const layer of layers) {
        expect(LAYER_KINDS, look).toContain(layer.kind);
        expect(layer.peak, look).toBeGreaterThan(0);
      }
    }
  });

  it('strike the Naga with a gong and water, and Garuda with wind', () => {
    const kinds = (look) => SPECIAL_LOOKS[look].layers.map((layer) => layer.kind);

    expect(kinds('naga')).toEqual(expect.arrayContaining(['gong', 'wash']));
    expect(kinds('garuda')).toEqual(expect.arrayContaining(['wash', 'glide']));
    expect(kinds('hanuman')).toContain('flurry');
    expect(kinds('sword')).toContain('ring');
  });
});
