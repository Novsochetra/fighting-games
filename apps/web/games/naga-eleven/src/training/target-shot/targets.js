import { nextRandom } from '../../sim/random.js';

// the goal's mouth seen face on: x across from its middle, y up from the grass, in drawn pixels
export const MOUTH = { half: 240, height: 160 };

export const AIM_HOME = { x: 0, y: 80 };

export const TARGETS = [
  { x: -186, y: 122 },
  { x: 186, y: 122 },
  { x: -186, y: 38 },
  { x: 186, y: 38 },
];

export const lightTicksOf = (tuning, level) =>
  Math.max(tuning.minLight, tuning.lightTicks + tuning.lightPerLevel * (level - 1));

// never the same corner twice running
export function pickTarget(random, last) {
  const choices = TARGETS.map((_, i) => i).filter((i) => i !== last);

  return choices[Math.floor(nextRandom(random) * choices.length)];
}

export function lightTarget(state, tuning) {
  const run = state.run;
  const total = lightTicksOf(tuning, state.level);
  const index = pickTarget(state.random, run.target?.index ?? -1);

  run.target = { index, left: total, total };
  run.aim = { ...AIM_HOME };
}

export const isLate = (target, tuning) =>
  target.left > 0 && target.left <= Math.round(target.total * tuning.lateShare);

export function targetAt(target, point, radius) {
  if (!target || target.left <= 0) {
    return false;
  }

  const spot = TARGETS[target.index];
  const across = point.x - spot.x;
  const up = point.y - spot.y;

  return across * across + up * up <= radius * radius;
}
