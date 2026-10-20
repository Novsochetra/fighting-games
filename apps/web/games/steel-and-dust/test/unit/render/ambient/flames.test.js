import { describe, expect, it } from 'vitest';
import { ALL_COLORS, rectsOf, ticksUpTo } from './ambient-recorder.js';

const BASE = { x: 200, y: 170 };
const brazier = (extra = {}) => ({
  kind: 'flames',
  plane: 'back',
  emitters: [BASE],
  tileWidth: 1000,
  drift: 1,
  ...extra,
});
const palette = ALL_COLORS.flames;
const isGlow = (rect) => rect.color === ALL_COLORS.glow;
const flameAt = (tick, options = {}) =>
  rectsOf(brazier(), { tick, ...options }).filter((rect) => !isGlow(rect));
const shiftedLeft = (rects, distance) => rects.map((rect) => ({ ...rect, x: rect.x - distance }));
const meanY = (rects) =>
  rects.reduce((sum, rect) => sum + rect.y + rect.height / 2, 0) / rects.length;

function pixelsOf(rects) {
  const pixels = new Set();
  for (const rect of rects) {
    for (let y = rect.y; y < rect.y + rect.height; y++) {
      for (let x = rect.x; x < rect.x + rect.width; x++) {
        pixels.add(`${x},${y}`);
      }
    }
  }
  return pixels;
}

describe('ambient flames', () => {
  const frames = ticksUpTo(600, 3).map((tick) => flameAt(tick));

  it('follow their emitter when the camera moves', () => {
    for (const tick of [0, 45, 130]) {
      const atStart = rectsOf(brazier(), { tick });
      expect(rectsOf(brazier(), { tick, cameraX: 60 })).toEqual(shiftedLeft(atStart, 60));
    }
  });

  it('burn again at the next tile when that copy is on screen', () => {
    const nearLeft = { emitters: [{ x: 50, y: 170 }] };
    const single = rectsOf(brazier(nearLeft), { tick: 90 });
    const repeated = rectsOf(brazier({ ...nearLeft, tileWidth: 300 }), { tick: 90 });
    expect(repeated).toEqual([...single, ...shiftedLeft(single, -300)]);
  });

  it('rise from their emitter as a small flame, a few pixels wide and about a dozen tall', () => {
    for (const rects of frames) {
      expect(rects.length).toBeGreaterThan(8);
      for (const rect of rects) {
        expect(rect.y + rect.height).toBeLessThanOrEqual(BASE.y);
        expect(rect.y).toBeGreaterThanOrEqual(BASE.y - 22);
        expect(rect.x).toBeGreaterThanOrEqual(BASE.x - 6);
        expect(rect.x + rect.width).toBeLessThanOrEqual(BASE.x + 7);
      }
    }
  });

  it('burn hottest at the base and coolest at the tips', () => {
    const rects = frames.flat();
    const hottest = rects.filter((rect) => rect.color === palette[0]);
    const coolest = rects.filter((rect) => rect.color === palette.at(-1));
    expect(hottest.length).toBeGreaterThan(frames.length);
    expect(meanY(hottest)).toBeGreaterThan(meanY(coolest) + 2);
    expect(hottest.every((rect) => rect.y >= BASE.y - 6)).toBe(true);
    expect(new Set(rects.map((rect) => rect.color))).toEqual(new Set(palette));
  });

  // the layers go coolest first and hottest last; a lick torn off the tip may follow them
  it('keep a pixel of the coolest color beside every hotter one', () => {
    for (const drawn of frames) {
      const rects = drawn.at(-1).color === palette[0] ? drawn : drawn.slice(0, -1);
      const outer = pixelsOf(rects.filter((rect) => rect.color === palette.at(-1)));
      for (const pixel of pixelsOf(rects.filter((rect) => rect.color !== palette.at(-1)))) {
        const [x, y] = pixel.split(',').map(Number);
        expect(outer.has(`${x - 1},${y}`) && outer.has(`${x + 1},${y}`), pixel).toBe(true);
      }
    }
  });

  it('flicker: their tongues hold a shape for a few ticks, then change', () => {
    const shapeAt = (tick) => JSON.stringify(flameAt(tick));
    const ticks = ticksUpTo(400, 1);
    const held = ticks.filter((tick) => shapeAt(tick) === shapeAt(tick + 1)).length;
    const changed = ticks.filter((tick) => shapeAt(tick) !== shapeAt(tick + 4)).length;
    expect(held).toBeGreaterThan(ticks.length * 0.4);
    expect(changed).toBeGreaterThan(ticks.length * 0.8);
    expect(new Set(ticksUpTo(400, 4).map(shapeAt)).size).toBeGreaterThan(60);
  });

  it('glow softly under the flame, flickering, with a dithered edge', () => {
    const glowAlphas = new Set();
    for (const tick of ticksUpTo(240, 6)) {
      const rects = rectsOf(brazier(), { tick });
      const firstFlame = rects.findIndex((rect) => !isGlow(rect));
      const glow = rects.slice(0, firstFlame);
      expect(glow.length).toBeGreaterThan(10);
      expect(rects.slice(firstFlame).some(isGlow)).toBe(false);
      expect(glow.every((rect) => isGlow(rect) && rect.alpha < 0.15)).toBe(true);
      expect(glow.filter((rect) => rect.width === 1 && rect.height === 1).length).toBeGreaterThan(
        5,
      );
      glowAlphas.add(glow[0].alpha);
    }
    expect(glowAlphas.size).toBeGreaterThan(5);
  });

  it('still burn, without a glow, where the forest has no glow color', () => {
    const colors = { flames: palette };
    const rects = rectsOf(brazier(), { tick: 30, colors });
    expect(rects.length).toBeGreaterThan(8);
    expect(rects.every((rect) => rect.alpha === 1 && palette.includes(rect.color))).toBe(true);
  });

  it('draw one layer per flame color, so a shorter palette burns in fewer colors', () => {
    const colors = { flames: palette.slice(-2) };
    const used = new Set(
      ticksUpTo(120, 3).flatMap((tick) =>
        rectsOf(brazier(), { tick, colors }).map((rect) => rect.color),
      ),
    );
    expect(used).toEqual(new Set(palette.slice(-2)));
  });
});
