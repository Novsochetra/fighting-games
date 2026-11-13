import { clamp01, lerp } from '../hash.js';

const easeInOut = (share) => {
  const value = clamp01(share);

  return value * value * (3 - 2 * value);
};

function shotIndexAt(shots, ticks) {
  let index = 0;

  for (let i = 0; i < shots.length; i += 1) {
    if (shots[i].from <= ticks) {
      index = i;
    }
  }

  return index;
}

const pointOf = (targets, name) => targets[name] ?? targets.middle;

export function viewAt(shots, ticks, targets) {
  const index = shotIndexAt(shots, ticks);
  const shot = shots[index];
  const to = pointOf(targets, shot.on);

  if (!shot.glide || index === 0) {
    return { x: to.x, y: to.y, step: shot.step };
  }

  const from = pointOf(targets, shots[index - 1].on);
  const share = easeInOut((ticks - shot.from) / shot.glide);

  return { x: lerp(from.x, to.x, share), y: lerp(from.y, to.y, share), step: shot.step };
}

export const fullTicks = (ticks, { length, full }) =>
  length > 0 ? (ticks * full) / length : ticks;
