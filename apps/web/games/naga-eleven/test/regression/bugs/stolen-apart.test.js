import { describe, expect, it } from 'vitest';

import {
  artPixelsIn,
  decidedClash,
  drawClashFrame,
  loadClashSheets,
  shirtOf,
} from '../../support/clash-frames.js';

// When the tackle won the ball the tackler slid on with it through the dribbler he had brought
// down, and was drawn behind him: the clash ended in a tangle of the two. They end apart now

const SHEETS = await loadClashSheets();

const columnsOf = (canvas, show, side) => artPixelsIn(canvas, shirtOf(show, side)).map(([x]) => x);

describe('the ball won in a tackle', { timeout: 20000 }, () => {
  it.each(['tackle', 'block', 'intercept'])(
    'leaves the %s winner clear of the man he brought down',
    (defend) => {
      const show = decidedClash({ attack: 'dribble', defend, word: 'stolen', side: 'defend' });

      for (const ticks of [80, 92]) {
        const canvas = drawClashFrame(show, ticks, SHEETS);
        const dribbler = columnsOf(canvas, show, 'attack');
        const tackler = columnsOf(canvas, show, 'defend');
        const gap = Math.max(
          Math.min(...tackler) - Math.max(...dribbler),
          Math.min(...dribbler) - Math.max(...tackler),
        );

        expect(tackler.length, `${defend} at ${ticks}`).toBeGreaterThan(12);
        expect(gap, `${defend} at ${ticks}`).toBeGreaterThanOrEqual(8);
      }
    },
  );
});
