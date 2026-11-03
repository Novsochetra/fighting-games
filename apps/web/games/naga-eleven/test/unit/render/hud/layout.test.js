import { describe, expect, it } from 'vitest';
import { VIEW } from '../../../../src/config.js';
import { drawHud } from '../../../../src/render/hud/index.js';
import {
  BANNER,
  MINIMAP_TOP,
  minimapRect,
  PAUSE_CLEARANCE,
} from '../../../../src/render/hud/layout.js';
import { fixtureMatch } from '../../../integration/render/actors/match-fixture.js';
import { createRecordingContext } from '../../../support/recording-context.js';

function paintedBoxes(match) {
  const { context, calls } = createRecordingContext();

  context.measureText = (text) => ({ width: [...text].length * 5 });
  drawHud(context, match, { tick: match.tick });

  return calls
    .filter((call) => call.name === 'fillRect')
    .map(({ args: [x, y, width, height] }) => ({ x, y, width, height }))
    .concat(
      calls
        .filter((call) => call.name === 'fillText')
        .map(({ args: [, x, y] }) => ({ x, y, width: 0, height: 0 })),
    );
}

describe('where the HUD stands', () => {
  it('keeps the pitch shape in the minimap, centred at the foot of the view', () => {
    for (const format of ['7', '11']) {
      const match = fixtureMatch({ format });
      const rect = minimapRect(match);

      expect(rect.width / rect.height).toBeCloseTo(match.pitch.length / match.pitch.width, 0);
      expect(rect.x + rect.width / 2).toBeCloseTo(VIEW.width / 2, 0);
      expect(rect.y).toBeGreaterThanOrEqual(MINIMAP_TOP + 2);
      expect(VIEW.height - (rect.y + rect.height)).toBeGreaterThanOrEqual(24);
    }
  });

  it('crosses the big banner over the minimap, even with a scorer under the band', () => {
    for (const format of ['7', '11']) {
      const minimap = minimapRect(fixtureMatch({ format }));

      expect(BANNER.y + BANNER.tallest).toBeLessThan(minimap.y - 2);
    }
  });

  it('keeps the score and the player card to the top left, clear of the pause button', () => {
    const match = fixtureMatch();
    const boxes = paintedBoxes(match);

    expect(boxes.length).toBeGreaterThan(20);

    for (const box of boxes) {
      expect(box.x + box.width).toBeLessThan(VIEW.width - PAUSE_CLEARANCE);
      expect(box.y + box.height).toBeLessThan(80);
    }
  });

  it('gives the minimap its corner when the frame has one to draw', () => {
    const match = fixtureMatch();
    const { context } = createRecordingContext();
    const asked = [];

    context.measureText = (text) => ({ width: [...text].length * 5 });
    drawHud(context, match, { minimap: (...args) => asked.push(args) });

    expect(asked).toHaveLength(1);
    expect(asked[0][0]).toBe(context);
    expect(asked[0][1]).toBe(match);
    expect(asked[0][2]).toEqual(minimapRect(match));
  });

  it('shows no player card in a match the computer plays alone', () => {
    const match = Object.assign(fixtureMatch(), { humanTeam: null, controlled: null });
    const watched = paintedBoxes(match);

    expect(watched.length).toBeLessThan(paintedBoxes(fixtureMatch()).length);
  });
});
