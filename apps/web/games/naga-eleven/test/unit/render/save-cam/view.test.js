import { describe, expect, it } from 'vitest';

import {
  acrossAt,
  depthOfRow,
  FRAME,
  HORIZON,
  project,
} from '../../../../src/render/save-cam/view.js';

describe('the save cam’s view of the ground', () => {
  it('finds how far off the grass of a row lies, and where across it a column is', () => {
    for (const depth of [3.5, 6, 11, 14.6, 40, 200]) {
      for (const across of [-6, -3.66, 0, 2.5, 9]) {
        const at = project({ x: across, y: 0, z: depth });

        expect(depthOfRow(at.y - 0.5)).toBeCloseTo(depth, 6);
        expect(acrossAt(at.x - 0.5, depth)).toBeCloseTo(across, 6);
      }
    }
  });

  it('puts the goal line under the posts, nearer the camera than the horizon', () => {
    expect(depthOfRow(FRAME.line)).toBeGreaterThan(10);
    expect(depthOfRow(FRAME.line)).toBeLessThan(11.5);
    expect(depthOfRow(Math.round(HORIZON))).toBeGreaterThan(300);
    expect(Number.isFinite(depthOfRow(HORIZON - 3))).toBe(true);
  });
});
