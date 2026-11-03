import { describe, expect, it } from 'vitest';

import { SAVE_CAM_VILLAGE } from '../../../../../../src/art/save-cam/venues/village.js';
import { packAll } from '../../../../../../src/render/venues/kit/colour.js';
import { fieldAt } from '../../../../../../src/render/save-cam/backdrops/village/field.js';
import { paddyAt } from '../../../../../../src/render/save-cam/backdrops/village/paddies.js';

const art = packAll(SAVE_CAM_VILLAGE);
const DIRT = new Set(art.dirt);

// how much of a patch of the field is bare red earth
function bareShare({ across, depth }) {
  let bare = 0;
  let count = 0;

  for (let dx = -1; dx <= 1; dx += 0.25) {
    for (let dz = -0.6; dz <= 0.6; dz += 0.2) {
      bare += DIRT.has(fieldAt({ across: across + dx, depth: depth + dz }, count, count * 3, art))
        ? 1
        : 0;
      count += 1;
    }
  }

  return bare / count;
}

describe('the village field behind the bamboo goal', () => {
  it('is worn to red earth in the goalmouth, where the keeper stands, and grassy out wide', () => {
    expect(bareShare({ across: 0, depth: 10.4 })).toBeGreaterThan(0.6);
    expect(bareShare({ across: -9, depth: 6 })).toBeLessThan(0.35);
    expect(bareShare({ across: 9, depth: 6 })).toBeLessThan(0.35);
  });

  it('runs off into paddies of water, rice and dikes, every colour the venue’s own or its haze', () => {
    const own = new Set([...art.water, ...art.rice, ...art.grass, ...art.dirt]);
    const near = new Set();

    for (let i = 0; i < 400; i += 1) {
      const spot = { across: (i % 40) - 20, depth: 16 + (i % 7) * 2 };

      near.add(paddyAt(spot, i % 256, 90 + (i % 9), art));
    }

    expect([...near].every((colour) => own.has(colour))).toBe(true);
    expect([...near].some((colour) => art.water.includes(colour))).toBe(true);
    expect([...near].some((colour) => art.rice.includes(colour))).toBe(true);
  });
});
