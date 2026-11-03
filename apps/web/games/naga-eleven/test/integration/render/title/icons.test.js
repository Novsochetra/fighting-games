import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { TITLE_ART } from '../../../../src/art/title/palette.js';
import { colorOf } from '../../../../src/render/backdrops/raster.js';
import { decodePng } from '../../../support/png.js';

const asset = (name) => readFileSync(new URL(`../../../../assets/${name}`, import.meta.url));

// a jpeg names its size in its start-of-frame segment
function jpegSize(bytes) {
  let at = 2;

  while (at < bytes.length) {
    const marker = bytes[at + 1];
    const length = bytes.readUInt16BE(at + 2);

    if (marker >= 0xc0 && marker <= 0xc2) {
      return { width: bytes.readUInt16BE(at + 7), height: bytes.readUInt16BE(at + 5) };
    }

    at += 2 + length;
  }

  return null;
}

describe('the icons and the share image painted from the title art', () => {
  it.each([
    ['icons/icon-512.png', 512],
    ['icons/icon-maskable-512.png', 512],
    ['icons/icon-192.png', 192],
    ['icons/apple-touch-icon.png', 180],
    ['icons/icon-32.png', 32],
  ])('%s is %i pixels square and opaque', (name, size) => {
    const image = decodePng(asset(name));

    expect([image.width, image.height]).toEqual([size, size]);
    expect(image.data.filter((_, i) => i % 4 === 3).every((alpha) => alpha === 255)).toBe(true);
  });

  // Android may crop a maskable icon to a circle 80% of its side, so the boy must stand inside it
  it('keeps the boy and his ball inside the circle a maskable icon may be cropped to', () => {
    const image = decodePng(asset('icons/icon-maskable-512.png'));
    const [red, green, blue] = colorOf(TITLE_ART.boy[0]);
    const safeRadius = image.width * 0.4;
    const boyReach = [];

    for (let y = 0; y < image.height; y += 1) {
      for (let x = 0; x < image.width; x += 1) {
        const at = (y * image.width + x) * 4;
        const isBoy =
          image.data[at] === red && image.data[at + 1] === green && image.data[at + 2] === blue;

        if (isBoy) {
          boyReach.push(Math.hypot(x + 0.5 - image.width / 2, y + 0.5 - image.height / 2));
        }
      }
    }

    expect(boyReach.length).toBeGreaterThan(1000);
    expect(Math.max(...boyReach)).toBeLessThan(safeRadius);
  });

  it('shares a 1200 by 630 jpeg', () => {
    const bytes = asset('social/share.jpg');

    expect([bytes[0], bytes[1]]).toEqual([0xff, 0xd8]);
    expect(jpegSize(bytes)).toEqual({ width: 1200, height: 630 });
  });
});
