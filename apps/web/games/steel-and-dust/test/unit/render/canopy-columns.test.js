import { describe, expect, it } from 'vitest';
import { canopyAcross, stalkAt, trunkAt } from '../../../src/render/scene/canopy-columns.js';

// a layer laid from the screen's left edge, so a column of the screen is the same column of it
const layer = { image: { width: 400 }, parallax: 0.5 };
const grove = { canopy: { trunks: [[100, 140]] }, layer, cameraX: 0 };
const bamboo = {
  canopy: {
    stalks: [
      [100, 120],
      [130, 180],
      [380, 395],
    ],
  },
  layer,
  cameraX: 0,
};
const columns = (from, to) => Array.from({ length: to - from }, (_, i) => from + i);

describe('the columns of the trees over a drop', () => {
  it('hold a trunk still, easing into the boughs just past its edges', () => {
    expect(trunkAt(grove, 120)).toBe(1);
    expect(trunkAt(grove, 97)).toBeGreaterThan(0);
    expect(trunkAt(grove, 97)).toBeLessThan(1);
    expect(trunkAt(grove, 90)).toBe(0);
    expect(trunkAt({ ...grove, cameraX: 200 }, 20)).toBe(1);
  });

  it('give the stalk a column stands in, or the nearer one across a gap', () => {
    expect(stalkAt(bamboo, 110)).toMatchObject({ from: 100, to: 120 });
    expect(stalkAt(bamboo, 124)).toMatchObject({ from: 100, to: 120 });
    expect(stalkAt(bamboo, 126)).toMatchObject({ from: 130, to: 180 });
    expect(stalkAt(bamboo, 4)).toMatchObject({ from: -20, to: -5 });
  });

  it('give most over the spot, easing to nothing at the sides, and nothing on a trunk', () => {
    const { across, half } = canopyAcross(grove, 200);

    expect(across(200)).toBe(1);
    expect(across(200 - half)).toBe(0);
    expect(across(200 + half)).toBe(0);
    expect(across(225)).toBeGreaterThan(across(235));
    expect(canopyAcross(grove, 150).across(130)).toBe(0);
  });

  it('lean every stalk as one, and the stalks either side of a gap the spot is over', () => {
    const { across, half } = canopyAcross(bamboo, 125);
    const gives = (from, to) => new Set(columns(from, to).map(across));

    expect(gives(100, 121).size).toBe(1);
    expect(gives(130, 181).size).toBe(1);
    expect(across(110)).toBe(1);
    expect(across(150)).toBe(1);
    expect(across(125 - half)).toBe(0);
    expect(across(125 + half)).toBe(0);
  });
});
