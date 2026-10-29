// a d-pad is three by three, as Delta's are: the middle third of an axis presses neither way, and a
// corner presses both of its directions. The thumb's place is a fraction of the d-pad's half size
// from its centre, so a thumb that slides off the edge keeps pressing that way
const THIRD = 1 / 3;

export function dpadDirections(normalizedX, normalizedY) {
  return {
    up: normalizedY < -THIRD,
    right: normalizedX > THIRD,
    down: normalizedY > THIRD,
    left: normalizedX < -THIRD,
  };
}
