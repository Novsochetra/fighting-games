import { project } from '../../camera.js';

// the goal at one end as world points: its posts on the goal line, the back of its net `depth`
// behind it; `sag` lowers the middle of the bar and the back of the net, for a goal of bamboo
export function goalShape({ pitch, goal }, end, { sag = 0, backDrop = 0.12 } = {}) {
  const line = end === 0 ? 0 : pitch.length;
  const back = end === 0 ? -goal.depth : pitch.length + goal.depth;
  const far = pitch.width / 2 - goal.width / 2;
  const near = pitch.width / 2 + goal.width / 2;

  return {
    line,
    back,
    far,
    near,
    height: goal.height,
    backHeight: goal.height * (1 - backDrop),
    sag,
  };
}

// the net bulges back from where the ball went in, and the bulge rings out and dies away
export function bulgeOf(ripple, { y, z }) {
  if (!ripple) {
    return 0;
  }

  const gap = ((y - ripple.y) ** 2 + (z - ripple.z) ** 2) / 900;
  const fade = Math.max(0, 1 - ripple.age / 70);
  const swing = 0.55 + 0.45 * Math.cos(ripple.age * 0.35);

  return 14 * fade * swing * Math.exp(-gap);
}

// a point of the goal in the view; `out` pushes it further back, away from the pitch
export function pointOf(camera, shape, { x, y, z, out = 0 }) {
  const away = shape.back < shape.line ? -1 : 1;
  const point = project(camera, x + away * out, y, z);

  return { x: Math.round(point.x), y: Math.round(point.y) };
}
