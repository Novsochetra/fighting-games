import { describe, expect, it } from 'vitest';
import { pickLaunchSource } from '../../../src/home/launch-source.js';

const box = (top, height = 100) => ({
  getBoundingClientRect: () => ({ top, bottom: top + height, width: 160, height }),
});

describe('pickLaunchSource', () => {
  it('opens from the carousel card while it is on screen', () => {
    const card = box(200);
    expect(pickLaunchSource([card, box(900)], 800)).toBe(card);
  });

  it('opens from the library tile once the card has scrolled away', () => {
    const tile = box(300);
    expect(pickLaunchSource([box(-400), tile], 800)).toBe(tile);
  });

  it('falls back to the card when neither shows, and to the tile when there is no card', () => {
    const card = box(-400);
    expect(pickLaunchSource([card, box(1200)], 800)).toBe(card);
    const tile = box(1200);
    expect(pickLaunchSource([null, tile], 800)).toBe(tile);
    expect(pickLaunchSource([null, undefined], 800)).toBeNull();
  });

  it('skips a box with no size, such as a hidden one', () => {
    const tile = box(100);
    expect(pickLaunchSource([box(100, 0), tile], 800)).toBe(tile);
  });
});
