import { describe, expect, it } from 'vitest';
import {
  PIXEL,
  ellipseRows,
  fillRows,
  fineLine,
  fineRect,
  flicker,
  ringRows,
  snap,
  steppedLevel,
} from '../../../../src/render/fx/fine-pixels.js';
import { drawnRects, offGrid, onScreenPixels, recordingPainter } from './fx-recorder.js';

describe('the screen-pixel grid', () => {
  it('is half a world pixel, and snaps to it', () => {
    expect(PIXEL).toBe(0.5);
    expect(snap(10.3)).toBe(10.5);
    expect(snap(10.2)).toBe(10);
    expect(snap(-3.8)).toBe(-4);
  });

  it('flickers the same for the same part and beat, between 0 and 1', () => {
    const values = Array.from({ length: 200 }, (_, beat) => flicker(7, beat));
    expect(values).toEqual(Array.from({ length: 200 }, (_, beat) => flicker(7, beat)));
    expect(Math.min(...values)).toBeGreaterThanOrEqual(0);
    expect(Math.max(...values)).toBeLessThan(1);
    expect(new Set(values.map((value) => Math.floor(value * 4))).size).toBe(4);
    expect(flicker(8, 3)).not.toBe(flicker(7, 3));
  });

  it('steps between a few fixed levels, using each of them', () => {
    const levels = [0.2, 0.3, 0.4];
    const picked = new Set(Array.from({ length: 100 }, (_, beat) => steppedLevel(levels, 1, beat)));
    expect([...picked].sort()).toEqual(levels);
  });
});

describe('a pixel ellipse', () => {
  const rows = ellipseRows(13, 4);

  it('has a row every screen pixel, widest across its middle and narrowing to both ends', () => {
    expect(rows).toHaveLength(17);
    expect(rows.map((row) => row.dy)).toEqual(rows.map((_, i) => (i - 8) * PIXEL));
    expect(rows[8].half).toBe(13);
    for (let i = 1; i <= 8; i++) {
      expect(rows[8 - i].half).toBe(rows[8 + i].half);
      expect(rows[8 + i].half).toBeLessThanOrEqual(rows[8 + i - 1].half);
    }
    expect(rows[0].half).toBeGreaterThan(0);
    expect(rows.every((row) => onScreenPixels(row.half))).toBe(true);
  });

  it('as a ring keeps a rim of the width asked for down its sides and full rows at its ends', () => {
    const ring = ringRows(13, 4, 2);
    expect(ring[8].half - ring[8].hole).toBe(2 * PIXEL);
    expect(ring[0].hole).toBe(0);
    expect(ring.at(-1).hole).toBe(0);
    for (const row of ring) {
      expect(row.hole === 0 || row.half - row.hole >= 2 * PIXEL).toBe(true);
    }
  });

  it('fills its rows round a point snapped to the grid, both arcs of a ring', () => {
    const { context, log } = recordingPainter();
    fillRows(context, { x: 40.2, y: 100.1, rows: ringRows(6, 2) });
    const rects = drawnRects(log);
    expect(offGrid(rects)).toEqual([]);
    const middle = rects.filter((rect) => rect.y === 100);
    expect(middle.map((rect) => rect.x)).toEqual([34, 45.5]);
  });
});

describe('fine lines and rects', () => {
  it('step a line one screen pixel at a time, with no gaps or overlaps along it', () => {
    const { context, log } = recordingPainter();
    fineLine(context, { from: { x: 10, y: 10 }, to: { x: 20.3, y: 14.1 } });
    const rects = drawnRects(log);
    expect(offGrid(rects)).toEqual([]);
    const ordered = [...rects].sort((first, second) => first.x - second.x);
    let x = 10;
    for (const rect of ordered) {
      expect(rect.x).toBe(x);
      expect(rect.height).toBe(PIXEL);
      x += rect.width;
    }
    expect(x).toBe(21);
    expect(rects.length).toBeLessThan(21);
  });

  it('keep a rect at least a screen pixel on the grid', () => {
    const { context, log } = recordingPainter();
    fineRect(context, { x: 3.1, y: 2.9, width: 0.1, height: 2.2 });
    expect(drawnRects(log)).toMatchObject([{ x: 3, y: 3, width: 0.5, height: 2 }]);
  });
});
