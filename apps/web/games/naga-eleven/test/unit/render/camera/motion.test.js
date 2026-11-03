import { describe, expect, it } from 'vitest';
import { createCamera } from '../../../../src/render/camera.js';
import { railOf } from '../../../../src/render/camera/brakes.js';
import { scaleAt } from '../../../../src/render/camera/lens.js';
import { motionOf, notePace } from '../../../../src/render/camera/motion.js';
import { matchOf, run } from './fixture.js';

// the camera's pace along, and where it stood, on each tick of `ticks`, the ball rolling at `vx`
// from `x`
function pacesFor(format, { x, vx, ticks }) {
  const match = matchOf(format, { ball: { x, vx } });
  const camera = createCamera(match);
  const paces = [];
  const places = [];

  run(camera, match, ticks, {
    step: (each) => {
      each.ball.x = Math.max(-60, Math.min(each.pitch.length + 60, each.ball.x + each.ball.vx));
    },
    check: () => {
      paces.push(camera.along.pace);
      places.push(camera.along.value);
    },
  });

  return { camera, paces, places };
}

const changesOf = (paces) => paces.slice(1).map((pace, i) => Math.abs(pace - paces[i]));

describe('the pace of the camera', () => {
  it('is the way it really went on the tick', () => {
    const camera = createCamera(matchOf());
    const from = motionOf(camera);

    camera.along.value += 3;
    camera.depth.value -= 1;
    notePace(camera, from);

    expect([camera.along.pace, camera.depth.pace]).toEqual([3, -1]);
  });

  it('gathers and sheds pace by under a third of a pixel a tick after a steady run', () => {
    for (const format of ['7', '11']) {
      const { camera, paces } = pacesFor(format, { x: 600, vx: 3, ticks: 400 });
      const most = 0.25 / scaleAt(camera.lens, camera.depth.value);

      expect(Math.max(...changesOf(paces))).toBeLessThanOrEqual(most + 1e-9);
    }
  });

  it('eases into the end of its rail after a ball rolling past the goal line', () => {
    for (const format of ['7', '11']) {
      const { camera, paces, places } = pacesFor(format, { x: 700, vx: 6, ticks: 400 });
      const end = railOf(camera).along.high;
      const arrival = places.findIndex((place) => Math.abs(place - end) < 1e-6);

      expect(arrival).toBeGreaterThan(10);
      expect(Math.max(...paces)).toBeGreaterThan(2);
      expect(Math.max(...changesOf(paces))).toBeLessThan(0.3);
      expect(paces[arrival]).toBeLessThan(0.3);
    }
  });
});
