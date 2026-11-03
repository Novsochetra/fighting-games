import { describe, expect, it } from 'vitest';
import { STAMP } from '../../../../src/render/actors/number-stamp.js';
import { maskAt, rowAnchors, torsoAnchor } from '../../../../src/render/actors/torso-anchor.js';

// a frame whose shirt is the rectangle given, the rest bare
function shirtCell({ left, top, width, height }) {
  return {
    width: 40,
    height: 40,
    isShirt: (x, y) => x >= left && x < left + width && y >= top && y < top + height,
  };
}

const BARE = { width: 40, height: 40, isShirt: () => false };

describe("the number's place on one frame", () => {
  it('is in the middle of a wide back, under the shoulders', () => {
    const anchor = torsoAnchor(shirtCell({ left: 10, top: 8, width: 15, height: 14 }), 'back');

    expect(anchor.x + (STAMP.width - 1) / 2).toBeCloseTo(17, 0);
    expect(anchor.y).toBeGreaterThanOrEqual(8);
    expect(anchor.y + STAMP.height).toBeLessThanOrEqual(22);
  });

  it('sits lower on the chest than on the back, under the collar', () => {
    const torso = shirtCell({ left: 10, top: 8, width: 15, height: 16 });

    expect(torsoAnchor(torso, 'chest').y).toBeGreaterThan(torsoAnchor(torso, 'back').y);
  });

  it('keeps its outline on a back just wide enough for it', () => {
    const torso = shirtCell({ left: 10, top: 8, width: STAMP.width, height: 14 });
    const anchor = torsoAnchor(torso, 'back');

    expect(anchor.x).toBe(10);
    expect(maskAt(torso, anchor).every((bit) => bit === 1)).toBe(true);
  });

  it('steps up or across to keep the outline on a back that narrows under it', () => {
    const shoulders = shirtCell({ left: 10, top: 8, width: 13, height: 8 });
    const anchor = torsoAnchor(shoulders, 'back');

    expect(maskAt(shoulders, anchor).every((bit) => bit === 1)).toBe(true);
  });

  it('is nowhere on a shirt too narrow for the digits, or with no shirt', () => {
    expect(
      torsoAnchor(shirtCell({ left: 10, top: 8, width: STAMP.width - 3, height: 14 }), 'back'),
    ).toBeNull();
    expect(torsoAnchor(BARE, 'back')).toBeNull();
  });
});

describe("the number's places along a row of frames", () => {
  const wide = shirtCell({ left: 10, top: 8, width: 15, height: 14 });
  const narrow = shirtCell({ left: 10, top: 8, width: 4, height: 14 });

  it('keeps a frame with no room at its neighbour place, as an arm swings over it', () => {
    const anchors = rowAnchors([wide, wide, narrow, wide], 'back');

    expect(anchors.every(Boolean)).toBe(true);
    expect(anchors[2]).toEqual(anchors[1]);
  });

  it('shows none in a row with room in fewer than half its frames, as it would blink', () => {
    expect(rowAnchors([wide, narrow, narrow, narrow], 'back')).toEqual([null, null, null, null]);
  });
});

describe("the clip of the number's box", () => {
  it('marks the pixels of the box that are shirt, and leaves out an arm', () => {
    const torso = shirtCell({ left: 10, top: 8, width: 6, height: 14 });
    const mask = maskAt(torso, { x: 10, y: 10 });

    expect(mask).toHaveLength(STAMP.width * STAMP.height);
    expect(mask[0]).toBe(1);
    expect(mask[STAMP.width - 1]).toBe(0);
  });
});
