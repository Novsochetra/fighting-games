import { boom, burst, crack } from '../synth/impacts.js';
import { steel } from '../synth/steel.js';
import { hitPair } from './hit-size.js';
import { KATANA } from './steel-modes.js';

// a katana: a "tsshk" slice, a meaty "chk", then the blade keeps ringing
function buildBlade(track, pitch, size) {
  const tuned = pitch * size.tune;
  const longer = size.length;
  crack(track, { level: 0.9 });
  burst(track, {
    from: 9000 * tuned,
    to: 2400 * tuned,
    time: 0.06 * longer,
    resonance: 2.2,
    decay: 0.075 * longer,
    level: 2.2,
  });
  burst(track, {
    from: 1100 * tuned,
    to: 520 * tuned,
    time: 0.05,
    resonance: 1.4,
    decay: 0.06 * longer,
    level: 3.5,
    drive: 3,
  });
  boom(track, { from: 150 * tuned, to: 55, decay: 0.14 * longer, level: 0.9 });
  steel(track, {
    start: 0.002,
    base: 1720 * tuned,
    ratios: KATANA,
    decay: 0.75 * longer,
    level: 0.32,
  });
  return { drive: 2.2 };
}

export const BLADE_SOUNDS = hitPair('blade', {
  level: 0.77,
  bigLevel: 0.95,
  seconds: 0.8,
  build: buildBlade,
});
