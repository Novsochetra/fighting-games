import { describe, expect, it } from 'vitest';
import { wispShape } from '../../../../src/render/backdrops/parts/mist-shape.js';

const WISPS = [
  [3, 60],
  [41, 95],
  [130, 150],
];

const columnsOf = (runs) =>
  runs.flatMap((run) => Array.from({ length: run.to - run.from }, (_, i) => run.from + i));

// how many of the art pixels in a strip of columns the wisp lights, over all its rows
function shareLit(runs, from, to) {
  const rows = new Set(runs.map((run) => run.row));
  const lit = columnsOf(runs).filter((column) => column >= from && column < to).length;

  return lit / ((to - from) * rows.size);
}

describe('a wisp of mist', () => {
  it('is a few rows tall, thicker below its lumpy top than at its edges', () => {
    for (const [seed, length] of WISPS) {
      const runs = wispShape(seed, length);
      const rows = new Set(runs.map((run) => run.row));

      expect(rows.size).toBeGreaterThanOrEqual(3);
      expect(rows.size).toBeLessThanOrEqual(10);
      expect(runs.some((run) => run.tone === 1)).toBe(true);
    }
  });

  it('thins out to nothing at both ends instead of stopping square', () => {
    for (const [seed, length] of WISPS) {
      const runs = wispShape(seed, length);
      const columns = columnsOf(runs);
      const left = Math.min(...columns);
      const right = Math.max(...columns) + 1;
      const middle = Math.round((left + right) / 2);

      expect(shareLit(runs, left, left + 4)).toBeLessThan(0.35);
      expect(shareLit(runs, right - 4, right)).toBeLessThan(0.35);
      expect(shareLit(runs, middle - 4, middle + 4)).toBeGreaterThan(0.5);
    }
  });

  it('keeps its thick heart inside its thin edge', () => {
    for (const [seed, length] of WISPS) {
      const runs = wispShape(seed, length);
      const thin = columnsOf(runs);
      const heart = columnsOf(runs.filter((run) => run.tone === 1));

      expect(Math.min(...heart)).toBeGreaterThan(Math.min(...thin));
      expect(Math.max(...heart)).toBeLessThan(Math.max(...thin));
    }
  });

  it('is the same wisp each time it is asked for, so a frame can be drawn again exactly', () => {
    expect(wispShape(7, 80)).toEqual(wispShape(7, 80));
  });
});
