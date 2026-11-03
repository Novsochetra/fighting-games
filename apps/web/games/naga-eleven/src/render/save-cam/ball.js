import { BALL_PALETTE } from '../../art/duel/ball.js';
import { DUEL_INK } from '../../art/duel/palette.js';
import { NET_BALL } from '../../art/save-cam/net-ball.js';
import { drawBall as drawDuelBall } from '../duel/ball.js';
import { drawGrid } from '../duel/grid.js';
import { shadedDisc } from '../duel/parts.js';
import { disc } from '../duel/shapes.js';

const RAMP = [BALL_PALETTE[1], BALL_PALETTE[2], BALL_PALETTE[3], BALL_PALETTE[4]];

// patches of the ball turning as it spins, round its middle
function patches(pen, { x, y, radius, tick }) {
  for (let i = 0; i < 3; i += 1) {
    const turn = tick * 0.5 + (i / 3) * Math.PI * 2;
    const across = Math.cos(turn) * radius * 0.5;

    if (Math.sin(turn) > -0.2) {
      disc(pen, {
        x: x + across,
        y: y + (i - 1) * radius * 0.45,
        radius: radius * 0.22,
        color: BALL_PALETTE.p,
      });
    }
  }
}

// the ball near the camera big, lit from the top left, spinning; far off a few pixels of white
export function drawCamBall(pen, { x, y, radius, tick }) {
  if (radius >= 7) {
    shadedDisc(pen, { x, y, radius, ramp: RAMP });
    patches(pen, { x, y, radius, tick });
    disc(pen, {
      x: x - radius * 0.45,
      y: y - radius * 0.45,
      radius: radius * 0.18,
      color: BALL_PALETTE[4],
    });

    return;
  }

  if (radius >= 4.5) {
    drawDuelBall(pen, { x, y, tick, spin: 2 });

    return;
  }

  disc(pen, { x, y, radius: radius + 1, color: DUEL_INK });
  disc(pen, { x, y, radius, color: BALL_PALETTE[3] });
  pen.dot(Math.round(x - radius * 0.4), Math.round(y - radius * 0.4), BALL_PALETTE[4]);
  pen.dot(Math.round(x + 0.5), Math.round(y + 0.5), BALL_PALETTE.p);
}

const SHADE = Object.fromEntries(Object.keys(BALL_PALETTE).map((key) => [key, NET_BALL.shadow]));

// the ball in the back of the net, its shade on the strings behind it, so it stands off a pale net
// and a busy crowd
export function drawNetBall(pen, { x, y }) {
  const left = Math.round(x) - 4;
  const top = Math.round(y) - 4;

  drawGrid(pen, { rows: NET_BALL.rows, palette: SHADE, x: left + 1, y: top + 1 });
  drawGrid(pen, { rows: NET_BALL.rows, palette: BALL_PALETTE, x: left, y: top });
}
