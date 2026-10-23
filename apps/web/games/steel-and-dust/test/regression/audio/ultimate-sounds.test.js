import { afterEach, describe, expect, it } from 'vitest';
import { synthesizeTake } from '../../../src/audio/index.js';
import { seededRandom } from '../../support/seeded-random.js';

// the player picked these on the sound test: the ULT press must answer at once with a deep WHUMP and
// keep sparkling around 3 kHz, and the ultimate's hits must burst and hold like a roar, not tick
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

const peak = (samples) => samples.reduce((loudest, value) => Math.max(loudest, Math.abs(value)), 0);

// a 2.5-4.5 kHz band, where the shimmer lives
function shimmerBand(samples) {
  const lowpass = Math.exp((-2 * Math.PI * 4500) / RATE);
  const highpass = Math.exp((-2 * Math.PI * 2500) / RATE);
  let low = 0;
  let high = 0;
  let previous = 0;
  return samples.map((x) => {
    low = (1 - lowpass) * x + lowpass * low;
    high = highpass * (high + low - previous);
    previous = low;
    return high;
  });
}

const take = (key, seed) => {
  Math.random = seededRandom(seed);
  return synthesizeTake(key, { pitch: 1, take: 0, sampleRate: RATE });
};

afterEach(() => {
  Math.random = originalRandom;
});

describe('the ultimate sounds the player picked', () => {
  it.each([1, 2, 3])('the ULT press hits at once and its shimmer lasts (seed %i)', (seed) => {
    const press = take('ult', seed);
    expect(rms(press, 0.012, 0.06)).toBeGreaterThan(peak(press) * 0.25);
    const shimmer = shimmerBand(press);
    expect(rms(shimmer, 0.25, 0.35)).toBeGreaterThan(rms(shimmer, 0.02, 0.06) * 0.15);
  });

  it.each([1, 2, 3])('an ultimate hit bursts and holds where a punch dies (seed %i)', (seed) => {
    const burst = take('ultHit', seed);
    const punch = take('blunt', seed);
    expect(rms(burst, 0.1, 0.2)).toBeGreaterThan(rms(burst, 0, 0.05) * 0.2);
    expect(rms(punch, 0.1, 0.2)).toBeLessThan(rms(punch, 0, 0.05) * 0.1);
  });
});
