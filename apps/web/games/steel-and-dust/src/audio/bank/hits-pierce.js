import { boom, burst } from '../synth/impacts.js';
import { steel } from '../synth/steel.js';
import { hitPair } from './hit-size.js';
import { THIN } from './steel-modes.js';

// a spear: a thin "tchk" stab into flesh, then a high, thin steel ring
function buildPierce(track, pitch, size) {
  const tuned = pitch * size.tune;
  const longer = size.length;
  burst(track, { filter: 'highpass', from: 4500, decay: 0.008, level: 1 });
  burst(track, { from: 3200 * tuned, to: 1600 * tuned, resonance: 2.5, decay: 0.025, level: 2 });
  burst(track, {
    from: 1100 * tuned,
    to: 560 * tuned,
    resonance: 1.5,
    decay: 0.045 * longer,
    level: 3.2,
    drive: 2.5,
  });
  steel(track, { base: 3300 * tuned, ratios: THIN, decay: 0.5 * longer, level: 0.22 });
  boom(track, { from: 170 * tuned, to: 70, decay: 0.08 * longer, level: 0.6 });
  return { drive: 2 };
}

export const PIERCE_SOUNDS = hitPair('pierce', {
  level: 1.2,
  bigLevel: 1.3,
  seconds: 0.6,
  build: buildPierce,
});
