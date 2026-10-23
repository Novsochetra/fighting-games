import { describe, expect, it } from 'vitest';
import { clockPlaque } from '../../../src/render/hud/clock.js';
import { SCORE_BOX } from '../../../src/render/hud/score.js';
import {
  LIVES_BOX,
  TOP_BAR_HEIGHT,
  VITALS_BOX,
  WEAPON_BOX,
} from '../../../src/render/hud/top-bar.js';

const right = (box) => box.x + box.width;

describe('the boxes of the HUD', () => {
  it('line up along the top bar: weapon, health and ULT, clock, score', () => {
    const row = [WEAPON_BOX, VITALS_BOX, clockPlaque('99:59'), SCORE_BOX];
    for (const box of row) {
      expect([box.y, box.height]).toEqual([0, TOP_BAR_HEIGHT]);
    }
    for (let i = 1; i < row.length; i++) {
      expect(row[i].x).toBeGreaterThan(right(row[i - 1]));
    }
  });

  it('hang the lives under the weapon, as wide as its box', () => {
    expect(LIVES_BOX.x).toBe(WEAPON_BOX.x);
    expect(LIVES_BOX.width).toBe(WEAPON_BOX.width);
    expect(LIVES_BOX.y).toBeGreaterThanOrEqual(TOP_BAR_HEIGHT);
  });
});
