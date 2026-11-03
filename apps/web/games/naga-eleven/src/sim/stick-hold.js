import { stickOf } from './stick.js';

// when control passes to another man, the stick is still held the way the player steered the last
// one, which would run the new one off the ball: it counts for him only once it moves, or after
// `ticks`
export function holdStick(match, ticks) {
  match.stickHold = { until: match.tick + ticks, stick: stickOf(match.input) };
}

// once the stick has moved the hold is over for good, even if it comes back to where it was
export function isHeldOver(match, stick) {
  const hold = match.stickHold;

  if (!hold || match.tick >= hold.until) {
    return false;
  }

  if (stick.x === hold.stick.x && stick.y === hold.stick.y) {
    return true;
  }

  match.stickHold = null;

  return false;
}
