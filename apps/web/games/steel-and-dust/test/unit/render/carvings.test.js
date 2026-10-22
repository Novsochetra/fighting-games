import { describe, expect, it } from 'vitest';
import { carvingFrame } from '../../../src/render/fx/carvings.js';

describe("a carving's frames", () => {
  it('holds the follow-through of its cut, then swings the cut itself when called on', () => {
    const carving = { sprite: ['slash2', 3, 0], swungAt: null };
    expect(carvingFrame(carving)).toEqual(['slash2', 4, 0]);
    expect(carvingFrame({ ...carving, swungAt: 40 })).toEqual(['slash2', 3, 0]);
  });
});
