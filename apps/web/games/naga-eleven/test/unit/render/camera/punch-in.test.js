import { describe, expect, it } from 'vitest';

import { WORLD_VIEW } from '../../../../src/config.js';
import { PUNCH_SCALE, punchTransform } from '../../../../src/render/camera/punch-in.js';

const shownBy = ({ scale, x, y }) => ({
  left: -x / scale,
  top: -y / scale,
  right: (WORLD_VIEW.width - x) / scale,
  bottom: (WORLD_VIEW.height - y) / scale,
});

describe('a punch-in', () => {
  it('draws the world twice as big, on whole pixels, about the point', () => {
    const zoom = punchTransform({ x: 700.4, y: 420.6 });
    const shown = shownBy(zoom);

    expect(zoom.scale).toBe(PUNCH_SCALE);
    expect(Number.isInteger(zoom.x) && Number.isInteger(zoom.y)).toBe(true);
    expect((shown.left + shown.right) / 2).toBeCloseTo(700.4, 0);
    expect((shown.top + shown.bottom) / 2).toBeCloseTo(420.6, 0);
  });

  it('never shows past what the world drew, near an edge of the view', () => {
    for (const point of [
      { x: 0, y: 0 },
      { x: WORLD_VIEW.width, y: WORLD_VIEW.height },
    ]) {
      const shown = shownBy(punchTransform(point));

      expect(shown.left).toBeGreaterThanOrEqual(0);
      expect(shown.top).toBeGreaterThanOrEqual(0);
      expect(shown.right).toBeLessThanOrEqual(WORLD_VIEW.width);
      expect(shown.bottom).toBeLessThanOrEqual(WORLD_VIEW.height);
    }
  });
});
