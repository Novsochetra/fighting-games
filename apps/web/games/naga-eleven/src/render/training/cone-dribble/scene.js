import { LANE } from '../../../training/cone-dribble/course.js';
import { SPRITES } from '../../../data/sprites.js';
import { standHeightOf } from '../../actors/sheets.js';
import { BANNER_HEIGHT } from '../marks.js';
import { ART, inArt } from '../pixels.js';
import { drawBackdrop } from './backdrop.js';
import { drawField } from './field.js';
import { drawGoalBack, drawGoalFront } from './goal.js';
import { drawFinishFlag } from '../scenery/kit.js';
import { drawCone, drawFallenCone, drawMannequin } from '../scenery/obstacles.js';
import { drawSideProps } from './props.js';
import { ballDrawable, runnerDrawable } from './runner.js';
import { cameraOf, toScreen } from './view.js';

const ROCK_TICKS = 24;

// how tall the footballer sheets stand him, which marks and banners keep clear of; a mark stands
// over a cone, and he passes behind it a little higher up the screen, so it is lifted past his
// head there, with room for its own words
const STAND = standHeightOf(SPRITES);
const MARK_LIFT = STAND + 18;
const BANNER = { top: 78, gap: 4 };

const SEEN = { left: -30, right: 420 };

function coneDrawables(course, camera) {
  return course.cones
    .map((cone) => ({ cone, place: toScreen(camera, cone.x, cone.y) }))
    .filter(({ place }) => place.x > SEEN.left && place.x < SEEN.right)
    .map(({ cone, place }) => ({
      depth: cone.y,
      draw: (context) => (cone.down === null ? drawCone : drawFallenCone)(context, place),
    }));
}

function mannequinDrawables(course, { camera, tick }) {
  return course.mannequins
    .map((mannequin) => ({ mannequin, place: toScreen(camera, mannequin.x, mannequin.y) }))
    .filter(({ place }) => place.x > SEEN.left && place.x < SEEN.right)
    .map(({ mannequin, place }) => {
      const since = mannequin.hit === null ? ROCK_TICKS : tick - mannequin.hit;
      const rock = since < ROCK_TICKS ? (Math.floor(since / 4) % 2) * 2 - 1 : 0;

      return { depth: mannequin.y, draw: (context) => drawMannequin(context, { ...place, rock }) };
    });
}

function drawLane(context, state, view) {
  const { course } = state.run;
  const ball = ballDrawable(state, view);
  const standing = [
    ...coneDrawables(course, view.camera),
    ...mannequinDrawables(course, view),
    runnerDrawable(state, view),
    ...(ball.inGoal ? [] : [ball]),
  ].sort((first, second) => first.depth - second.depth);

  drawFinishFlag(context, { ...toScreen(view.camera, course.finishX, -8), tick: view.tick });
  drawGoalBack(context, { camera: view.camera, goalX: course.goalX });

  for (const drawable of standing) {
    drawable.draw(context);
  }

  if (ball.inGoal) {
    ball.draw(context);
  }

  drawGoalFront(context, { camera: view.camera, goalX: course.goalX });
  drawFinishFlag(context, {
    ...toScreen(view.camera, course.finishX, LANE.width + 8),
    tick: view.tick + 6,
  });
}

export function drawConeScene(context, state, { tick, actors }) {
  const camera = cameraOf(state);
  const view = { camera, tick: state.tick, frame: tick, actors };

  inArt(context, () => {
    drawBackdrop(context, { camera, tick: state.tick });
    drawField(context, { camera, course: state.run.course, tick: state.tick });
    drawSideProps(context, { camera, tick: state.tick, goalX: state.run.course.goalX });
    drawLane(context, state, view);
  });
}

// where a mark from the sim stands on the canvas, in canvas pixels
export function coneMarkPlace(state, mark) {
  const point = toScreen(cameraOf(state), mark.x, mark.y);

  return { x: point.x * ART, y: (point.y - MARK_LIFT) * ART };
}

// READY, GO and the finish stand over his head, under the HUD; along the lane's far edge his head
// is up there too, so they stand under his feet instead
export function coneBannerTop(state) {
  const { runner } = state.run;
  const ground = toScreen(cameraOf(state), runner.x, runner.y).y * ART;
  const head = ground - STAND * ART;

  return head >= BANNER.top + BANNER_HEIGHT + BANNER.gap ? BANNER.top : ground + BANNER.gap * 2;
}
