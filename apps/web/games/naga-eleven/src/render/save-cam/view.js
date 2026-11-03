// The camera stands behind the penalty spot, low, looking at the goal: x is metres across the goal
// (plus to the shooter's right as he faces it), y metres up, z metres from the camera. It projects
// onto the duel's art grid, 256 by 144, so the goal fills the view between the bars
const CAMERA = { x: 128, horizon: 84.9, focal: 300, eye: 0.7 };

export const DEPTH = { strike: 2.6, keeper: 10.2, line: 11, net: 12.6 };

export const GOAL_SIZE = { halfWidth: 3.66, height: 2.44 };

export const BALL_SIZE = 0.14;

export function project({ x, y, z }) {
  const scale = CAMERA.focal / Math.max(0.5, z);

  return { x: CAMERA.x + x * scale, y: CAMERA.horizon + (CAMERA.eye - y) * scale, scale };
}

export const HORIZON = CAMERA.horizon;

// the grass seen at the middle of a row of the art grid: how far off it lies, and how many metres
// across the goal a column of that row is
export const depthOfRow = (row) =>
  (CAMERA.focal * CAMERA.eye) / Math.max(0.01, row + 0.5 - CAMERA.horizon);

export const acrossAt = (column, depth) => ((column + 0.5 - CAMERA.x) * depth) / CAMERA.focal;

// where a shot aimed at `aim` ({ side, height }, -1 to 1 across the goal, 0 to 1 up it) crosses the
// goal line
export const aimPoint = (aim) => ({
  x: aim.side * GOAL_SIZE.halfWidth,
  y: Math.max(BALL_SIZE, aim.height * GOAL_SIZE.height),
  z: DEPTH.line,
});

// the frame's corners on the art grid: the posts' feet on the line and the bar
export const FRAME = (() => {
  const left = project({ x: -GOAL_SIZE.halfWidth, y: 0, z: DEPTH.line });
  const right = project({ x: GOAL_SIZE.halfWidth, y: 0, z: DEPTH.line });
  const bar = project({ x: 0, y: GOAL_SIZE.height, z: DEPTH.line });

  return {
    left: Math.round(left.x),
    right: Math.round(right.x),
    line: Math.round(left.y),
    bar: Math.round(bar.y),
  };
})();
