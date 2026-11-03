import { describe, expect, it } from 'vitest';
import { VIEW } from '../../../../src/config.js';
import { innerRect } from '../../../../src/render/dialogue/frame.js';
import { overlayLayout, sceneLayout } from '../../../../src/render/dialogue/layout.js';
import { ART } from '../../../../src/render/dialogue/pixel-map.js';

const within = (inner, outer) =>
  inner.x >= outer.x &&
  inner.y >= outer.y &&
  inner.x + inner.width <= outer.x + outer.width &&
  inner.y + inner.height <= outer.y + outer.height;

const VIEW_RECT = { x: 0, y: 0, ...VIEW };

describe('where a line is laid out', () => {
  for (const [name, layoutOf] of [
    ['a full-screen scene', sceneLayout],
    ['an overlay', overlayLayout],
  ]) {
    it(`keeps ${name}’s words inside its box, on either side`, () => {
      for (const side of ['left', 'right']) {
        const layout = layoutOf(side);

        expect(within(layout.text, innerRect(layout.box, layout.frame))).toBe(true);
        expect(within(layout.box, VIEW_RECT)).toBe(true);
      }
    });

    it(`sets ${name}’s box on whole art pixels`, () => {
      const { box } = layoutOf('left');

      for (const value of [box.x, box.y, box.width, box.height]) {
        expect(value % ART).toBe(0);
      }
    });
  }

  it('stands a full-screen speaker on their own side, on the box’s edge', () => {
    const left = sceneLayout('left');
    const right = sceneLayout('right');

    expect(left.portrait.x + left.portrait.size).toBeLessThan(VIEW.width / 2);
    expect(right.portrait.x).toBeGreaterThan(VIEW.width / 2);
    expect(left.portrait.y + left.portrait.size).toBeGreaterThan(left.box.y);
    expect(left.portrait.scale).toBe(2);
  });

  it('shows an overlay’s speaker small, inside the box', () => {
    for (const side of ['left', 'right']) {
      const layout = overlayLayout(side);
      const portrait = { ...layout.portrait, width: 64, height: 64 };

      expect(layout.portrait.scale).toBe(1);
      expect(within(portrait, innerRect(layout.box, layout.frame))).toBe(true);
      expect(within(layout.window, innerRect(layout.box, layout.frame))).toBe(true);
    }
  });
});
