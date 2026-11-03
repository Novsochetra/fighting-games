import { afterEach, describe, expect, it } from 'vitest';
import {
  AGES,
  CAST,
  GROWING_UP,
  MOODS,
  PORTRAIT_SIZE,
  VILLAGER_COUNT,
  drawPortrait,
  setPortraitCanvasFactory,
} from '../../../../src/render/portraits/index.js';
import { createPixelCanvas } from '../../../support/pixel-canvas.js';

const MARGIN = 6;

const everyone = [
  ...Object.keys(GROWING_UP).flatMap((character) => AGES.map((age) => ({ character, age }))),
  ...Object.keys(CAST).map((character) => ({ character })),
  ...Array.from({ length: VILLAGER_COUNT }, (_, variant) => ({ character: 'villager', variant })),
];

const nameOf = ({ character, age, variant }) =>
  [character, age, variant].filter((part) => part !== undefined).join(' ');

function draw(face, { scale = 1, flip = false } = {}) {
  const size = PORTRAIT_SIZE * scale;
  const canvas = createPixelCanvas(size + MARGIN * 2, size + MARGIN * 2);

  drawPortrait(canvas.getContext('2d'), {
    mood: 'neutral',
    ...face,
    x: MARGIN,
    y: MARGIN,
    scale,
    flip,
  });

  return canvas;
}

const alphaAt = (canvas, x, y) => canvas.data[(y * canvas.width + x) * 4 + 3];

function paintedOutsideBox(canvas, size) {
  let count = 0;

  for (let y = 0; y < canvas.height; y += 1) {
    for (let x = 0; x < canvas.width; x += 1) {
      const inside = x >= MARGIN && y >= MARGIN && x < MARGIN + size && y < MARGIN + size;

      count += !inside && alphaAt(canvas, x, y) > 0 ? 1 : 0;
    }
  }

  return count;
}

function pixelOf(canvas, x, y) {
  const at = ((y + MARGIN) * canvas.width + x + MARGIN) * 4;

  return canvas.data.subarray(at, at + 4).join();
}

describe('drawing the portraits', () => {
  afterEach(() => setPortraitCanvasFactory(null));

  it('draws every face in every mood inside its own box, and paints most of it', () => {
    for (const face of everyone) {
      for (const mood of MOODS) {
        const canvas = draw({ ...face, mood }, { scale: 2 });
        const painted = canvas.data.filter((_, i) => i % 4 === 3 && canvas.data[i] > 0).length;

        expect(paintedOutsideBox(canvas, PORTRAIT_SIZE * 2), `${nameOf(face)} ${mood}`).toBe(0);
        expect(painted, `${nameOf(face)} ${mood}`).toBeGreaterThan(PORTRAIT_SIZE * PORTRAIT_SIZE);
      }
    }
  });

  it('mirrors a face exactly when flipped', () => {
    for (const face of [
      everyone[0],
      { character: 'coach-sokha', mood: 'angry' },
      { character: 'nobody' },
    ]) {
      const plain = draw(face);
      const flipped = draw(face, { flip: true });

      for (let y = 0; y < PORTRAIT_SIZE; y += 1) {
        for (let x = 0; x < PORTRAIT_SIZE; x += 1) {
          expect(pixelOf(flipped, PORTRAIT_SIZE - 1 - x, y)).toBe(pixelOf(plain, x, y));
        }
      }
    }
  });

  it('gives no two faces the same picture', () => {
    const pictures = everyone.map((face) => Buffer.from(draw(face).data).toString('base64'));

    expect(new Set(pictures).size).toBe(everyone.length);
  });

  it('changes the face with the mood', () => {
    for (const face of everyone) {
      const pictures = MOODS.map((mood) =>
        Buffer.from(draw({ ...face, mood }).data).toString('base64'),
      );

      expect(new Set(pictures).size, nameOf(face)).toBe(MOODS.length);
    }
  });

  it('draws someone it does not know as a silhouette, and an unknown mood as neutral', () => {
    const stranger = draw({ character: 'nobody' });

    expect(paintedOutsideBox(stranger, PORTRAIT_SIZE)).toBe(0);
    expect(alphaAt(stranger, MARGIN + 32, MARGIN + 30)).toBe(255);
    expect(draw({ character: 'neary', mood: 'puzzled' }).data).toEqual(
      draw({ character: 'neary' }).data,
    );
  });

  it('scales by whole pixels: each art pixel becomes a solid square', () => {
    const small = draw({ character: 'rafael', mood: 'happy' });
    const big = draw({ character: 'rafael', mood: 'happy' }, { scale: 3 });
    const bigPixel = (x, y) => {
      const at = ((y + MARGIN) * big.width + x + MARGIN) * 4;

      return big.data.subarray(at, at + 4).join();
    };

    for (let y = 0; y < PORTRAIT_SIZE; y += 1) {
      for (let x = 0; x < PORTRAIT_SIZE; x += 1) {
        expect(bigPixel(x * 3 + 2, y * 3 + 1)).toBe(pixelOf(small, x, y));
      }
    }
  });

  it('draws the same picture from its canvas cache as straight', () => {
    const faces = [
      { character: 'sochetra', age: 'child', mood: 'cry' },
      { character: 'villager', variant: 3 },
    ];
    const straight = faces.map((face) => draw(face, { scale: 2, flip: true }).data);

    setPortraitCanvasFactory(createPixelCanvas);

    faces.forEach((face, index) => {
      expect(draw(face, { scale: 2, flip: true }).data).toEqual(straight[index]);
      expect(draw(face, { scale: 2, flip: true }).data).toEqual(straight[index]);
    });
  });
});
