import { describe, expect, it } from 'vitest';
import { UI_SCALE, VIEW, WORLD_VIEW } from '../../../../src/config.js';
import { drawSteeredEdge, edgeOf } from '../../../../src/render/actors/steered-edge.js';
import { createCamera, project } from '../../../../src/render/camera.js';
import { scaleAt } from '../../../../src/render/camera/lens.js';
import { hudBoxes } from '../../../../src/render/hud/layout.js';
import { createRecordingContext } from '../../../support/recording-context.js';
import { fixtureMatch } from '../../../integration/render/actors/match-fixture.js';

const STAND = 58;

function rectsFor(camera, { match, player }) {
  const { context, calls } = createRecordingContext();

  drawSteeredEdge(context, camera, { match, player, tick: 0, standHeight: STAND });

  return calls.filter((call) => call.name === 'fillRect').map((call) => call.args);
}

function stillCamera(match) {
  const camera = createCamera(match);

  camera.pan = null;
  camera.along.value = match.pitch.length / 2;

  return camera;
}

const overlaps = ([x, y, width, height], box) =>
  x < box.x + box.width && x + width > box.x && y < box.y + box.height && y + height > box.y;

describe('the steered player off the view', () => {
  it('names the edge he went past, in the UI view, and none while he is in view', () => {
    expect(edgeOf({ x: -5, y: 200 })).toBe('left');
    expect(edgeOf({ x: VIEW.width + 5, y: 200 })).toBe('right');
    expect(edgeOf({ x: 300, y: -5 })).toBe('up');
    expect(edgeOf({ x: 300, y: VIEW.height + 5 })).toBe('down');
    expect(edgeOf({ x: 300, y: 200 })).toBeNull();
  });

  it('draws an arrow on the edge only while he is out of view', () => {
    const match = fixtureMatch({ format: '11' });
    const camera = stillCamera(match);
    const player = { ...match.players[0], x: match.pitch.length / 2 };

    expect(rectsFor(camera, { match, player })).toHaveLength(0);

    player.x = -900;
    expect(project(camera, player.x, player.y).x).toBeLessThan(0);

    const rects = rectsFor(camera, { match, player });

    expect(rects.length).toBeGreaterThan(0);
    expect(Math.min(...rects.map(([x]) => x))).toBeGreaterThanOrEqual(0);
    expect(Math.max(...rects.map(([x, , width]) => x + width))).toBeLessThan(24);
  });

  // 50 of 92 ticks of the up arrow were hidden under the score bug or the minimap
  it('is never under a HUD box, wherever along the top edge or down the sides it points', () => {
    const match = fixtureMatch({ format: '11' });
    const camera = stillCamera(match);
    const boxes = hudBoxes(match);
    const hidden = [];

    // over the top edge (far behind the far touchline), or off a side by the top of the view
    for (let x = -40; x <= VIEW.width + 40; x += 8) {
      const y = x < 0 || x > VIEW.width ? 40 : -400;
      const scale = scaleAt(camera.lens, y);
      const player = {
        ...match.players[0],
        x: camera.along.value + (x * UI_SCALE - WORLD_VIEW.width / 2) / scale,
        y,
      };

      hidden.push(
        ...rectsFor(camera, { match, player }).filter((rect) =>
          boxes.some((box) => overlaps(rect, box)),
        ),
      );
    }

    expect(hidden).toEqual([]);
  });

  // the minimap moved to the foot of the view, where the down arrow stands
  it('is never under the minimap, wherever along the foot of the view it points', () => {
    const match = fixtureMatch({ format: '11' });
    const camera = stillCamera(match);
    const boxes = hudBoxes(match);
    const y = match.pitch.width + 600;
    const scale = scaleAt(camera.lens, y);
    const drawn = [];

    for (let x = 8; x <= VIEW.width - 8; x += 8) {
      const player = {
        ...match.players[0],
        x: camera.along.value + (x * UI_SCALE - WORLD_VIEW.width / 2) / scale,
        y,
      };

      drawn.push(...rectsFor(camera, { match, player }));
    }

    expect(drawn.length).toBeGreaterThan(100);
    expect(drawn.filter((rect) => boxes.some((box) => overlaps(rect, box)))).toEqual([]);
  });
});
