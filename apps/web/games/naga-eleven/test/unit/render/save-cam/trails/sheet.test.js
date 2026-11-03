import { describe, expect, it } from 'vitest';

import { clippedPen } from '../../../../../src/render/duel/clip.js';
import { createPen, shiftedPen } from '../../../../../src/render/duel/pen.js';
import { disc, polygon } from '../../../../../src/render/duel/shapes.js';
import { drawOnSheet, rasterPen } from '../../../../../src/render/save-cam/trails/sheet.js';
import { packed } from '../../../../../src/render/venues/kit/colour.js';
import { createRaster } from '../../../../../src/render/venues/kit/raster.js';
import { createPixelCanvas } from '../../../../support/pixel-canvas.js';

const RECTS = [
  [[3.4, 2.5, 6.2, 1.49], '#ff0000'],
  [[-2.5, 7.5, 4, 2], '#00ff00'],
  [[250.6, 140.2, 9, 9], '#0000ff'],
  [[10, 10, 0.4, 3], '#ffffff'],
];

// a bit of everything a beast is drawn with: rects at odd places, a disc and a polygon
function scribble(pen) {
  RECTS.forEach(([box, color]) => pen.rect(box, color));
  disc(pen, { x: 40.3, y: 30.6, radius: 7.4, color: '#ffd070' });
  polygon(
    pen,
    [
      [60.2, 20.7],
      [90.6, 28.1],
      [70.5, 52.9],
    ],
    '#34b878',
  );
}

const differing = (first, second) => first.filter((value, i) => value !== second[i]).length;

const drawnBy = (draw, { unit = 1, x = 0, y = 0 } = {}) => {
  const canvas = createPixelCanvas(256 * unit, 144 * unit);

  draw(createPen(canvas.getContext('2d'), { unit, x, y }));

  return canvas.data;
};

describe('a pen on a raster', () => {
  it('rounds every rect to the pixels the canvas pen fills', () => {
    const raster = createRaster(256, 144);
    const pen = rasterPen(raster);
    const canvas = createPixelCanvas(256, 144);

    scribble(pen);
    scribble(createPen(canvas.getContext('2d'), { unit: 1 }));

    for (let i = 0; i < raster.pixels.length; i += 1) {
      const [red, green, blue, alpha] = canvas.data.subarray(i * 4, i * 4 + 4);
      const expected =
        alpha === 0
          ? 0
          : packed(
              `#${[red, green, blue].map((value) => value.toString(16).padStart(2, '0')).join('')}`,
            );

      expect(raster.pixels[i], `${i % 256}, ${Math.floor(i / 256)}`).toBe(expected);
    }
  });

  it('keeps a box round all it draws, clipped to the raster', () => {
    const pen = rasterPen(createRaster(40, 30), { x: 4, y: 2 });

    pen.rect([-10, 3, 12, 2], '#ffffff');
    pen.rect([20, 20, 30, 30], '#ffffff');

    expect(pen.box).toEqual({ left: 0, top: 5, right: 40, bottom: 30 });
  });
});

describe('a drawing laid down from a sheet', () => {
  it('is the drawing made straight on the canvas, at any unit and offset', () => {
    for (const options of [{ unit: 3 }, { unit: 1 }, { unit: 2, x: 6, y: -4 }]) {
      const straight = drawnBy(scribble, options);
      const sheeted = drawnBy((pen) => drawOnSheet(pen, scribble), options);

      expect(differing(sheeted, straight)).toBe(0);
    }
  });

  it('shows what lies just past the view’s edge when the view shakes', () => {
    const shaken = (draw) => drawnBy((pen) => draw(shiftedPen(pen, 3, 2)));

    expect(
      differing(
        shaken((pen) => drawOnSheet(pen, scribble)),
        shaken(scribble),
      ),
    ).toBe(0);
  });

  it('is drawn straight on a pen that clips, keeping its clip', () => {
    const box = { x: 30, y: 20, width: 50, height: 30 };
    const clipped = (draw) => drawnBy((pen) => draw(clippedPen(pen, box)));

    expect(
      differing(
        clipped((pen) => drawOnSheet(pen, scribble)),
        clipped(scribble),
      ),
    ).toBe(0);
  });
});
