import { describe, expect, it } from 'vitest';
import { chooserPlace } from '../../../src/ui/skins/key-chooser.js';

const screen = { width: 844, height: 390 };
const size = { width: 180, height: 84 };
const keyAt = (left, top, side = 64) => ({ left, top, right: left + side, bottom: top + side });

describe('where the key chooser stands', () => {
  it('over the key, centred on it, where there is room under the bar', () => {
    const key = keyAt(300, 250);

    expect(chooserPlace({ key, size, screen, ceiling: 90 })).toEqual({ left: 242, top: 158 });
  });

  it('under the key where the bar or the top of the screen leaves no room over it', () => {
    expect(chooserPlace({ key: keyAt(300, 20), size, screen })).toEqual({ left: 242, top: 92 });
    expect(chooserPlace({ key: keyAt(300, 150), size, screen, ceiling: 90 }).top).toBe(222);
  });

  it('inside the screen by a key at its edge', () => {
    expect(chooserPlace({ key: keyAt(4, 20), size, screen }).left).toBe(8);
    expect(chooserPlace({ key: keyAt(790, 20), size, screen }).left).toBe(656);
    expect(chooserPlace({ key: keyAt(300, 300), size, screen, ceiling: 280 }).top).toBe(298);
  });
});
