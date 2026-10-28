import { QUICKSAND } from '../../data/quicksand.js';

// the patch whose sand is under `x`; a body already held is held a little past the rim, so a
// shove from the fighters around it does not pull it free
export function patchAt(patches, x, reach = QUICKSAND.halfWidth) {
  return patches.find((patch) => Math.abs(x - patch.x) < reach) ?? null;
}

// feet on the sand itself, not in the air over it
export function standsIn(patch, fighter) {
  return !fighter.airborne && Math.abs(fighter.y - patch.y) < 1;
}

// the sand is deepest in the middle and shallow by the rim
export function shelf(patch, x) {
  return Math.max(0, (QUICKSAND.halfWidth - Math.abs(x - patch.x)) * QUICKSAND.shelf);
}

// the step a fighter took this tick only gets part of the way through the sand; a fighter frozen
// in a hit took none
export function wade(fighter) {
  if (fighter.hitstop === 0) {
    fighter.x -= fighter.vx * (1 - QUICKSAND.wade);
  }
}

export function letGo(fighter) {
  if (fighter.sunk) {
    fighter.sunk = 0;
  }
}
