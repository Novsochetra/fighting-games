import { describe, expect, it } from 'vitest';

import { DIVE_BEATS, nearFootOf, restOf } from '../../../src/render/save-cam/dive-frames.js';
import { divePose } from '../../../src/render/save-cam/dive-pose.js';
import { camMoment } from '../../../src/render/save-cam/moment.js';
import { contactTick } from '../../../src/render/save-cam/timing.js';
import { DEPTH, project } from '../../../src/render/save-cam/view.js';

// A dive at a ball close to him (a third of the way out to the post or less) did not read as a
// dive: his take-off was pinned to the stretch, so his feet left the grass beside where he had
// stood, and his navel stepped back the way he came, up to eight pixels, so the stretch's long reach
// met the ball. A short dive is now a smaller dive: a smaller load, a short hop off the boot he
// stood on, and on toward the ball, never back.
const SPOT = project({ x: 0, y: 0, z: DEPTH.keeper });
const GROUND = Math.round(SPOT.y);

const CASES = [0.25, 0.35, 0.5].flatMap((reach) =>
  [1, -1].flatMap((dive) =>
    [0.85, 0.5, 0.12].map((height) => ({ side: dive * reach, height, dive })),
  ),
);

// where on the art grid a frame's near boot (or the toe he leaves from) is drawn
const nearFootAt = (pose) => pose.x + (pose.mirror ? -1 : 1) * nearFootOf(pose.figure);

const poseAt = (moment, since) => divePose(moment, contactTick() + since);

describe('a short dive is a smaller dive, on toward the ball', () => {
  it.each(CASES.map((aim) => [JSON.stringify(aim), aim]))('at %s', (name, aim) => {
    for (const style of ['catch', 'punch']) {
      const moment = camMoment({ result: 'saved', style, aim: { ...aim }, dive: aim.dive });
      const load = poseAt(moment, DIVE_BEATS.push);
      const takeoff = poseAt(moment, DIVE_BEATS.takeoff);
      let last = poseAt(moment, DIVE_BEATS.push - 1).x;

      for (let since = DIVE_BEATS.push; since <= DIVE_BEATS.land + 4; since += 1) {
        const { x } = poseAt(moment, since);

        expect(aim.dive * (x - last), `${style} ${since}`).toBeGreaterThanOrEqual(0);
        last = x;
      }

      expect(aim.dive * (takeoff.x - load.x), style).toBeGreaterThanOrEqual(0);
      expect(Math.abs(nearFootAt(takeoff) - nearFootAt(load)), style).toBeLessThanOrEqual(3);
      expect(takeoff.y + restOf(takeoff.figure), style).toBeLessThanOrEqual(GROUND - 2);
    }
  });

  it('springs no further the closer the ball, either way', () => {
    for (const dive of [1, -1]) {
      for (const height of [0.85, 0.5, 0.12]) {
        const springs = [0.25, 0.35, 0.5, 0.7].map((reach) => {
          const moment = camMoment({ result: 'saved', aim: { side: dive * reach, height }, dive });

          return dive * (poseAt(moment, DIVE_BEATS.takeoff).x - SPOT.x);
        });

        for (let i = 1; i < springs.length; i += 1) {
          expect(springs[i], `${dive} ${height}`).toBeGreaterThanOrEqual(springs[i - 1]);
        }
      }
    }
  });
});
