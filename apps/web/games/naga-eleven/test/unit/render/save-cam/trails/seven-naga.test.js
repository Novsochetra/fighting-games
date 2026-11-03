import { describe, expect, it } from 'vitest';

import { headPoint } from '../../../../../src/render/duel/looks/naga-head.js';
import { camMoment } from '../../../../../src/render/save-cam/moment.js';
import { camScene } from '../../../../../src/render/save-cam/scene.js';
import { smoothTrail } from '../../../../../src/render/save-cam/trails/path.js';
import { fanOf } from '../../../../../src/render/save-cam/trails/seven-naga.js';
import { fakeMatch } from '../../../../support/duel-fixtures.js';

const AIMS = [
  { side: 0.5, height: 0.6 },
  { side: -0.6, height: 0.3 },
  { side: 0.05, height: 0.9 },
];

const TICKS = [12, 16, 20, 24, 28, 32, 36, 40];

// the fan as the trail draws it `ticks` into the show
function fanAt(aim, ticks) {
  const moment = camMoment(
    { shooter: 4, keeper: 5, move: 'seven-headed-naga', aim, dive: Math.sign(aim.side) },
    5,
  );
  const scene = camScene({ moment, ticks, length: 96, match: fakeMatch({ seed: 2 }) }, 300 + ticks);

  return fanOf({ points: smoothTrail(scene.trail), art: scene.art, tick: scene.tick });
}

const middleOf = (place) => headPoint(place, [3.5, -3.5]);

describe('the Seven-Headed Naga in the save cam', () => {
  it.each(AIMS.map((aim) => [aim.side, aim.height, aim]))(
    'stands six heads in an arc over the front one, %s across and %s up',
    (_, __, aim) => {
      for (const ticks of TICKS) {
        const { pose, heads } = fanAt(aim, ticks);
        const front = middleOf(pose.head);
        const unit = pose.head.size;
        const byStep = Object.fromEntries(heads.map((head) => [head.step, middleOf(head)]));

        expect(heads.map((head) => head.step).sort((first, second) => first - second)).toEqual([
          -3, -2, -1, 1, 2, 3,
        ]);

        for (const [step, over] of [
          [1, 12],
          [2, 6],
          [3, 0],
        ]) {
          expect(byStep[step].x - front.x, `${ticks} ${step}`).toBeGreaterThan(0);
          expect(byStep[-step].x - front.x, `${ticks} ${-step}`).toBeLessThan(0);
          expect(byStep[step].y, `${ticks} ${step}`).toBeLessThan(front.y - over * unit);
          expect(byStep[-step].y, `${ticks} ${-step}`).toBeLessThan(front.y - over * unit);
        }

        expect(byStep[1].y).toBeLessThan(byStep[2].y);
        expect(byStep[2].y).toBeLessThan(byStep[3].y);
        expect(byStep[-1].y).toBeLessThan(byStep[-2].y);
        expect(byStep[-2].y).toBeLessThan(byStep[-3].y);
      }
    },
  );

  it('keeps the heads apart, so each reads on its own', () => {
    for (const ticks of TICKS) {
      const { pose, heads } = fanAt(AIMS[0], ticks);
      const middles = heads.map(middleOf);

      middles.forEach((one, i) => {
        middles.slice(i + 1).forEach((other) => {
          expect(Math.hypot(one.x - other.x, one.y - other.y)).toBeGreaterThan(8 * pose.head.size);
        });
      });
    }
  });

  it('draws the outer heads first and the inner ones over them', () => {
    const steps = fanAt(AIMS[0], 24).heads.map((head) => Math.abs(head.step));

    expect(steps).toEqual([3, 3, 2, 2, 1, 1]);
  });
});
