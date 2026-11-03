import { describe, expect, it } from 'vitest';

import { HAIRS, STAR_LOOKS } from '../../../src/art/actors.js';
import { FIGURE_ART } from '../../../src/art/duel/looks.js';
import { looksOf } from '../../../src/render/actors/looks.js';
import {
  artPixelsIn,
  decidedClash,
  drawClashFrame,
  loadClashSheets,
} from '../../support/clash-frames.js';

// Twin Naga's partner, who strikes it with Sochetra, was still drawn as the clash's old lit
// shadow while everyone else was drawn from the sheets: he wears his own look now

const SHEETS = await loadClashSheets();

const inBox = (pixels, { left, right }) => pixels.filter(([x]) => x >= left && x < right);

describe('the Twin Naga partner in the clash', { timeout: 20000 }, () => {
  it('is drawn from the sheets in his own kit, skin, hair and number', () => {
    const show = decidedClash({
      attack: 'twin-naga',
      defend: 'block',
      word: 'through',
      side: 'attack',
    });
    const partner = looksOf(show.match).players[3];
    const strikers = { left: 0, right: 64 };

    for (const ticks of [6, 20, 60]) {
      const canvas = drawClashFrame(show, ticks, SHEETS);
      const shadow = artPixelsIn(canvas, [FIGURE_ART.body, FIGURE_ART.shade]);

      expect(inBox(shadow, strikers), `at ${ticks}`).toEqual([]);
      expect(
        inBox(artPixelsIn(canvas, partner.hair), strikers).length,
        `at ${ticks}`,
      ).toBeGreaterThan(4);
    }

    expect(partner.hair).toEqual(HAIRS[STAR_LOOKS.rithy.hair]);
  });
});
