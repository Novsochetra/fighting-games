import { describe, expect, it } from 'vitest';
import { VIEW_WIDTH } from '../../../../src/config.js';
import {
  ALL_COLORS,
  SAMPLE_EFFECTS,
  rectsOf,
  recordEffect,
  ticksUpTo,
} from './ambient-recorder.js';

const bats = { ...SAMPLE_EFFECTS.bats, drift: 0 };

// each bat sets its own alpha before its wing rects, and the last call puts alpha back to 1
function batsIn(log) {
  const groups = [];
  for (const entry of log) {
    if (entry.startsWith('globalAlpha=')) {
      groups.push({ alpha: Number(entry.slice('globalAlpha='.length)), rects: [] });
    } else if (entry.startsWith('fillRect(')) {
      const [x, y, width, height] = entry.slice('fillRect('.length, -1).split(',').map(Number);
      groups.at(-1).rects.push({ x, y, width, height });
    }
  }
  return groups.filter((group) => group.rects.length > 0);
}

const batsAt = (tick, effect = bats) => batsIn(recordEffect(effect, { tick }).log);
const meanX = (rects) => rects.reduce((sum, rect) => sum + rect.x, 0) / rects.length;
const shapeOf = (bat) => bat.rects.map((rect) => `${rect.x - bat.rects[0].x},${rect.width}`).join();

describe('ambient bats', () => {
  it('draw nothing while the stream is out of view in its cycle', () => {
    for (const tick of [0, 1, 600, 750, 899, 900, 1500, 1799]) {
      expect(recordEffect(bats, { tick }).log).toEqual([]);
    }
  });

  it('stream across from left to right once per period', () => {
    const early = meanX(rectsOf(bats, { tick: 120 }));
    const late = meanX(rectsOf(bats, { tick: 380 }));
    expect(late).toBeGreaterThan(early + 150);
    expect(rectsOf(bats, { tick: bats.period + 200 }).length).toBeGreaterThan(0);
  });

  it('fly as a loose stream of 5 to 9 bats, a different one each time', () => {
    const sizes = new Set();
    for (let crossing = 0; crossing < 16; crossing++) {
      const stream = batsAt(crossing * bats.period + 300);
      expect(stream.length).toBeGreaterThanOrEqual(5);
      expect(stream.length).toBeLessThanOrEqual(9);
      sizes.add(stream.length);
      const tops = stream.map((bat) => Math.min(...bat.rects.map((rect) => rect.y)));
      expect(Math.max(...tops) - Math.min(...tops)).toBeGreaterThan(4);
    }
    expect(sizes.size).toBeGreaterThan(2);
  });

  it('beat their wings fast, a new pose every few ticks', () => {
    const leaderShapes = ticksUpTo(24, 1).map((offset) => shapeOf(batsAt(300 + offset)[0]));
    const changes = leaderShapes.slice(1).filter((shape, i) => shape !== leaderShapes[i]);
    expect(new Set(leaderShapes).size).toBeGreaterThanOrEqual(2);
    expect(changes.length).toBeGreaterThanOrEqual(5);
  });

  it('flutter up and down irregularly as they go', () => {
    const tops = ticksUpTo(120, 2).map((offset) => batsAt(200 + offset)[0].rects[0].y);
    const steps = tops
      .slice(1)
      .map((y, i) => Math.sign(y - tops[i]))
      .filter(Boolean);
    const turns = steps.slice(1).filter((step, i) => step !== steps[i]);
    expect(turns.length).toBeGreaterThan(6);
  });

  it('draw the farther bats smaller and fainter', () => {
    const all = ticksUpTo(16, 1).flatMap((crossing) => batsAt(crossing * bats.period + 300));
    const far = all.filter((bat) => bat.alpha < 1);
    const near = all.filter((bat) => bat.alpha === 1);
    expect(far.length).toBeGreaterThan(0);
    expect(near.length).toBeGreaterThan(far.length);
    const widthOf = (bat) =>
      Math.max(...bat.rects.map((rect) => rect.x + rect.width)) -
      Math.min(...bat.rects.map((rect) => rect.x));
    expect(Math.max(...far.map(widthOf))).toBe(5);
    expect(Math.max(...near.map(widthOf))).toBe(7);
  });

  it('use the bat color and leave alpha at 1', () => {
    const colors = new Set(rectsOf(bats, { tick: 300 }).map((rect) => rect.color));
    expect([...colors]).toEqual([ALL_COLORS.bat]);
    expect(recordEffect(bats, { tick: 300 }).alpha).toBe(1);
  });

  it('slide with the camera by their drift, the whole stream at once', () => {
    const drifting = { ...bats, drift: 0.5 };
    const still = rectsOf(drifting, { tick: 300 });
    expect(rectsOf(drifting, { tick: 300, cameraX: 40 })).toEqual(
      still.map((rect) => ({ ...rect, x: rect.x - 20 })),
    );
  });

  it('never pop in or out on screen while the camera moves', () => {
    const drifting = { ...bats, drift: 0.5 };
    const corner = (bat) => ({
      x: Math.min(...bat.rects.map((rect) => rect.x)),
      y: Math.min(...bat.rects.map((rect) => rect.y)),
    });
    const isAtEdge = ({ x }) => x < 4 || x > VIEW_WIDTH - 11;
    for (const tick of ticksUpTo(2700, 5)) {
      for (const cameraX of [0, 333, 2000]) {
        const before = batsIn(recordEffect(drifting, { tick, cameraX }).log).map(corner);
        const after = batsIn(recordEffect(drifting, { tick: tick + 1, cameraX: cameraX + 3 }).log);
        for (const bat of after.map(corner).filter((spot) => !isAtEdge(spot))) {
          const match = before.some(
            (spot) => Math.abs(spot.x - bat.x) <= 4 && Math.abs(spot.y - bat.y) <= 5,
          );
          expect(match, `tick ${tick} camera ${cameraX}`).toBe(true);
        }
      }
    }
  });
});
