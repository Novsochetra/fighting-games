import { afterEach, describe, expect, it } from 'vitest';
import { synthesizeTake } from '../../../src/audio/index.js';
import { seededRandom } from '../../support/seeded-random.js';

// the hits did not sound like real steel: the blade died within 0.15 s
const RATE = 44100;
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

const take = (key, seed) => {
  Math.random = seededRandom(seed);
  return synthesizeTake(key, { pitch: 1, take: 0, sampleRate: RATE });
};

afterEach(() => {
  Math.random = originalRandom;
});

describe('steel hits', () => {
  it.each([1, 2, 3])('the sword keeps ringing 0.3 s after it lands (seed %i)', (seed) => {
    const blade = take('blade', seed);
    expect(rms(blade, 0.3, 0.4)).toBeGreaterThan(rms(blade, 0, 0.05) * 0.004);
  });
});
