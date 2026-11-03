import { describe, expect, it } from 'vitest';

import { CLASH_DUST } from '../../../../../src/art/duel/clash.js';
import { drawLandingDust } from '../../../../../src/render/duel/clash/dust.js';
import { GROUND } from '../../../../../src/render/duel/paths.js';

// what a puff of dust paints, as rects [x, y, width, height] and their colours
function dustAt(since) {
  const rects = [];
  const pen = { rect: (box, color) => rects.push({ box, color }) };

  drawLandingDust(pen, { x: 120, since });

  return rects;
}

describe('the dust a downed man throws up', () => {
  it('is there only from when he lands until it settles', () => {
    expect(dustAt(-1)).toEqual([]);
    expect(dustAt(4).length).toBeGreaterThan(0);
    expect(dustAt(31)).toEqual([]);
  });

  it('paints only the dust colours, low on the grass and out either side of him', () => {
    const rects = dustAt(8);
    const xs = rects.map(({ box }) => box[0]);

    expect(new Set(rects.map(({ color }) => color))).toEqual(new Set(CLASH_DUST));
    expect(rects.every(({ box }) => box[1] < GROUND + 6 && box[1] > GROUND - 16)).toBe(true);
    expect(Math.min(...xs)).toBeLessThan(120 - 20);
    expect(Math.max(...xs)).toBeGreaterThan(120 + 20);
  });

  it('comes out the same for a frame drawn twice', () => {
    expect(dustAt(12)).toEqual(dustAt(12));
  });
});
