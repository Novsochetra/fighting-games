import { describe, expect, it } from 'vitest';

import { KEEPER_SHARE, shotPoint } from '../../../src/render/save-cam/flight.js';
import { keeperPose } from '../../../src/render/save-cam/keeper-pose.js';
import { camMoment } from '../../../src/render/save-cam/moment.js';
import { contactTick } from '../../../src/render/save-cam/timing.js';
import { project } from '../../../src/render/save-cam/view.js';

// In open play the sim gives the keeper's dive from where he stood, but the cam draws him in the
// middle of the goal: a keeper off to one side of his goal who dived back across to a ball on that
// side was shown diving away from the ball he kept out (about one save cam in sixty in open play).
// A keeper who keeps the ball out now goes the way it went; one it beats may still go the wrong way
const SAVES = [
  { result: 'parried', aim: { side: 0.6, height: 0.4 }, dive: -1, style: 'catch' },
  { result: 'saved', aim: { side: -0.5, height: 0.7 }, dive: 1, style: 'catch' },
  { result: 'parried', aim: { side: 0.45, height: 0.2 }, dive: -1, style: 'punch' },
];

describe('a keeper who keeps the ball out dives the way it went', () => {
  it.each(SAVES.map((save) => [save.result, save.aim.side, save]))(
    'a ball %s at %s across',
    (_, side, save) => {
      const moment = camMoment({ shooter: 4, keeper: 5, ...save }, 3);
      const pose = keeperPose(moment, contactTick());
      const contact = project(shotPoint(save.aim, KEEPER_SHARE));

      expect(moment.dive).toBe(Math.sign(side));
      expect(Math.abs(pose.gloves.x - contact.x)).toBeLessThan(12);
    },
  );

  it('and one it beats may still have gone the wrong way, as the sim said', () => {
    const goal = camMoment({ result: 'goal', aim: { side: 0.7, height: 0.5 }, dive: -1 }, 3);

    expect(goal.dive).toBe(-1);
  });
});
