import { describe, expect, it } from 'vitest';

import { BALL_PALETTE } from '../../../src/art/duel/ball.js';
import { NET_BALL } from '../../../src/art/save-cam/net-ball.js';
import { camScene } from '../../../src/render/save-cam/scene.js';
import { fakeMatch } from '../../support/duel-fixtures.js';
import { drawnSaveCam, pixelsIn } from '../../support/save-cam-pixels.js';

// On a low goal close to the keeper (0.6 of the way to the post or nearer) the ball beat him under
// his stretch, and once he lay down on the grass his body and gloves covered it in the back of the
// net: the goal went in and the cam showed no ball. It rolls on along the foot of the net now, to
// where his landing leaves it showing, the way he dived or, when he went the wrong way, its own
const GOALS = [
  { aim: { side: 0.4, height: 0.12 }, dive: 1 },
  { aim: { side: 0.6, height: 0.12 }, dive: 1 },
  { aim: { side: 0.5, height: 0.3 }, dive: 1 },
  { aim: { side: -0.35, height: 0.2 }, dive: -1 },
  { aim: { side: -0.6, height: 0.35 }, dive: -1 },
  { aim: { side: 0.3, height: 0.15 }, dive: -1 },
  { aim: { side: 0.5, height: 0.5 }, dive: 1 },
];

// from when he lies on the grass to the end of the show
const TICKS = [64, 72, 84, 95];

function netted(goal, ticks) {
  const match = fakeMatch({ seed: 2 });
  const moment = { shooter: 4, keeper: 5, move: 'power-shot', result: 'goal', ...goal };
  const { cam, colourAt } = drawnSaveCam(match, moment, { ticks, venue: 'national-stadium' });
  const ball = camScene(cam, ticks).ball;
  const box = { x: Math.round(ball.x) - 6, y: Math.round(ball.y) - 6, width: 13, height: 13 };

  return {
    patches: pixelsIn(colourAt, [BALL_PALETTE.p], box).length,
    shade: pixelsIn(colourAt, [NET_BALL.shadow], box).length,
  };
}

describe('the ball in the net shows past the keeper lying on the grass', () => {
  it.each(GOALS.map((goal) => [goal.aim.side, goal.aim.height, goal]))(
    'a goal %s across and %s up',
    (_, __, goal) => {
      for (const ticks of TICKS) {
        const { patches, shade } = netted(goal, ticks);

        expect(patches, `${ticks}`).toBeGreaterThanOrEqual(6);
        expect(shade, `${ticks}`).toBeGreaterThanOrEqual(4);
      }
    },
  );
});
