import { LANE } from '../../../training/cone-dribble/course.js';
import { ART_VIEW } from '../pixels.js';

// the lane seen from beside its near edge: depth runs down the screen, squashed, and leans right
// as it goes back so the goal at the end reads as a box
export const FIELD = { top: 84, laneTop: 112, depth: 0.45, skew: 0.2 };

const LEAD = 130;
const FINISH_PAN = 40;

const clampCamera = (x, course) => Math.max(0, Math.min(course.length - ART_VIEW.width, x));

const goalCamera = (course) => clampCamera(course.goalX - ART_VIEW.width + 90, course);

export function cameraOf(state) {
  const { runner, course } = state.run;
  const following = clampCamera(Math.round(runner.x - LEAD), course);

  if (state.phase === 'finish' && state.run.finished) {
    const share = Math.min(1, state.phaseTicks / FINISH_PAN);

    return Math.round(following + (goalCamera(course) - following) * share);
  }

  return state.phase === 'result' && state.run.finished ? goalCamera(course) : following;
}

export function toScreen(camera, x, y) {
  return {
    x: Math.round(x - camera + (LANE.width / 2 - y) * FIELD.skew),
    y: Math.round(FIELD.laneTop + y * FIELD.depth),
  };
}

// the ground's own lean, for what is drawn a row at a time
export const rowShift = (screenY) =>
  ((FIELD.laneTop + (LANE.width / 2) * FIELD.depth - screenY) / FIELD.depth) * FIELD.skew;
