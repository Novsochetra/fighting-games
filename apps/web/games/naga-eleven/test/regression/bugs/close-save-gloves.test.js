import { describe, expect, it } from 'vitest';

import { contactOnScreen } from '../../../src/render/save-cam/effects.js';
import { keeperPose } from '../../../src/render/save-cam/keeper-pose.js';
import { camMoment } from '../../../src/render/save-cam/moment.js';
import { camScene } from '../../../src/render/save-cam/scene.js';
import { contactTick } from '../../../src/render/save-cam/timing.js';

// Once a keeper no longer stepped back for a ball close to him, his stretch reached past it: a low
// catch at a quarter of the goal's width met the air 12 art pixels short of his gloves and a low
// punch 21, and the ball jumped into his gloves under the contact's flash
const SIDES = [0.25, -0.25, 0.35, 0.5, 0.7];
const HEIGHTS = [0.12, 0.5, 0.85];
const STYLES = ['catch', 'punch'];

const SAVES = STYLES.flatMap((style) =>
  HEIGHTS.flatMap((height) => SIDES.map((side) => ({ style, aim: { side, height } }))),
);

const apart = (from, to) => Math.hypot(from.x - to.x, from.y - to.y);

function saveOf({ style, aim }) {
  const moment = camMoment(
    { shooter: 9, keeper: 11, move: 'power-shot', aim, result: 'saved', style },
    5,
  );

  return { moment, gloves: keeperPose(moment, contactTick()).gloves };
}

describe('a ball he saves', () => {
  it('meets his gloves at the contact', () => {
    for (const save of SAVES) {
      const { moment, gloves } = saveOf(save);

      expect(apart(contactOnScreen(moment), gloves), JSON.stringify(save)).toBeLessThan(1.5);
    }
  });

  it('is all but in his gloves the tick before', () => {
    for (const save of SAVES) {
      const { moment, gloves } = saveOf(save);
      const { ball } = camScene({ moment, ticks: contactTick() - 1 }, 0);

      expect(apart(ball, gloves), JSON.stringify(save)).toBeLessThan(3);
    }
  });
});
