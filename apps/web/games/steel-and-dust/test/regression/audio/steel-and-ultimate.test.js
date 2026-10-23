import { afterEach, describe, expect, it } from 'vitest';
import { synthesizeTake } from '../../../src/audio/index.js';
import { seededRandom } from '../../support/seeded-random.js';

// the hits did not sound like real steel (the blade died within 0.15 s) and the ultimate's cut-in
// was a soft synth chord, nothing like the scary "jib, jib, jib" of an arcade super move
const RATE = 44100;
const STABS = [0, 0.1, 0.19, 0.27];
const GAPS = [0.065, 0.165, 0.25];
const originalRandom = Math.random;

function rms(samples, from, to) {
  let sum = 0;
  const first = Math.round(from * RATE);
  const last = Math.round(to * RATE);
  for (let i = first; i < last; i++) {
    sum += samples[i] * samples[i];
  }
  return Math.sqrt(sum / (last - first));
}

// the stutter lives above the drone, so listen above 1.5 kHz
function highpassed(samples) {
  const coefficient = Math.exp((-2 * Math.PI * 1500) / RATE);
  let previous = 0;
  let out = 0;
  return samples.map((x) => {
    out = coefficient * (out + x - previous);
    previous = x;
    return out;
  });
}

const take = (key, seed) => {
  Math.random = seededRandom(seed);
  return synthesizeTake(key, { pitch: 1, take: 0, sampleRate: RATE });
};

afterEach(() => {
  Math.random = originalRandom;
});

describe('steel hits and the ultimate cut-in', () => {
  it.each([1, 2, 3])('the sword keeps ringing 0.3 s after it lands (seed %i)', (seed) => {
    const blade = take('blade', seed);
    expect(rms(blade, 0.3, 0.4)).toBeGreaterThan(rms(blade, 0, 0.05) * 0.004);
  });

  it.each([1, 2, 3])('the cut-in stutters "jib, jib, jib", then rings (seed %i)', (seed) => {
    const cutIn = highpassed(take('ult', seed));
    const stabs = STABS.map((start) => rms(cutIn, start + 0.002, start + 0.03));
    const gaps = GAPS.map((start) => rms(cutIn, start, start + 0.02));
    for (const stab of stabs) {
      expect(stab).toBeGreaterThan(Math.max(...gaps) * 10);
    }
    expect(stabs[3]).toBeGreaterThan(stabs[0]);
    expect(rms(cutIn, 0.37, 0.45)).toBeGreaterThan(Math.max(...gaps) * 10);
  });
});
