import { describe, expect, it } from 'vitest';
import { hatCover, withoutScraps } from '../../../../../src/render/portraits/kit/hats.js';

const HAT = [
  { x: 10, y: 4 },
  { x: 10, y: 10 },
  { x: 11, y: 10 },
  { x: 12, y: 12 },
  { x: 13, y: 12 },
];

describe('what a hat hides', () => {
  const hidden = hatCover(HAT, 20);

  it('hides hair above its lower edge in the columns it spans', () => {
    expect(hidden({ x: 10, y: 9 })).toBe(true);
    expect(hidden({ x: 12, y: 12 })).toBe(true);
    expect(hidden({ x: 12, y: 13 })).toBe(false);
  });

  it('hides hair beside it up to the brim of its nearest column', () => {
    expect(hidden({ x: 2, y: 10 })).toBe(true);
    expect(hidden({ x: 2, y: 11 })).toBe(false);
    expect(hidden({ x: 18, y: 12 })).toBe(true);
  });

  it('hides any hair below the brim in front of the face', () => {
    expect(hidden({ x: 21, y: 30 })).toBe(true);
    expect(hidden({ x: 19, y: 30 })).toBe(false);
  });

  it('hides nothing when there is no hat', () => {
    expect(hatCover([], 20)({ x: 0, y: 0 })).toBe(false);
  });
});

describe('the hair a hat cut through', () => {
  const block = (left, top, width, height) =>
    Array.from({ length: width * height }, (_, i) => ({
      x: left + (i % width),
      y: top + Math.floor(i / width),
      letter: 'h',
    }));

  it('keeps a lock of twelve pixels or more', () => {
    expect(withoutScraps(block(0, 0, 4, 3))).toHaveLength(12);
  });

  it('drops a scrap floating on its own', () => {
    const kept = withoutScraps([...block(0, 0, 4, 4), ...block(10, 0, 2, 2)]);

    expect(kept).toHaveLength(16);
    expect(kept.every(({ x }) => x < 10)).toBe(true);
  });

  it('counts pixels touching at a corner as one lock', () => {
    const diagonal = Array.from({ length: 12 }, (_, i) => ({ x: i, y: i, letter: 'h' }));

    expect(withoutScraps(diagonal)).toHaveLength(12);
  });
});
