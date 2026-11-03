import { BALL_ART } from '../../art/actors.js';
import { BALL } from '../../data/tuning.js';
import { project } from '../camera.js';
import { drawBuffer } from './figure/draw-buffer.js';
import { ballFrame, SPIN_FRAMES } from './ball-frames.js';
import { drawPixelEllipse, drawShadow } from './shadow.js';

// the ball turns a frame each time it rolls this far
const ROLL_STEP = 4;
// past this speed a struck ball smears behind itself
const SMEAR_SPEED = 6.5;
// the shadow shrinks and fades as the ball climbs, so its height reads at a glance, but stays dark
// enough at the top of a long ball to follow
const SHADOW_FADE = 90;
const SHADOW_ALPHA = { ground: 0.42, highest: 0.34 };
const SHADOW_SMALLEST = 0.7;
// the gap between a thrower's hands in the throw-in pose (throw-arms.js)
const HELD_SIZE = 8;

const COLOURS = [null, BALL_ART.outline, ...BALL_ART.white, ...BALL_ART.patch];

// the ball is drawn a little bigger than life, as arcade footballs are, and as the camera sees it
const sizeAt = (scale) => Math.max(5, Math.round(BALL.radius * 1.3 * scale));

export function drawBallShadow(context, camera, ball) {
  const ground = project(camera, ball.x, ball.y);
  const height = Math.max(0, ball.z);
  const shrink = Math.max(SHADOW_SMALLEST, 1 - height / (SHADOW_FADE * 1.4));

  drawShadow(context, {
    x: ground.x,
    y: ground.y,
    radiusX: 4.5 * ground.scale * shrink,
    radiusY: 2 * ground.scale * shrink,
    alpha: Math.max(SHADOW_ALPHA.highest, SHADOW_ALPHA.ground - height / SHADOW_FADE),
  });
}

function drawSmear(context, centre, ball) {
  const speed = Math.hypot(ball.vx, ball.vy, ball.vz);

  if (speed < SMEAR_SPEED) {
    return;
  }

  const back = Math.min(2.4, speed / 5);

  context.fillStyle = BALL_ART.smear;

  for (let step = 3; step >= 1; step -= 1) {
    const radius = (sizeAt(centre.scale) / 2) * (1 - step * 0.15);

    context.globalAlpha = 0.14 * (4 - step);
    drawPixelEllipse(context, {
      x: centre.x - ball.vx * centre.scale * back * (step / 3),
      y: centre.y - (ball.vy * 0.6 - ball.vz) * centre.scale * back * (step / 3),
      radiusX: radius,
      radiusY: radius,
    });
  }

  context.globalAlpha = 1;
}

function spinFrame(ball) {
  const turned = Math.floor((ball.travel ?? 0) / ROLL_STEP) % SPIN_FRAMES;

  return ball.vx < 0 ? SPIN_FRAMES - 1 - turned : turned;
}

// the ball's own picture, panels and all, `size` pixels across round a centre
export function drawBallPicture(context, { x, y, size, spin = 0 }) {
  drawBuffer(context, ballFrame(size, spin), {
    left: Math.round(x - size / 2),
    top: Math.round(y - size / 2),
    colours: COLOURS,
  });
}

// a throw-in's ball is held in the taker's hands over his head, wherever the sheet put them
export function drawHeldBall(context, camera, { thrower, height }) {
  const foot = project(camera, thrower.x, thrower.y);

  drawBallPicture(context, { x: foot.x, y: foot.y - height, size: HELD_SIZE });
}

export function drawBall(context, camera, ball) {
  const centre = project(camera, ball.x, ball.y, Math.max(0, ball.z) + BALL.radius);

  drawSmear(context, centre, ball);
  drawBallPicture(context, { ...centre, size: sizeAt(centre.scale), spin: spinFrame(ball) });
}
