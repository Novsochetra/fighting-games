import { describe, expect, it } from 'vitest';
import { emitterScreenXs } from '../../../../src/render/scene/ambient/emitters.js';
import { ALL_COLORS, rectsOf, ticksUpTo } from './ambient-recorder.js';

const fire = (kind, extra = {}) => ({
  kind,
  plane: 'back',
  emitters: [{ x: 200, y: 170 }],
  tileWidth: 1000,
  drift: 1,
  ...extra,
});

function shiftedLeft(rects, distance) {
  return rects.map((rect) => ({ ...rect, x: rect.x - distance }));
}

function meanY(rects) {
  return rects.reduce((sum, rect) => sum + rect.y, 0) / rects.length;
}

describe('emitter positions', () => {
  it('scroll with the near layer and repeat once per tile', () => {
    const scroll = { tileWidth: 300, cameraX: 0, drift: 1 };
    expect(emitterScreenXs({ x: 10 }, scroll)).toEqual([10, 310]);
    expect(emitterScreenXs({ x: 10 }, { ...scroll, cameraX: 100 })).toEqual([210]);
    expect(emitterScreenXs({ x: 10 }, { ...scroll, cameraX: 30 })).toEqual([-20, 280]);
    expect(emitterScreenXs({ x: 10 }, { ...scroll, cameraX: 40, drift: 0.5 })).toEqual([-10, 290]);
  });

  it('do not repeat without a tile width', () => {
    expect(emitterScreenXs({ x: 50 }, { cameraX: 20, drift: 1 })).toEqual([30]);
    expect(emitterScreenXs({ x: 50 }, { cameraX: 900, drift: 1 })).toEqual([]);
  });
});

describe.each(['embers', 'smoke'])('ambient %s', (kind) => {
  it('follow their emitter when the camera moves', () => {
    for (const tick of [0, 45, 130]) {
      const atStart = rectsOf(fire(kind), { tick });
      expect(atStart.length).toBeGreaterThan(0);
      expect(rectsOf(fire(kind), { tick, cameraX: 60 })).toEqual(shiftedLeft(atStart, 60));
    }
  });

  it('draw again at the next tile when that copy is on screen', () => {
    const nearLeft = { emitters: [{ x: 50, y: 170 }] };
    const single = rectsOf(fire(kind, nearLeft), { tick: 90 });
    const repeated = rectsOf(fire(kind, { ...nearLeft, tileWidth: 300 }), { tick: 90 });
    expect(repeated).toEqual([...single, ...shiftedLeft(single, -300)]);
  });
});

describe('ambient embers', () => {
  const sparks = ticksUpTo(600, 3).flatMap((tick) =>
    rectsOf(fire('embers'), { tick }).filter((rect) => rect.width === 1),
  );

  it('flicker a soft glow under the fire', () => {
    const glowAlphas = ticksUpTo(120, 6).map((tick) => rectsOf(fire('embers'), { tick })[0].alpha);
    expect(new Set(glowAlphas).size).toBeGreaterThan(5);
    expect(rectsOf(fire('embers'), { tick: 0 })[0].color).toBe(ALL_COLORS.glow);
  });

  it('rise sparks that cool from hot to cool colors and fade', () => {
    const [hot, warm, cool] = ALL_COLORS.embers.map((color) =>
      sparks.filter((rect) => rect.color === color),
    );
    expect(meanY(hot)).toBeGreaterThan(meanY(warm));
    expect(meanY(warm)).toBeGreaterThan(meanY(cool));
    expect(Math.max(...cool.map((rect) => rect.alpha))).toBeLessThan(
      Math.min(...hot.map((rect) => rect.alpha)),
    );
  });
});

describe('ambient smoke', () => {
  const puffs = ticksUpTo(600, 3).flatMap((tick) => rectsOf(fire('smoke'), { tick }));

  it('grows from 2px to 6px squares as it rises and fades out', () => {
    const bySize = (size) => puffs.filter((rect) => rect.width === size);
    expect(new Set(puffs.map((rect) => rect.width))).toEqual(new Set([2, 3, 4, 5, 6]));
    expect(puffs.every((rect) => rect.width === rect.height)).toBe(true);
    expect(meanY(bySize(6))).toBeLessThan(meanY(bySize(3)));
    expect(Math.max(...bySize(6).map((rect) => rect.alpha))).toBeLessThan(0.1);
  });

  it('drifts to the right as it rises', () => {
    const small = puffs.filter((rect) => rect.width === 2);
    const large = puffs.filter((rect) => rect.width === 6);
    const meanX = (rects) => rects.reduce((sum, rect) => sum + rect.x, 0) / rects.length;
    expect(meanX(large)).toBeGreaterThan(meanX(small) + 10);
  });
});
