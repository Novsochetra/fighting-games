import { describe, expect, it } from 'vitest';
import { PIGGY, SKY } from '../../../src/art/palette.js';
import { PIGGY_SIZE } from '../../../src/art/piggy.js';
import { fitCanvas, pixelScale } from '../../../src/render/fit.js';
import { paintLive } from '../../../src/render/paint-live.js';
import { paintPiggy } from '../../../src/render/paint-piggy.js';
import { paintStill } from '../../../src/render/paint-still.js';
import { buildScene, bulbsOf } from '../../../src/render/scene.js';
import { drawSprite } from '../../../src/render/sprite.js';
import { fakeContext } from '../../support/fake-context.js';

function seeded(seed) {
  let state = seed;

  return () => {
    state = (state * 16807) % 2147483647;

    return state / 2147483647;
  };
}

describe('the pixel scale', () => {
  it('draws the art three to a pixel on a phone, and larger on a larger screen', () => {
    expect(pixelScale({ width: 390, height: 844 })).toBe(3);
    expect(pixelScale({ width: 844, height: 390 })).toBe(3);
    expect(pixelScale({ width: 1920, height: 1080 })).toBe(5);
    expect(pixelScale({ width: 200, height: 200 })).toBe(2);
  });

  it('sizes a canvas to cover the screen in whole art pixels', () => {
    const canvas = { style: {} };

    fitCanvas(canvas, { width: 390, height: 844 }, 3);

    expect(canvas).toMatchObject({ width: 130, height: 282 });
    expect(canvas.style).toEqual({ width: '390px', height: '846px' });
  });
});

describe('the market scene', () => {
  const size = { width: 130, height: 282 };
  const scene = buildScene(seeded(7), size);

  it('lines stalls along the whole horizon, low on the screen', () => {
    const lastStall = scene.stalls.at(-1);

    expect(scene.horizon).toBeGreaterThan(size.height * 0.75);
    expect(scene.stalls.length).toBeGreaterThan(3);
    expect(lastStall.x + lastStall.width).toBeGreaterThan(size.width - 12);
  });

  it('keeps the stars in the sky, above the stalls', () => {
    expect(scene.stars.length).toBeGreaterThan(20);
    expect(scene.stars.every((star) => star.y < scene.horizon && star.x < size.width)).toBe(true);
  });

  it('hangs each string of lights lowest in the middle', () => {
    const bulbs = bulbsOf(scene, scene.strings[0]);
    const middle = bulbs[Math.floor(bulbs.length / 2)];

    expect(bulbs.length).toBeGreaterThan(10);
    expect(middle.y).toBeGreaterThan(bulbs[0].y);
    expect(middle.y).toBeGreaterThan(bulbs.at(-1).y);
  });

  it('paints the sky across the whole screen, then the market over it', () => {
    const context = fakeContext(size);

    paintStill(context, scene);

    const sky = context.rects.filter(
      (rect) => SKY.includes(rect.color) && rect.width === size.width,
    );

    expect(sky).toHaveLength(SKY.length);
    expect(context.rects.length).toBeGreaterThan(200);
  });

  it('moves the lights and stars from one moment to the next, and leaves the paint opaque', () => {
    const now = fakeContext(size);
    const later = fakeContext(size);

    paintLive(now, scene, 1);
    paintLive(later, scene, 9.5);

    expect(now.rects.length).toBeGreaterThan(scene.stars.length);
    expect(later.rects).not.toEqual(now.rects);
    expect(now.globalAlpha).toBe(1);
  });
});

describe('sprites', () => {
  it('paint a pixel a letter and skip what is see-through', () => {
    const context = fakeContext();

    drawSprite(context, ['a.', '.b'], { a: '#111111', b: '#222222' }, { x: 5, y: 9 });

    expect(context.rects).toEqual([
      { x: 5, y: 9, width: 1, height: 1, color: '#111111' },
      { x: 6, y: 10, width: 1, height: 1, color: '#222222' },
    ]);
  });

  it('paint the pig inside its canvas, lifted by its hop', () => {
    const grounded = fakeContext({ width: 24, height: 22 });
    const hopping = fakeContext({ width: 24, height: 22 });

    paintPiggy(grounded, { mood: 'idle', lift: 0 });
    paintPiggy(hopping, { mood: 'happy', lift: 3 });

    for (const { rects, canvas } of [grounded, hopping]) {
      expect(rects.every((rect) => rect.x >= 0 && rect.x < canvas.width)).toBe(true);
      expect(rects.every((rect) => rect.y >= 0 && rect.y < canvas.height)).toBe(true);
      expect(rects.every((rect) => Object.values(PIGGY).includes(rect.color))).toBe(true);
    }

    expect(Math.min(...hopping.rects.map((rect) => rect.y))).toBe(
      Math.min(...grounded.rects.map((rect) => rect.y)) - 3,
    );
    expect(grounded.rects.length).toBeGreaterThan(PIGGY_SIZE.width * 8);
  });
});
