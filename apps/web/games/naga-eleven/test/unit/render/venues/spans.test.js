import { describe, expect, it } from 'vitest';
import { FORMATS } from '../../../../src/data/formats.js';
import { markingsOf } from '../../../../src/render/venues/ground/markings.js';
import { lineSpans } from '../../../../src/render/venues/ground/spans.js';
import { layoutOf } from '../../../../src/render/venues/layout.js';

const THICK = { along: 2.3, across: 1.8, spot: 5 };
const layout = layoutOf({ format: '11', pitch: FORMATS[11].pitch, goal: FORMATS[11].goal });
const markings = markingsOf(layout);
const rowAt = (y, depth = 1.6) => ({ y, top: y - depth / 2, bottom: y + depth / 2 });

describe('the lines of the pitch, row by row', () => {
  it('runs a touchline the whole length of the pitch', () => {
    const spans = lineSpans(markings, rowAt(0), THICK);

    expect(spans.some(([from, to]) => from <= 0 && to >= layout.pitch.length)).toBe(true);
  });

  it('crosses a row in the middle at the goal lines, the halfway line and the centre circle', () => {
    const spans = lineSpans(markings, rowAt(layout.middle.y), THICK);
    const covers = (x) => spans.some(([from, to]) => from <= x && to >= x);
    const radius = layout.areas.centreCircle;

    expect([0, layout.middle.x, layout.pitch.length].every(covers)).toBe(true);
    expect(covers(layout.middle.x - radius) && covers(layout.middle.x + radius)).toBe(true);
  });

  it('draws the centre circle with no gap where it runs nearly level', () => {
    const { x, y } = layout.middle;
    const radius = layout.areas.centreCircle;
    const onRing = ([from, to]) =>
      Math.abs(Math.abs(from - x) - radius) < radius && Math.abs(to - x) <= radius + 3;

    for (let row = y - radius - 0.6; row < y; row += 1.6) {
      expect(lineSpans(markings, rowAt(row), THICK).some(onRing)).toBe(true);
    }
  });

  it('keeps each penalty arc outside its box', () => {
    const row = rowAt(layout.middle.y);
    const arcs = markings.rings.filter(
      (ring) => ring.radius === layout.areas.centreCircle && ring.x !== layout.middle.x,
    );

    for (const arc of arcs) {
      const front =
        arc.x < layout.middle.x
          ? layout.areas.box.depth
          : layout.pitch.length - layout.areas.box.depth;
      const inside = lineSpans(
        { ...markings, rings: [arc], along: [], across: [], spots: [] },
        row,
        THICK,
      );

      expect(
        inside.every(([from, to]) => (arc.x < layout.middle.x ? from >= front : to <= front)),
      ).toBe(true);
    }
  });
});
