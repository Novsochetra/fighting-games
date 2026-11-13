import { drawBuildFront } from './effects/build.js';
import { drawChaseFront } from './effects/chase.js';
import { drawCrashFront } from './effects/crash.js';
import { drawStrikeFront } from './effects/strike.js';

const FRONT = {
  awakening: drawBuildFront,
  charge: drawBuildFront,
  manifest: drawBuildFront,
  impact: drawStrikeFront,
  flight: drawChaseFront,
  keeper: drawChaseFront,
  collision: drawCrashFront,
  aftermath: drawCrashFront,
};

export function drawEffectsInFront(pen, moment) {
  FRONT[moment.clock.stage]?.(pen, moment);
}
