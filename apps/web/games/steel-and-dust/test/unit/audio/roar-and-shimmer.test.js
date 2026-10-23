import { afterEach, describe, expect, it } from 'vitest';
import { roar } from '../../../src/audio/synth/roar.js';
import { shimmer } from '../../../src/audio/synth/shimmer.js';
import { squash } from '../../../src/audio/synth/squash.js';
import { createTrack } from '../../../src/audio/synth/track.js';
import { seededRandom } from '../../support/seeded-random.js';

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

afterEach(() => {
  Math.random = originalRandom;
});

describe('roar', () => {
  it('hits at once, holds, then fades away inside its length', () => {
    Math.random = seededRandom(4);
    const track = createTrack(RATE, RATE);
    roar(track, { start: 0.1, hold: 0.3, fade: 0.3 });
    expect(rms(track.samples, 0, 0.1)).toBe(0);
    const held = rms(track.samples, 0.11, 0.39);
    expect(rms(track.samples, 0.11, 0.15)).toBeGreaterThan(held * 0.5);
    expect(rms(track.samples, 0.6, 0.7)).toBeLessThan(held * 0.02);
    expect(Array.from(track.samples.slice(Math.round(0.71 * RATE))).every((x) => x === 0)).toBe(
      true,
    );
  });

  it('flutters: its loudness wobbles far more than the same roar held still', () => {
    const wobble = (depth) => {
      Math.random = seededRandom(4);
      const track = createTrack(RATE, RATE);
      // only the broad grit and air bands, whose loudness holds steady without the flutter
      roar(track, { hold: 0.8, fade: 0.1, levels: [0, 0, 1, 1], flutter: { rate: 29, depth } });
      const windows = Array.from({ length: 100 }, (_, i) =>
        rms(track.samples, 0.1 + i * 0.006, 0.105 + i * 0.006),
      );
      const mean = windows.reduce((sum, value) => sum + value, 0) / windows.length;
      const spread = Math.sqrt(
        windows.reduce((sum, value) => sum + (value - mean) ** 2, 0) / windows.length,
      );
      return spread / mean;
    };
    expect(wobble(0.5)).toBeGreaterThan(wobble(0) * 1.5);
  });
});

describe('squash', () => {
  it('pulls everything above the threshold down toward it and leaves quiet sound alone', () => {
    const track = createTrack(RATE, RATE);
    track.samples.fill(0.1, 0, RATE / 2);
    track.samples.fill(1, RATE / 2);
    squash(track, { threshold: 0.3, ratio: 10, attack: 0.001, release: 0.05 });
    expect(track.samples[1000]).toBeCloseTo(0.1, 6);
    expect(track.samples[RATE - 1]).toBeLessThan(0.4);
    expect(track.samples[RATE - 1]).toBeGreaterThan(0.3);
  });
});

describe('shimmer', () => {
  it('rings its partials from the start, through its length, and then stops', () => {
    Math.random = seededRandom(8);
    const track = createTrack(RATE, RATE);
    shimmer(track, {
      partials: [
        [3000, 0],
        [3200, -6],
      ],
      center: 3100,
      length: 0.4,
      level: 0.1,
      fadeFrom: 0.3,
    });
    expect(rms(track.samples, 0.02, 0.05)).toBeGreaterThan(0.05);
    expect(rms(track.samples, 0.25, 0.3)).toBeGreaterThan(0.05);
    expect(peak(track.samples.slice(Math.round(0.41 * RATE)))).toBe(0);
  });
});
