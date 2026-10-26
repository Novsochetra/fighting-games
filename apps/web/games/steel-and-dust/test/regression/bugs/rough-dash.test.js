import { afterEach, describe, expect, it } from 'vitest';
import { synthesizeTake } from '../../../src/audio/index.js';
import { seededRandom } from '../../support/seeded-random.js';

// Bug: the dash sounded rough and hissy. A driven scuff snapped on with crackle, and white noise
// through gentle bands left most of it above 2.4 kHz. It is now a swirl of air that eases in, with
// the hiss rolled off its top
const RATE = 44100;
const START = 0.02;
const originalRandom = Math.random;

const take = (key, seed) => {
  Math.random = seededRandom(seed);
  return synthesizeTake(key, { pitch: 1, take: 0, sampleRate: RATE });
};

// the RMS frequency of a sound, from how far it moves from one sample to the next
function brightness(samples) {
  let energy = 0;
  let change = 0;
  for (let i = 1; i < samples.length; i++) {
    energy += samples[i] * samples[i];
    change += (samples[i] - samples[i - 1]) ** 2;
  }
  return (RATE / Math.PI) * Math.asin(Math.sqrt(change / energy) / 2);
}

// a click or a crackle is one sample jumping far from the last; the old dash's came as it started
function largestJumpAtStart(samples) {
  let jump = 0;
  for (let i = 1; i < START * RATE; i++) {
    jump = Math.max(jump, Math.abs(samples[i] - samples[i - 1]));
  }
  return jump;
}

const loudest = (samples) => samples.reduce((max, value) => Math.max(max, Math.abs(value)), 0);

const DASHES = ['dash', 'dashAir'].flatMap((key) => [1, 2, 3].map((seed) => [key, seed]));

afterEach(() => {
  Math.random = originalRandom;
});

describe('the dash', () => {
  it.each(DASHES)('%s keeps its air below 1.9 kHz (seed %i)', (key, seed) => {
    expect(brightness(take(key, seed))).toBeLessThan(1900);
  });

  it.each(DASHES)('%s eases in, without a click or crackle (seed %i)', (key, seed) => {
    const samples = take(key, seed);
    expect(largestJumpAtStart(samples)).toBeLessThan(loudest(samples) * 0.1);
  });
});
