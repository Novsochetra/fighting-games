import { clamp, lengthOf, normalized } from '../../sim/vector.js';
import { held } from '../scoring.js';
import { LANE } from './course.js';

const BALL_GAP = 10;
const BALL_FOLLOW = 0.3;
const EDGE = 8;
const WOBBLE_SPEED = 0.35;
const WOBBLE_TURN = 0.05;

export const createRunner = () => ({
  x: LANE.start,
  y: LANE.width / 2,
  vx: 0,
  vy: 0,
  facing: { x: 1, y: 0 },
  stride: 0,
  wobble: 0,
  sprinting: false,
  ball: { x: LANE.start + BALL_GAP, y: LANE.width / 2, travel: 0 },
});

function wantedDirection(input) {
  const across = (held(input, 'right') ? 1 : 0) - (held(input, 'left') ? 1 : 0);
  const down = (held(input, 'down') ? 1 : 0) - (held(input, 'up') ? 1 : 0);

  return normalized(across, down);
}

// a sprint carries more speed but answers the stick slower, so it swings wide of a turn
function paceOf(runner, tuning) {
  if (runner.wobble > 0) {
    return { speed: tuning.speed * WOBBLE_SPEED, turn: WOBBLE_TURN };
  }

  return runner.sprinting
    ? { speed: tuning.sprintSpeed, turn: tuning.sprintTurn }
    : { speed: tuning.speed, turn: tuning.turn };
}

function moveBall(runner) {
  const ball = runner.ball;
  const toX = runner.x + runner.facing.x * BALL_GAP;
  const toY = runner.y + runner.facing.y * BALL_GAP;
  const stepX = (toX - ball.x) * BALL_FOLLOW;
  const stepY = (toY - ball.y) * BALL_FOLLOW;

  ball.x += stepX;
  ball.y += stepY;
  ball.travel += lengthOf(stepX, stepY);
}

export function moveRunner(runner, input, { tuning, length }) {
  runner.sprinting = held(input, 'sprint') && runner.wobble === 0;

  const want = runner.wobble > 0 ? { x: runner.facing.x, y: 0 } : wantedDirection(input);
  const { speed, turn } = paceOf(runner, tuning);

  runner.vx += (want.x * speed - runner.vx) * turn;
  runner.vy += (want.y * speed - runner.vy) * turn;
  runner.x = clamp(runner.x + runner.vx, LANE.start - 20, length);
  runner.y = clamp(runner.y + runner.vy, EDGE, LANE.width - EDGE);
  runner.wobble = Math.max(0, runner.wobble - 1);

  const moved = lengthOf(runner.vx, runner.vy);

  if (moved > 0.2) {
    runner.facing = normalized(runner.vx, runner.vy);
    runner.stride += moved;
  }

  moveBall(runner);
}

// a brush knocks the run out of the runner and sets them wobbling
export function knockRunner(runner, ticks) {
  runner.wobble = ticks;
  runner.vx *= 0.3;
  runner.vy *= 0.3;
}
