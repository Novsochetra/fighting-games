import { describe, expect, it } from 'vitest';
import { VIEW } from '../../../../src/config.js';
import { placeClear } from '../../../../src/render/hud/clear-place.js';
import { hudBoxes, minimapRect } from '../../../../src/render/hud/layout.js';
import { fixtureMatch } from '../../../integration/render/actors/match-fixture.js';

const overlaps = (rect, box) =>
  rect.x < box.x + box.width &&
  rect.x + rect.width > box.x &&
  rect.y < box.y + box.height &&
  rect.y + rect.height > box.y;

describe('what floats over a player', () => {
  it('is pushed under a box along the top and over the minimap at the foot', () => {
    const match = fixtureMatch();
    const minimap = minimapRect(match);
    const high = placeClear(match, { x: 20, y: 10, width: 60, height: 12 });
    const low = placeClear(match, { x: minimap.x + 10, y: minimap.y + 20, width: 40, height: 12 });

    expect(high.y).toBeGreaterThan(40);
    expect(low.y + low.height).toBeLessThan(minimap.y);

    for (const rect of [high, low]) {
      expect(hudBoxes(match).some((box) => overlaps(rect, box))).toBe(false);
    }
  });

  it('stays on the view at its sides', () => {
    const match = fixtureMatch();

    expect(placeClear(match, { x: -30, y: 200, width: 50, height: 10 }).x).toBe(2);
    expect(placeClear(match, { x: VIEW.width, y: 200, width: 50, height: 10 }).x).toBe(
      VIEW.width - 52,
    );
  });
});
