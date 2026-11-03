import { describe, expect, it } from 'vitest';
import { drawGlyph, GLYPH_SIZE } from '../../../../src/render/training/glyphs.js';
import { line, noise, oval, pulse, ring } from '../../../../src/render/training/pixels.js';
import { createPixelCanvas } from '../../../support/pixel-canvas.js';

function paintedOf(draw, size = 40) {
  const canvas = createPixelCanvas(size, size);
  const context = canvas.getContext('2d');
  const painted = new Set();

  draw(context);

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      if (canvas.data[(y * size + x) * 4 + 3] > 0) {
        painted.add(`${x},${y}`);
      }
    }
  }

  return painted;
}

const mirrored = (painted, middle) =>
  [...painted].every((spot) => {
    const [x, y] = spot.split(',').map(Number);

    return painted.has(`${2 * middle - x},${y}`) && painted.has(`${x},${2 * middle - y}`);
  });

describe('the pixel helpers', () => {
  it('fill a circle on whole pixels, the same each way round', () => {
    const painted = paintedOf((context) => oval(context, '#ffffff', { x: 20, y: 20, radiusX: 6 }));

    expect(mirrored(painted, 20)).toBe(true);
    expect(painted.has('20,14')).toBe(true);
    expect(painted.has('20,13')).toBe(false);
    expect(painted.has('26,20')).toBe(true);
  });

  it('leave the middle of a ring open', () => {
    const painted = paintedOf((context) =>
      ring(context, '#ffffff', { x: 20, y: 20, radius: 10, width: 2 }),
    );

    expect(mirrored(painted, 20)).toBe(true);
    expect(painted.has('20,20')).toBe(false);
    expect(painted.has('20,10')).toBe(true);
    expect(painted.has('20,11')).toBe(true);
    expect(painted.has('20,12')).toBe(false);
  });

  it('draw a line pixel by pixel from end to end', () => {
    const painted = paintedOf((context) =>
      line(context, '#ffffff', [
        { x: 2, y: 3 },
        { x: 12, y: 8 },
      ]),
    );

    expect(painted.size).toBe(11);
    expect(painted.has('2,3') && painted.has('12,8')).toBe(true);
  });

  it('scatter the same way every time, between 0 and 1', () => {
    const values = Array.from({ length: 200 }, (_, i) => noise(i));

    expect(values).toEqual(Array.from({ length: 200 }, (_, i) => noise(i)));
    expect(Math.min(...values)).toBeGreaterThanOrEqual(0);
    expect(Math.max(...values)).toBeLessThan(1);
    expect(new Set(values).size).toBe(200);
  });

  it('pulse from 0 up to 1 and back over a period', () => {
    expect(pulse(0, 40)).toBe(0);
    expect(pulse(20, 40)).toBe(1);
    expect(pulse(10, 40)).toBe(0.5);
    expect(pulse(40, 40)).toBe(0);
    expect(pulse(-10, 40)).toBe(0.5);
  });
});

describe('the grade letters', () => {
  it.each(['S', 'A', 'B', 'C'])('draw %s inside its box and an outline round it', (letter) => {
    const scale = 3;
    const painted = paintedOf((context) => drawGlyph(context, { letter, x: 10, y: 10, scale }), 50);
    const xs = [...painted].map((spot) => Number(spot.split(',')[0]));

    expect(Math.min(...xs)).toBe(10 - 1);
    expect(Math.max(...xs)).toBe(10 + GLYPH_SIZE.width * scale);
    expect(painted.size).toBeGreaterThan(40);
  });
});
