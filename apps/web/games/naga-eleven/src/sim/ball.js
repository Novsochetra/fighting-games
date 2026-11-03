import { BALL } from '../data/tuning.js';
import { bounceOffFrame } from './goal-frame.js';
import { isInMouth, midX, midY } from './pitch.js';
import { clamp, lengthOf } from './vector.js';

export function createBall(match) {
  return {
    x: midX(match),
    y: midY(match),
    z: 0,
    vx: 0,
    vy: 0,
    vz: 0,
    owner: null,
    inGoal: null,
    travel: 0,
    lastTouch: null,
    kick: null,
    move: null,
    skillPass: null,
  };
}

export const speedOf = (ball) => lengthOf(ball.vx, ball.vy);

function fly(ball) {
  const drag = ball.z > 0 || ball.vz > 0 ? BALL.airDrag : BALL.rollDrag;

  ball.vx *= drag;
  ball.vy *= drag;
  ball.vz -= BALL.gravity;
  ball.x += ball.vx;
  ball.y += ball.vy;
  ball.z += ball.vz;
  ball.travel += speedOf(ball);
}

function bounceOnGround(ball) {
  if (ball.z > 0) {
    return;
  }

  ball.z = 0;
  ball.vz = ball.vz < -BALL.settle ? -ball.vz * BALL.bounce : 0;
}

const isPastEnd = ({ pitch }, ball, margin) => ball.x < -margin || ball.x > pitch.length + margin;

const isPastSide = ({ pitch }, ball) => ball.y < -BALL.radius || ball.y > pitch.width + BALL.radius;

const goesIn = (match, ball) =>
  isPastEnd(match, ball, 0) &&
  isInMouth(match, ball.y, BALL.radius) &&
  ball.z < match.goal.height - BALL.radius;

// once in, the net holds it: its back, its sides and its roof
function holdInNet(match, ball) {
  const { pitch, goal } = match;
  const inRight = ball.inGoal === 0;
  const front = inRight ? pitch.length : 0;
  const back = inRight ? pitch.length + goal.depth - BALL.radius : -goal.depth + BALL.radius;
  const x = clamp(ball.x, Math.min(front, back), Math.max(front, back));
  const half = goal.width / 2 - BALL.radius;
  const roof = goal.height - BALL.radius;

  if (x !== ball.x) {
    ball.vx *= -BALL.netBounce;
  }

  if (ball.z > roof) {
    ball.vz = Math.min(ball.vz, 0);
  }

  ball.x = x;
  ball.y = clamp(ball.y, midY(match) - half, midY(match) + half);
  ball.z = Math.min(ball.z, roof);
}

// 'goal' on the tick it goes in, 'out' on the tick it leaves the field of play, else null
export function lineCrossing(match) {
  const { ball } = match;

  if (ball.inGoal !== null) {
    return null;
  }

  if (goesIn(match, ball)) {
    ball.inGoal = ball.x > match.pitch.length ? 0 : 1;

    return 'goal';
  }

  return isPastSide(match, ball) || isPastEnd(match, ball, BALL.radius) ? 'out' : null;
}

export function stepBall(match) {
  const { ball } = match;

  fly(ball);
  bounceOnGround(ball);

  if (ball.inGoal !== null) {
    holdInNet(match, ball);

    return null;
  }

  bounceOffFrame(match, ball);

  return lineCrossing(match);
}

// out of play it rolls on to the boards round the pitch while the restart is set
export function rollOut(match) {
  const { ball, pitch } = match;

  fly(ball);
  bounceOnGround(ball);
  ball.x = clamp(ball.x, -BALL.runoff, pitch.length + BALL.runoff);
  ball.y = clamp(ball.y, -BALL.runoff, pitch.width + BALL.runoff);
}

// the ball runs at the carrier's feet, a step ahead of where they face
export function dribble(ball, player) {
  const aheadX = player.x + player.facing.x * BALL.dribbleGap;
  const aheadY = player.y + player.facing.y * BALL.dribbleGap;
  const x = ball.x + (aheadX - ball.x) * 0.5;
  const y = ball.y + (aheadY - ball.y) * 0.5;

  ball.travel += lengthOf(x - ball.x, y - ball.y);
  Object.assign(ball, { x, y, z: 0, vx: player.vx, vy: player.vy, vz: 0 });
  ball.lastTouch = player.index;
}
