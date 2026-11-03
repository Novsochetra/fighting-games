// a shake kicks the view by whole pixels, a new way each tick, and dies away by this share a tick
const DECAY = 0.8;
const STILL = 0.5;
// a view that jolts on every hard shot and save tires the eyes: only a goal or the end of a duel
// (power 4 and up) shakes it, and at under half the strength asked for
const LEAST_POWER = 4;
const POWER_SHARE = 0.45;

export const createShake = () => ({ power: 0, x: 0, y: 0 });

// the same tick always shakes the same way, so a replayed match is drawn the same
function jolt(tick, salt) {
  let mixed = Math.imul((tick + salt) ^ 0x9e3779b9, 0x85ebca6b);

  mixed ^= mixed >>> 13;
  mixed = Math.imul(mixed, 0xc2b2ae35);

  return ((mixed ^ (mixed >>> 16)) >>> 0) / 4294967296 - 0.5;
}

export function addShake(shake, power) {
  if (power >= LEAST_POWER) {
    shake.power = Math.max(shake.power, power * POWER_SHARE);
  }
}

export function stepShake(shake, tick) {
  if (shake.power < STILL) {
    Object.assign(shake, { power: 0, x: 0, y: 0 });

    return;
  }

  shake.x = Math.round(jolt(tick, 17) * 2 * shake.power);
  shake.y = Math.round(jolt(tick, 91) * 2 * shake.power);
  shake.power *= DECAY;
}
