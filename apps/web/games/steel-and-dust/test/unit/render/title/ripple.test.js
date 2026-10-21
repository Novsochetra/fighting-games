import { describe, expect, it } from 'vitest';
import { drawRipple, rippleOffset } from '../../../../src/render/title/ripple.js';
import { PAINTING, drawnRows, record, ticksUpTo } from './title-recorder.js';

const RIPPLE = {
  kind: 'ripple',
  top: 100,
  bottom: 160,
  reach: 2,
  areas: [
    { left: 40, right: 200, top: 101, bottom: 130 },
    { left: 60, right: 180, top: 130, bottom: 158 },
  ],
};
const TICKS = ticksUpTo(1200, 1);
const rows = (from, to) => Array.from({ length: to - from }, (_, i) => from + i);
const offsetsOf = (y) => TICKS.map((tick) => rippleOffset(RIPPLE, y, tick));
const reachOf = (y) => Math.max(...offsetsOf(y).map(Math.abs));

describe('the moat ripple', () => {
  it('moves each row a whole pixel or two at most', () => {
    for (const y of rows(RIPPLE.top, RIPPLE.bottom)) {
      for (const offset of offsetsOf(y)) {
        expect(Number.isInteger(offset)).toBe(true);
        expect(Math.abs(offset)).toBeLessThanOrEqual(2);
      }
    }
  });

  it('leaves the far water by the shore still and stirs the near water most', () => {
    expect(reachOf(RIPPLE.top)).toBe(0);
    expect(reachOf(RIPPLE.top + 10)).toBeLessThanOrEqual(1);
    expect(reachOf(RIPPLE.bottom - 2)).toBe(2);
  });

  it('drifts calmly: a row never jumps more than a pixel from one tick to the next', () => {
    for (const y of rows(RIPPLE.top, RIPPLE.bottom)) {
      const offsets = offsetsOf(y);
      offsets.slice(1).forEach((offset, i) => {
        expect(Math.abs(offset - offsets[i])).toBeLessThanOrEqual(1);
      });
    }
  });

  it('sways both ways and rests often, so the reflection keeps its shape', () => {
    const offsets = rows(RIPPLE.top, RIPPLE.bottom).flatMap(offsetsOf);
    const share = (test) => offsets.filter(test).length / offsets.length;
    expect(share((offset) => offset === 0)).toBeGreaterThan(0.35);
    expect(share((offset) => offset > 0)).toBeGreaterThan(0.2);
    expect(share((offset) => offset < 0)).toBeGreaterThan(0.2);
  });

  it('redraws only rows that moved, each kept inside its stretch of water', () => {
    for (const tick of ticksUpTo(600, 37)) {
      const drawn = drawnRows(record((painter) => drawRipple(painter, { effect: RIPPLE, tick, painting: PAINTING })).log);
      expect(drawn.length).toBeGreaterThan(0);
      for (const row of drawn) {
        const area = RIPPLE.areas.find((each) => row.y >= each.top && row.y < each.bottom);
        const offset = rippleOffset(RIPPLE, row.y, tick);
        expect(offset).not.toBe(0);
        expect(row).toMatchObject({
          x: area.left,
          width: area.right - area.left,
          height: 1,
          sy: row.y,
          sx: area.left - offset,
        });
      }
    }
  });
});
