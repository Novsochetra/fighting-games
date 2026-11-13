import { SHOT_ART } from '../colors.js';
import { GOAL, GROUND } from '../world.js';

export function drawGoalBack(pen) {
  pen.rect([GOAL.line, GROUND - GOAL.height, GOAL.depth, GOAL.height], SHOT_ART.night[1]);
}

export function drawGoalFront(pen) {
  pen.rect([GOAL.line - 1, GROUND - GOAL.height, 3, GOAL.height], SHOT_ART.post[1]);
}
