import { easeInOut } from './smooth.js';

// a cinematic move: the camera leaves the ball and glides to a point, easing in and out, then
// follows again from there. One timed by the kick off's own clock waits while the match does (an
// opening card before the whistle) and ends on time whatever came before.
export function startPan(camera, { x, y, ticks, byKickoff = false }) {
  camera.pan = {
    from: { x: camera.along.value, y: camera.depth.value },
    to: { x, y },
    ticks: Math.max(1, ticks),
    done: 0,
    byKickoff,
  };
}

const ticksDone = (pan, match) => (pan.byKickoff ? match.phaseTicks : pan.done + 1);

export function stepPan(camera, match) {
  const { pan } = camera;
  const share = easeInOut(Math.min(1, ticksDone(pan, match) / pan.ticks));
  const x = pan.from.x + (pan.to.x - pan.from.x) * share;
  const y = pan.from.y + (pan.to.y - pan.from.y) * share;

  camera.along.velocity = x - camera.along.value;
  camera.depth.velocity = y - camera.depth.value;
  camera.along.value = x;
  camera.depth.value = y;
  pan.done = ticksDone(pan, match);

  if (pan.done >= pan.ticks) {
    camera.pan = null;
    camera.along.velocity = 0;
    camera.depth.velocity = 0;
  }
}
