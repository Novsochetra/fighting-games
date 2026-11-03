import { describe, expect, it } from 'vitest';
import { WORLD_VIEW } from '../../../../src/config.js';
import { drawShadows } from '../../../../src/render/actors/index.js';
import { dropSpotOf } from '../../../../src/render/actors/drop-spot.js';
import { createCamera, project } from '../../../../src/render/camera.js';
import { stepBall } from '../../../../src/sim/ball.js';
import { createPixelCanvas } from '../../../support/pixel-canvas.js';
import { fixtureMatch } from './match-fixture.js';

// the fixture with its players off the grass and the ball loose in the middle, struck so
function loftedMatch(flight) {
  const match = fixtureMatch({ format: '11' });

  match.players = [];
  match.controlled = null;
  Object.assign(match.ball, flight, { owner: null, inGoal: null });

  return match;
}

const GRASS = '#208020';
const GRASS_RED = 0x20;

// how wide the marker's pale ring is drawn on plain grass, and round which point; null where
// nothing paler than the grass is drawn
function markerOn(match, camera) {
  const canvas = createPixelCanvas(WORLD_VIEW.width, WORLD_VIEW.height);
  const context = canvas.getContext('2d');
  const columns = [];
  const rows = [];

  context.fillStyle = GRASS;
  context.fillRect(0, 0, canvas.width, canvas.height);
  drawShadows(context, match, camera);

  for (let at = 0; at < canvas.data.length; at += 4) {
    const isPale = canvas.data[at] > GRASS_RED + 20;

    if (isPale) {
      columns.push((at / 4) % canvas.width);
      rows.push(Math.floor(at / 4 / canvas.width));
    }
  }

  if (columns.length === 0) {
    return null;
  }

  const left = Math.min(...columns);
  const right = Math.max(...columns);

  return {
    width: right - left + 1,
    x: (left + right) / 2,
    y: (Math.min(...rows) + Math.max(...rows)) / 2,
  };
}

// each tick of the flight reads every pixel of a whole world view, which outlasts the default
// timeout while the full check runs every project at once
const FLIGHT_TIMEOUT = 20_000;

describe('the drop marker', () => {
  it(
    'rings the spot a high ball will land on, and closes in as it falls',
    { timeout: FLIGHT_TIMEOUT },
    () => {
      const match = loftedMatch({ z: 2, vx: 3.5, vy: 0.8, vz: 5.5 });
      const camera = createCamera(match);
      const seen = [];

      for (let tick = 0; tick < 200 && dropSpotOf(match); tick += 1) {
        const spot = dropSpotOf(match);
        const ground = project(camera, spot.x, spot.y);
        const marker = markerOn(match, camera);

        expect(Math.abs(marker.x - ground.x)).toBeLessThanOrEqual(1.5);
        expect(Math.abs(marker.y - ground.y)).toBeLessThanOrEqual(2);
        seen.push(marker.width);
        stepBall(match);
      }

      expect(seen.length).toBeGreaterThan(30);
      expect(seen.at(-1)).toBeLessThan(seen[0] / 2);
      expect(seen.every((width, i) => i === 0 || width <= seen[i - 1])).toBe(true);
    },
  );

  it('is not drawn for a ball rolling on the grass, skimming low or held', () => {
    const rolling = loftedMatch({ z: 0, vx: 6, vy: 0, vz: 0 });
    const skimming = loftedMatch({ z: 3, vx: 9, vy: 0, vz: 1.2 });
    const held = loftedMatch({ z: 60, vx: 0, vy: 0, vz: 2 });

    held.ball.owner = 0;

    for (const match of [rolling, skimming, held]) {
      expect(markerOn(match, createCamera(match))).toBeNull();
    }
  });

  it('goes once the ball is down', () => {
    const match = loftedMatch({ z: 2, vx: 2, vy: 0, vz: 4 });

    while (match.ball.z > 0 || match.ball.vz > 0) {
      stepBall(match);
    }

    match.ball.vz = 0;

    expect(markerOn(match, createCamera(match))).toBeNull();
  });
});
