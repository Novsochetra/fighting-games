import { DIZZY, DUST } from '../../../art/training/ground.js';
import { BALL } from '../../../art/training/people.js';
import { lengthOf } from '../../../sim/vector.js';
import { drawGroundBall } from '../ball.js';
import { artOf, drawFootballer, kickOf } from '../footballer.js';
import { faded, paint } from '../pixels.js';
import { netSpot } from './goal.js';
import { runnerPose } from './pose.js';
import { toScreen } from './view.js';

const FLIGHT = 36;

// the lines stream out behind him, whichever way he runs
function drawSpeedLines(context, { x, y }, { tick, back }) {
  faded(context, 0.6, () => {
    for (let i = 0; i < 3; i += 1) {
      const length = 6 + ((tick + i * 5) % 7);
      const near = 14 + i * 2;
      const start = back < 0 ? x - near - length : x + near;

      paint(context, BALL.trail, [start, y - 44 + i * 12, length, 1]);
    }
  });
  paint(context, DUST[1], [x + back * (9 + (tick % 4)), y - 2, 2, 1]);
  paint(context, DUST[0], [x + back * (13 + (tick % 6)), y - 3, 2, 2]);
}

// the stars' stops round his head, an ellipse seen nearly edge on
const ORBIT = [
  [0, -3],
  [9, -2],
  [13, 0],
  [9, 2],
  [0, 3],
  [-9, 2],
  [-13, 0],
  [-9, -2],
];

// a four-point star, outlined so it reads on the grass and the sky; it twinkles a size smaller
// every other step
function drawStar(context, { x, y, big }) {
  const arm = big ? 3 : 2;
  const span = arm * 2 + 1;

  paint(context, DIZZY.outline, [x - arm - 1, y - 1, span + 2, 3]);
  paint(context, DIZZY.outline, [x - 1, y - arm - 1, 3, span + 2]);
  paint(context, DIZZY.deep, [x - arm, y, span, 1]);
  paint(context, DIZZY.deep, [x, y - arm, 1, span]);
  paint(context, DIZZY.face, [x - arm + 1, y, span - 2, 1]);
  paint(context, DIZZY.face, [x, y - arm + 1, 1, span - 2]);
  paint(context, DIZZY.light, [x, y - 1, 1, 2]);
}

// three stars circle his head while he finds his feet again
function drawDizzy(context, { x, y, head }, tick) {
  const step = Math.floor(tick / 4);

  for (const offset of [0, 3, 5]) {
    const [dx, dy] = ORBIT[(step + offset) % ORBIT.length];

    drawStar(context, { x: x + dx, y: y - head - 4 + dy, big: (step + offset) % 2 === 0 });
  }
}

export function runnerDrawable(state, { camera, tick, actors }) {
  const runner = state.run.runner;
  const place = toScreen(camera, runner.x, runner.y);
  const moving = lengthOf(runner.vx, runner.vy) > 0.3;
  const shake = runner.wobble > 0 ? (Math.floor(tick / 3) % 2) * 2 - 1 : 0;
  const pose = runnerPose(state, kickOf(actors));

  return {
    depth: runner.y,
    draw: (context) => {
      if (runner.sprinting && moving) {
        drawSpeedLines(context, place, { tick, back: runner.facing.x < 0 ? 1 : -1 });
      }

      drawFootballer(context, { actors, pose, x: place.x + shake, y: place.y });

      if (runner.wobble > 0) {
        drawDizzy(context, { ...place, head: artOf(actors).standHeight }, tick);
      }
    },
  };
}

// once over the line he strikes the ball into the net
function flyingBall(state) {
  const { run } = state;
  const goal = netSpot(run.course.goalX);
  const share = Math.min(1, state.phaseTicks / FLIGHT);
  const from = run.runner.ball;

  return {
    x: from.x + (goal.x - from.x) * share,
    y: from.y + (goal.y - from.y) * share,
    height: share < 1 ? 4 * 20 * share * (1 - share) : 0,
    travel: from.travel + share * 40,
  };
}

export function ballOf(state) {
  const run = state.run;
  const struck = run.finished && (state.phase === 'finish' || state.phase === 'result');

  if (!struck) {
    return { ...run.runner.ball, height: 0, inGoal: false };
  }

  const ball = flyingBall(state.phase === 'result' ? { ...state, phaseTicks: FLIGHT } : state);

  return { ...ball, inGoal: true };
}

export function ballDrawable(state, { camera }) {
  const ball = ballOf(state);
  const place = toScreen(camera, ball.x, ball.y);

  return {
    depth: ball.y,
    inGoal: ball.inGoal,
    draw: (context) =>
      drawGroundBall(context, { x: place.x, y: place.y, height: ball.height, travel: ball.travel }),
  };
}
