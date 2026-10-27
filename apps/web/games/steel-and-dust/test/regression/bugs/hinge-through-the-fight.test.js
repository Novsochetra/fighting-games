import { describe, expect, it } from 'vitest';
import { menuBox } from '../../../src/ui/screen/menu-area.js';
import { arrangeStage } from '../../../src/ui/screen/stage-layout.js';
import { hingeOf } from '../../../src/ui/screen/viewport-segments.js';

// Bug: on a Surface Duo the hinge ran down the middle of the fight and through the title menu's
// buttons, on a Galaxy Z Fold folded on a table the fold cut the road off the sky, and on an
// unfolded Fold the touch buttons covered the road while bars stood empty above and below it.

const rect = (x, y, width, height) => ({ x, y, width, height });
const noInsets = { top: 0, right: 0, bottom: 0, left: 0 };
const overlaps = (one, other) =>
  one.x < other.x + other.width &&
  other.x < one.x + one.width &&
  one.y < other.y + other.height &&
  other.y < one.y + one.height;

// each phone's screen and the two segments Chrome reports for it once it is folded; a Duo's two
// screens have a gap between them, a Fold's or a Flip's one screen only a fold
const DUO_AS_BOOK = [1114, 720, [rect(0, 0, 540, 720), rect(574, 0, 540, 720)]];
const DUO_SIDEWAYS = [720, 1114, [rect(0, 0, 720, 540), rect(0, 574, 720, 540)]];
const FOLDED = {
  'Surface Duo held like a book': DUO_AS_BOOK,
  'Surface Duo turned sideways': DUO_SIDEWAYS,
  'Galaxy Z Fold on a table': [1104, 884, [rect(0, 0, 1104, 442), rect(0, 442, 1104, 442)]],
  'Galaxy Z Flip on a table': [412, 1004, [rect(0, 0, 412, 502), rect(0, 502, 412, 502)]],
};

// the strip between the segments, a pixel wide where they touch
function hingeLine([first, second]) {
  const stacked = second.y >= first.y + first.height;
  const across = (from, to) => Math.max(1, to - from);

  return stacked
    ? rect(0, first.y + first.height, first.width, across(first.y + first.height, second.y))
    : rect(first.x + first.width, 0, across(first.x + first.width, second.x), first.height);
}

describe('a folded phone', () => {
  for (const [phone, [width, height, segments]] of Object.entries(FOLDED)) {
    it(`keeps the fight off the hinge of a ${phone}`, () => {
      const screen = { width, height, safe: noInsets, buttonScale: 1, hinge: hingeOf(segments) };

      for (const touch of [true, false]) {
        expect(overlaps(arrangeStage({ ...screen, touch }).rect, hingeLine(segments))).toBe(false);
      }
    });
  }

  it('keeps the menus off the gap between the two screens of a Surface Duo', () => {
    for (const [width, height, segments] of [DUO_AS_BOOK, DUO_SIDEWAYS]) {
      const menus = menuBox({ hinge: hingeOf(segments), width, height });

      expect(overlaps(menus, hingeLine(segments))).toBe(false);
    }
  });

  it('keeps the touch buttons off the road of an unfolded Fold', () => {
    const screen = { width: 1104, height: 884, safe: noInsets, buttonScale: 1, hinge: null };
    const { rect: stage } = arrangeStage({ ...screen, touch: true });

    expect(stage.y + stage.height).toBeLessThanOrEqual(884 - 260);
  });
});
