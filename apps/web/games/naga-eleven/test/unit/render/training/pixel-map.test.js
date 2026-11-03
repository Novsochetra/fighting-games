import { describe, expect, it } from 'vitest';
import { drawPixelMap } from '../../../../src/render/training/pixel-map.js';
import { createPixelCanvas } from '../../../support/pixel-canvas.js';

const MAP = {
  anchor: { x: 1, y: 3 },
  rows: ['.a.', 'abb', '.b.'],
  palette: { a: '#ff0000', b: '#0000ff' },
};

function paintedOf(draw) {
  const canvas = createPixelCanvas(12, 12);
  const painted = new Map();

  draw(canvas.getContext('2d'));

  for (let at = 0; at < canvas.data.length; at += 4) {
    if (canvas.data[at + 3] > 0) {
      const [red, , blue] = canvas.data.subarray(at, at + 3);

      painted.set(`${(at / 4) % 12},${Math.floor(at / 48)}`, red > blue ? 'a' : 'b');
    }
  }

  return painted;
}

describe('a pixel map', () => {
  it('paints each letter in its colour, its anchor at the point given, and leaves dots bare', () => {
    const painted = paintedOf((context) => drawPixelMap(context, MAP, { x: 5, y: 8 }));

    expect(Object.fromEntries(painted)).toEqual({
      '5,5': 'a',
      '4,6': 'a',
      '5,6': 'b',
      '6,6': 'b',
      '5,7': 'b',
    });
  });

  it('moves the rows a shift names, and draws only the rows asked for', () => {
    const lifted = paintedOf((context) =>
      drawPixelMap(context, MAP, { x: 5, y: 8, shift: (row) => ({ x: row === 0 ? 2 : 0, y: 0 }) }),
    );
    const middle = paintedOf((context) => drawPixelMap(context, MAP, { x: 5, y: 8, only: [1] }));

    expect(lifted.get('7,5')).toBe('a');
    expect(lifted.has('5,5')).toBe(false);
    expect([...middle.keys()].sort()).toEqual(['4,6', '5,6', '6,6']);
  });
});
