import { boom, burst, crack } from '../synth/impacts.js';
import { roar } from '../synth/roar.js';
import { shimmer } from '../synth/shimmer.js';
import { squash } from '../synth/squash.js';
import { hitPair } from './hit-size.js';

// both modeled on sounds the player sent: a charge sound and a long, heavy roar

// the charge sound's shimmer, measured: [Hz, dB below the loudest]
const SHIMMER = [
  [3188, 0],
  [3175, -1.6],
  [3161, -3.8],
  [2986, -4.1],
  [3148, -4.8],
  [3716, -4.8],
  [3959, -4.9],
  [3293, -5],
  [2284, -5.2],
  [2150, -5.3],
];
const IGNITE = { threshold: 0.4, ratio: 6, attack: 0.001, release: 0.05 };
// fitted against the roar: every band within 1 dB of it, and nearly as dense
const DENSE = { threshold: 0.3, ratio: 10, attack: 0.001, release: 0.05 };

// the ULT press: a bright tick, a deep noisy WHUMP (120-200 Hz) that holds 0.1 s and dies into a low
// rumble, and the shimmer sparkling over it from the same instant
function buildUlt(track) {
  burst(track, { filter: 'highpass', from: 2000, decay: 0.015, level: 0.25 });
  roar(track, {
    start: 0.012,
    hold: 0.1,
    fade: 0.14,
    body: 150,
    sub: 90,
    levels: [9, 3.8, 0.2, 0.02],
    flutter: { rate: 26, depth: 0.45 },
  });
  roar(track, {
    start: 0.1,
    hold: 0.25,
    fade: 0.15,
    body: 120,
    sub: 70,
    levels: [0.9, 0.5, 0.03, 0.005],
    flutter: { rate: 20, depth: 0.5 },
  });
  shimmer(track, { partials: SHIMMER, center: 3100, length: 0.44, level: 0.014, fadeFrom: 0.3 });
  squash(track, IGNITE);
  return { drive: 1.6 };
}

// every hit of the ultimate: a crack and a falling boom, then the roar bursting out of them
function buildUltHit(track, pitch, size) {
  const tuned = pitch * size.tune;
  const longer = size.length;
  crack(track, { level: 1, width: 0.002 });
  boom(track, { from: 120 * tuned, to: 45, decay: 0.3 * longer, level: 1.4, drive: 2.5 });
  roar(track, {
    start: 0.004,
    hold: 0.2 * longer,
    fade: 0.4 * longer,
    body: 130 * tuned,
    sub: 75 * tuned,
    levels: [5.4, 2.28, 0.198, 0.066],
  });
  squash(track, DENSE);
  return { drive: 2.5, lowpass: 9000 };
}

// built ahead into the bank like the hits: a roar is far too many samples of filtered noise to
// build from live nodes on the spot. Levels match the sound test the player picked them on
export const ULTIMATE_SOUNDS = {
  ult: { group: 'ult', level: 0.95, takes: 2, seconds: 0.45, priority: 3, build: buildUlt },
  ...hitPair('ultHit', { level: 2, bigLevel: 2.75, seconds: 0.65, build: buildUltHit }),
};
