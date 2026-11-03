import { drawMannequin } from '../scenery/obstacles.js';
import { drawBag, drawBench, drawBottles, drawStack } from '../scenery/kit.js';
import { toScreen } from './view.js';

// what stands along the far side of the lane, in world places
const PROPS = [
  { x: 150, y: -46, draw: drawBench },
  { x: 100, y: -38, draw: drawBottles },
  { x: 206, y: -40, draw: drawBag },
  { x: 560, y: -30, draw: drawStack },
  { x: 900, y: -44, draw: drawMannequin },
  { x: 926, y: -44, draw: drawMannequin },
  { x: 952, y: -44, draw: drawMannequin },
  { x: 1420, y: -36, draw: drawBag },
  { x: 1900, y: -30, draw: drawStack },
  { x: 2380, y: -44, draw: drawMannequin },
];

// the course ends at its goal wherever its cones end, so what stands where the goal does is left out
const GOAL_ROOM = 90;
const SEEN = { left: -60, right: 450 };

// the props to draw and where they stand on the screen
export function sidePropsIn({ camera, goalX }) {
  return PROPS.filter((prop) => prop.x < goalX - GOAL_ROOM)
    .map((prop) => ({ prop, place: toScreen(camera, prop.x, prop.y) }))
    .filter(({ place }) => place.x > SEEN.left && place.x < SEEN.right);
}

export function drawSideProps(context, { camera, tick, goalX }) {
  for (const { prop, place } of sidePropsIn({ camera, goalX })) {
    prop.draw(context, { ...place, tick });
  }
}
