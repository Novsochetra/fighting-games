import { describe, expect, it } from 'vitest';

import { GROUND } from '../../../src/render/duel/paths.js';
import {
  artPixelsIn,
  decidedClash,
  drawClashFrame,
  loadClashSheets,
  shirtOf,
} from '../../support/clash-frames.js';

// A dribbler the tackle won the ball from ended the clash in the sheets' last fall frame, 3/4 and
// diagonal, half up off the grass, so it never read as a man brought down: he lies flat now, side
// on, his shirt low on the grass

const SHEETS = await loadClashSheets();

describe('a dribbler the tackle beat', { timeout: 20000 }, () => {
  it.each(['tackle', 'block', 'intercept'])('lies flat on the grass after a %s', (defend) => {
    const show = decidedClash({ attack: 'dribble', defend, word: 'stolen', side: 'defend' });

    for (const ticks of [80, 92]) {
      const shirt = artPixelsIn(drawClashFrame(show, ticks, SHEETS), shirtOf(show, 'attack'));
      const top = Math.min(...shirt.map(([, y]) => y));

      expect(shirt.length, `${defend} at ${ticks}`).toBeGreaterThan(12);
      expect(GROUND - top, `${defend} at ${ticks}`).toBeLessThanOrEqual(14);
    }
  });
});
