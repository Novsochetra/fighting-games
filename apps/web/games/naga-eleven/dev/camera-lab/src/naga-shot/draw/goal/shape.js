import { GOAL } from '../../world.js';
import { depthOfDistance, groundOf } from '../stadium/layers.js';

// in the pitch's own perspective (groundOf), so the bar is seen end on with the camera level with
// the goal, and the goal's depth shows the more the camera is off to its side
const HALF_WIDTH = 117;

export const SIDES = { near: -HALF_WIDTH, far: HALF_WIDTH };

// x along the pitch, h up from the grass
export const PROFILE = {
  post: { x: GOAL.line, h: 0 },
  bar: { x: GOAL.line, h: GOAL.height },
  support: { x: GOAL.line + 20, h: GOAL.height },
  back: { x: GOAL.line + GOAL.depth, h: 0 },
};

export const OUTLINE = ['post', 'bar', 'support', 'back'];

export function goalView(camera) {
  const ground = groundOf(camera);

  return {
    depthOf: (side) => depthOfDistance(SIDES[side]),
    at({ x, h }, side) {
      const depth = depthOfDistance(SIDES[side]);

      return { x: ground.xAt(x, depth), y: ground.rowAt(depth) - h * depth };
    },
  };
}

export const backAt = (height) =>
  PROFILE.back.x + ((PROFILE.support.x - PROFILE.back.x) * height) / PROFILE.support.h;
