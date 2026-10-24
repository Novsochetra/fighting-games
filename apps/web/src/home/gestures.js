export const SWIPE_DISTANCE = 40;
export const WHEEL_DISTANCE = 60;
export const WHEEL_REST_MS = 450;

// A swipe is a mostly sideways drag; dragging left brings the next card in.
export function swipeStep({ dx, dy }, distance = SWIPE_DISTANCE) {
  if (Math.abs(dx) < distance || Math.abs(dx) <= Math.abs(dy)) {
    return 0;
  }
  return dx < 0 ? 1 : -1;
}

// A trackpad swipe arrives as a stream of wheel events; it moves one card, then the rest of the stream
// is ignored until it settles, so a flick never skips through the whole carousel.
export function createWheelStepper({ now, distance = WHEEL_DISTANCE, restMs = WHEEL_REST_MS }) {
  let travel = 0;
  let restUntil = 0;
  return function feed({ deltaX, deltaY }) {
    if (Math.abs(deltaX) <= Math.abs(deltaY)) {
      return 0;
    }
    const time = now();
    if (time < restUntil) {
      restUntil = time + restMs;
      return 0;
    }
    travel += deltaX;
    if (Math.abs(travel) < distance) {
      return 0;
    }
    const step = Math.sign(travel);
    travel = 0;
    restUntil = time + restMs;
    return step;
  };
}
