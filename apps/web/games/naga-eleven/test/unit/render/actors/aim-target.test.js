import { describe, expect, it } from 'vitest';
import { AIM_MARKER } from '../../../../src/art/actors.js';
import { UI_SCALE } from '../../../../src/config.js';
import {
  drawAimEdge,
  drawAimMarker,
  drawAimRing,
} from '../../../../src/render/actors/aim-target.js';
import { createCamera, project } from '../../../../src/render/camera.js';
import { createRecordingContext } from '../../../support/recording-context.js';
import { fixtureMatch } from '../../../integration/render/actors/match-fixture.js';

const STAND = 58;
const AIM_COLOURS = new Set([...AIM_MARKER.ring, ...AIM_MARKER.fill]);

function stillCamera(match) {
  const camera = createCamera(match);

  camera.pan = null;
  camera.along.value = match.pitch.length / 2;

  return camera;
}

// the rects drawn in the aim marker's own colours
function aimRects(draw, camera, match) {
  const { context, calls } = createRecordingContext();
  let colour = null;
  const rects = [];

  draw(context, camera, { match, tick: 12, standHeight: STAND });

  for (const { name, args } of calls) {
    colour = name === 'fillStyle' ? args[0] : colour;

    if (name === 'fillRect' && AIM_COLOURS.has(colour)) {
      rects.push(args);
    }
  }

  return rects;
}

const middleOf = (rects) => ({
  x: rects.reduce((sum, [x, , width]) => sum + x + width / 2, 0) / rects.length,
  y: rects.reduce((sum, [, y, , height]) => sum + y + height / 2, 0) / rects.length,
});

describe('the mate a pass is aimed at', () => {
  it('is marked only while the human aims at him', () => {
    const match = fixtureMatch({ format: '11' });
    const camera = stillCamera(match);

    for (const draw of [drawAimRing, drawAimMarker, drawAimEdge]) {
      expect(aimRects(draw, camera, { ...match, aimTarget: null })).toEqual([]);
      expect(aimRects(draw, camera, match)).toEqual([]);
    }
  });

  it('has a ring at his feet and a marker over his head, at him', () => {
    const match = { ...fixtureMatch({ format: '11' }), aimTarget: 4 };
    const camera = stillCamera(match);
    const target = match.players[4];
    const feet = project(camera, target.x, target.y);
    const ring = middleOf(aimRects(drawAimRing, camera, match));
    const marker = middleOf(aimRects(drawAimMarker, camera, match));

    expect(Math.abs(ring.x - feet.x)).toBeLessThan(2);
    expect(Math.abs(ring.y - feet.y)).toBeLessThan(3);
    expect(Math.abs(marker.x - feet.x)).toBeLessThan(2);
    expect(marker.y).toBeLessThan(feet.y - STAND);
  });

  it('is pointed to from the edge of the view while he is out of it', () => {
    const match = { ...fixtureMatch({ format: '11' }), aimTarget: 4 };
    const camera = stillCamera(match);

    expect(aimRects(drawAimEdge, camera, match)).toEqual([]);

    match.players = match.players.map((player) =>
      player.index === 4 ? { ...player, x: -900 } : player,
    );

    const arrow = aimRects(drawAimEdge, camera, match);

    expect(arrow.length).toBeGreaterThan(0);
    expect(Math.max(...arrow.map(([x, , width]) => x + width))).toBeLessThan(24 * UI_SCALE);
  });
});
