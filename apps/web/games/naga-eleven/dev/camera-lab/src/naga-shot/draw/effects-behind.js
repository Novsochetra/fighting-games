import { drawBuildBehind } from './effects/build.js';
import { drawChaseBehind } from './effects/chase.js';
import { drawCrashBehind } from './effects/crash.js';
import { drawStrikeBehind } from './effects/strike.js';

const BEHIND = {
  awakening: drawBuildBehind,
  charge: drawBuildBehind,
  manifest: drawBuildBehind,
  impact: drawStrikeBehind,
  flight: drawChaseBehind,
  keeper: drawChaseBehind,
  collision: drawCrashBehind,
  aftermath: drawCrashBehind,
};

export function drawEffectsBehind(pen, moment) {
  BEHIND[moment.clock.stage]?.(pen, moment);
}
