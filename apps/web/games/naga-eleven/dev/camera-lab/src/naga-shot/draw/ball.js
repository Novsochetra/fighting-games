import { drawBall } from '../../../../../src/render/duel/ball.js';

export function drawShotBall(pen, { ball, clock }) {
  drawBall(pen, { x: ball.x, y: ball.y, tick: ball.spin ? clock.frame : 0, spin: 2 });
}
