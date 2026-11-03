import { describe, expect, it } from 'vitest';

import { BALL_PALETTE } from '../../../src/art/duel/ball.js';
import { NET_BALL } from '../../../src/art/save-cam/net-ball.js';
import { SAVE_CAM_VENUES } from '../../../src/render/save-cam/backdrops/index.js';
import { camScene } from '../../../src/render/save-cam/scene.js';
import { fakeMatch } from '../../support/duel-fixtures.js';
import { drawnSaveCam, pixelsIn } from '../../support/save-cam-pixels.js';

// On a goal at the City School Stadium the ball in the back of the net, a pale disc of a few
// pixels, was all but lost against the schoolchildren's white shirts and the pale net. It sits in
// the net now as a ball drawn by hand, its patches dark at its heart, its shade on the strings
// behind it, at every venue
const GOALS = [
  { aim: { side: 0.85, height: 0.7 }, dive: 1 },
  { aim: { side: -0.8, height: 0.45 }, dive: -1 },
  { aim: { side: 0.75, height: 0.3 }, dive: -1 },
];

function netted(venue, goal, ticks) {
  const match = fakeMatch({ seed: 2 });
  const moment = { shooter: 4, keeper: 5, move: 'power-shot', result: 'goal', ...goal };
  const { cam, colourAt } = drawnSaveCam(match, moment, { ticks, venue });
  const ball = camScene(cam, ticks).ball;
  const box = { x: Math.round(ball.x) - 6, y: Math.round(ball.y) - 6, width: 13, height: 13 };

  return {
    patches: pixelsIn(colourAt, [BALL_PALETTE.p], box).length,
    shade: pixelsIn(colourAt, [NET_BALL.shadow], box).length,
  };
}

describe('the ball in the back of the net reads', () => {
  it.each(SAVE_CAM_VENUES)('at %s', (venue) => {
    for (const goal of GOALS) {
      for (const ticks of [56, 64]) {
        const { patches, shade } = netted(venue, goal, ticks);

        expect(patches, `${goal.aim.side} ${ticks}`).toBeGreaterThanOrEqual(6);
        expect(shade, `${goal.aim.side} ${ticks}`).toBeGreaterThanOrEqual(4);
      }
    }
  });
});
