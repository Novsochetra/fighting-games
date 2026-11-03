import { DUEL_INK, GOAL_ART } from '../../art/duel/palette.js';
import { hash } from './hash.js';
import { GROUND, NET } from './paths.js';
import { band } from './shapes.js';

const POST = GOAL_ART.post;
const MESH = GOAL_ART.mesh;

const NEAR = { x: 210, top: 60 };
const FAR = { x: 232, top: 50, bottom: 104 };

// the net bulges where the ball hits it
function mesh(pen, bulge) {
  for (let y = FAR.top + 4; y < GROUND; y += 5) {
    const push = Math.max(0, bulge - Math.abs(y - NET.y) / 4);

    pen.rect([NEAR.x + 2, y, 44 + Math.round(push), 1], MESH);
  }

  for (let x = NEAR.x + 6; x < 256; x += 5) {
    pen.rect(
      [x + Math.round(bulge * (x > NET.x ? 0.4 : 0)), FAR.top + 2, 1, GROUND - FAR.top - 2],
      MESH,
    );
  }
}

function post(pen, from, to) {
  band(pen, { from, to, width: 4, color: DUEL_INK });
  band(pen, { from, to, width: 2, color: POST[1] });
  band(pen, {
    from: { x: from.x - 1, y: from.y },
    to: { x: to.x - 1, y: to.y },
    width: 1,
    color: POST[2],
  });
}

export function drawGoalFrame(pen, { bulge = 0, tick = 0 }) {
  pen.context.save();
  pen.context.globalAlpha *= 0.5;
  mesh(pen, bulge + (bulge > 0 ? hash(tick, 3) : 0));
  pen.context.restore();
  post(pen, { x: FAR.x, y: FAR.top }, { x: FAR.x, y: FAR.bottom });
  post(pen, { x: NEAR.x, y: NEAR.top }, { x: FAR.x, y: FAR.top });
  post(pen, { x: NEAR.x, y: NEAR.top }, { x: NEAR.x, y: GROUND });
  pen.rect([NEAR.x - 2, GROUND, 4, 1], POST[0]);
}
