import { BALL } from '../data/tuning.js';
import { goalLineOf, isInMouth, midY } from './pitch.js';
import { lengthOf } from './vector.js';

const POST_ZONE = BALL.post + BALL.radius;

// it comes off a post like off a pillar, along the line from the post's middle to the ball
function bounceOffPost(ball, post) {
  const dx = ball.x - post.x;
  const dy = ball.y - post.y;
  const gap = lengthOf(dx, dy);
  const towards = gap > 0 ? (ball.vx * dx + ball.vy * dy) / gap : 0;

  if (gap >= POST_ZONE || towards >= 0) {
    return;
  }

  ball.vx = (ball.vx - (2 * towards * dx) / gap) * BALL.postBounce;
  ball.vy = (ball.vy - (2 * towards * dy) / gap) * BALL.postBounce;
  ball.x = post.x + (dx / gap) * POST_ZONE;
  ball.y = post.y + (dy / gap) * POST_ZONE;
}

function bounceOffBar(match, ball, line) {
  const { height } = match.goal;
  const onBar = Math.abs(ball.x - line) < BALL.radius && Math.abs(ball.z - height) < BALL.radius;

  if (!onBar || !isInMouth(match, ball.y)) {
    return;
  }

  ball.vx = -ball.vx * BALL.postBounce;
  ball.vz = ball.z < height ? -Math.abs(ball.vz) - 1 : Math.abs(ball.vz) + 1;
}

export function bounceOffFrame(match, ball) {
  const line = goalLineOf(match, ball.x > match.pitch.length / 2 ? 0 : 1);
  const half = match.goal.width / 2;

  if (ball.z < match.goal.height) {
    bounceOffPost(ball, { x: line, y: midY(match) - half });
    bounceOffPost(ball, { x: line, y: midY(match) + half });
  }

  bounceOffBar(match, ball, line);
}
