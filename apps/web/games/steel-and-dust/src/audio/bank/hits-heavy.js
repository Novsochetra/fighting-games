import { boom, burst, crack } from '../synth/impacts.js';
import { steel } from '../synth/steel.js';
import { crackle } from '../synth/texture.js';
import { hitPair } from './hit-size.js';
import { PLATE } from './steel-modes.js';

// an axe biting into armour: a low metal clang, bone crunching and a heavy body
function buildHeavy(track, pitch, size) {
  const tuned = pitch * size.tune;
  const longer = size.length;
  crack(track, { level: 1 });
  steel(track, {
    base: 380 * tuned,
    ratios: PLATE,
    decay: 0.55 * longer,
    level: 0.35,
    beat: 0.008,
  });
  burst(track, {
    from: 1600 * tuned,
    to: 500 * tuned,
    time: 0.12,
    decay: 0.12 * longer,
    level: 1.4,
    drive: 4,
  });
  burst(track, {
    from: 420 * tuned,
    to: 200 * tuned,
    resonance: 1.4,
    decay: 0.1 * longer,
    level: 4,
    drive: 2.5,
  });
  boom(track, { from: 100 * tuned, to: 34, decay: 0.32 * longer, level: 1.2, drive: 2 });
  crackle(track, { start: 0, length: 0.05 * longer, count: 10, cutoff: 2200, level: 0.5 });
  return { drive: 2.8 };
}

export const HEAVY_SOUNDS = hitPair('heavy', {
  level: 0.8,
  bigLevel: 0.8,
  seconds: 0.8,
  build: buildHeavy,
});
