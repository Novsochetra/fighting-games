import { describe, expect, it } from 'vitest';

import { DIVE_FRAMES } from '../../../../src/art/save-cam/keeper-dive/index.js';
import {
  DIAGONAL_FROM,
  DIVE_BEATS,
  diveFrameAt,
  gripOf,
  handsOf,
  restOf,
  SHALLOW_FROM,
  stretchOf,
} from '../../../../src/render/save-cam/dive-frames.js';

const TOY = {
  rows: ['....', '....', '....', '....', '....'],
  anchor: { x: 1, y: 2 },
  hands: { x: 3, y: 0 },
};

describe("the dive's frames", () => {
  it("reads a frame's navel height and where its gloves are from its navel", () => {
    expect(restOf(TOY)).toBe(2);
    expect(handsOf(TOY)).toEqual({ x: 2, y: -2 });
  });

  it('takes the steepest diagonal that keeps his boots off the grass, else the flat dive', () => {
    expect(SHALLOW_FROM).toBeGreaterThan(20);
    expect(DIAGONAL_FROM).toBeGreaterThan(SHALLOW_FROM);
    expect(stretchOf(DIAGONAL_FROM)).toBe('high');
    expect(stretchOf(DIAGONAL_FROM - 1)).toBe('mid');
    expect(stretchOf(SHALLOW_FROM)).toBe('mid');
    expect(stretchOf(SHALLOW_FROM - 1)).toBe('low');
    expect(stretchOf(4)).toBe('low');
  });

  it('fists a punch, catches only from the contact, and reaches open-handed when beaten', () => {
    expect(gripOf('punch', -4)).toBe('punch');
    expect(gripOf('catch', -1)).toBe('reach');
    expect(gripOf('catch', 0)).toBe('catch');

    for (const outcome of ['goal', 'wide', 'post', 'parry']) {
      expect(gripOf(outcome, 3), outcome).toBe('reach');
    }
  });

  it('sets, pushes off, stretches through the contact, comes down flatter and lands', () => {
    const catching = { outcome: 'catch', stretch: 'high' };
    const at = (since) => diveFrameAt(catching, since);

    expect(at(-30)).toEqual({ name: 'set', map: DIVE_FRAMES.set });
    expect(at(DIVE_BEATS.push)).toEqual({ name: 'push', map: DIVE_FRAMES.push.high });
    expect(at(DIVE_BEATS.stretch)).toEqual({ name: 'stretch', map: DIVE_FRAMES.high.reach });
    expect(at(0)).toEqual({ name: 'stretch', map: DIVE_FRAMES.high.catch });
    expect(at(DIVE_BEATS.hold)).toEqual({ name: 'fall', map: DIVE_FRAMES.low.catch });
    expect(at(DIVE_BEATS.land)).toEqual({ name: 'land', map: DIVE_FRAMES.land.ball });
  });

  it('pushes off low and lands empty-handed for a low ball he does not hold', () => {
    const beaten = { outcome: 'goal', stretch: 'low' };

    expect(diveFrameAt(beaten, DIVE_BEATS.push).map).toBe(DIVE_FRAMES.push.low);
    expect(diveFrameAt(beaten, 0).map).toBe(DIVE_FRAMES.low.reach);
    expect(diveFrameAt(beaten, 80).map).toBe(DIVE_FRAMES.land.empty);
  });
});
