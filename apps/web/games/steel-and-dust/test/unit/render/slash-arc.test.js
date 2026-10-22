import { describe, expect, it } from 'vitest';
import { slashArc } from '../../../src/render/fx/slash-arc.js';

// a painter that keeps every segment it is asked to draw
function recordingPainter() {
  const segments = [];
  const painter = {
    use: () => painter,
    line: (from, to, thickness) => {
      segments.push({ from, to, thickness });
      return painter;
    },
  };
  return { painter, segments };
}

describe("a sword's slash", () => {
  const from = { x: 0, y: 0 };
  const to = { x: 40, y: 0 };

  it('runs from end to end, swelling in its middle and pointed at both ends', () => {
    const { painter, segments } = recordingPainter();
    slashArc(painter, { from, to, bend: 0.2, width: 5, color: '#fff' });
    expect(segments[0].from).toEqual(from);
    expect(segments.at(-1).to).toEqual(to);
    const thicknesses = segments.map((segment) => segment.thickness);
    expect(thicknesses[0]).toBe(1);
    expect(thicknesses.at(-1)).toBe(1);
    expect(Math.max(...thicknesses)).toBe(5);
  });

  it('bows out to its left by its bend, the other way for a negative one, straight for none', () => {
    const middleY = (bend) => {
      const { painter, segments } = recordingPainter();
      slashArc(painter, { from, to, bend, width: 3, color: '#fff' });
      return segments[segments.length / 2].from.y;
    };
    expect(middleY(0.2)).toBeLessThan(-5);
    expect(middleY(-0.2)).toBeGreaterThan(5);
    expect(middleY(0)).toBe(0);
  });
});
