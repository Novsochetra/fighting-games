import { afterEach, describe, expect, it } from 'vitest';
import { hush, rush, swoosh, whoosh } from '../../../src/audio/synth/air.js';
import { crackle, flap } from '../../../src/audio/synth/texture.js';
import { createTrack } from '../../../src/audio/synth/track.js';
import { seededRandom } from '../../support/seeded-random.js';

const originalRandom = Math.random;
const loudest = (samples, from, to) =>
  samples.slice(from, to).reduce((max, value) => Math.max(max, Math.abs(value)), 0);

afterEach(() => {
  Math.random = originalRandom;
});

describe('crackle', () => {
  it('scatters every click inside its window', () => {
    Math.random = seededRandom(11);
    const track = createTrack(4410, 44100);
    crackle(track, { start: 0.01, length: 0.02, count: 6, cutoff: 2000, level: 0.5 });
    expect(loudest(track.samples, 0, 441)).toBe(0);
    expect(loudest(track.samples, 441, 1600)).toBeGreaterThan(0);
    expect(loudest(track.samples, 1600, 4410)).toBe(0);
  });
});

describe('flap', () => {
  it('starts silent and settles to silence at its end', () => {
    Math.random = seededRandom(5);
    const track = createTrack(8820, 44100);
    flap(track, { start: 0.01, length: 0.12, cutoff: 700, rate: 38, level: 2 });
    expect(loudest(track.samples, 0, 441)).toBe(0);
    expect(loudest(track.samples, 441, 5733)).toBeGreaterThan(0.01);
    expect(Math.abs(track.samples[441 + 5291])).toBeLessThan(0.01);
  });
});

describe('whoosh and swoosh', () => {
  it('swell from silence to a peak and stay inside their length', () => {
    for (const shape of [whoosh, swoosh]) {
      Math.random = seededRandom(9);
      const track = createTrack(8000, 44100);
      shape(track, {
        length: 0.14,
        peak: 0.085,
        cutoffFrom: 380,
        cutoffPeak: 1300,
        cutoffTo: 600,
        resonance: 1.1,
        whistle: { resonance: 5, ratio: 1, level: 0.35 },
        level: 1,
      });
      expect(track.samples[0]).toBe(0);
      expect(loudest(track.samples, 3000, 4500)).toBeGreaterThan(loudest(track.samples, 0, 500));
      expect(loudest(track.samples, 6175, 8000)).toBe(0);
    }
  });
});

// how far the sound moves from one sample to the next, against its size: higher is brighter
function brightness(samples) {
  let energy = 0;
  let change = 0;
  for (let i = 1; i < samples.length; i++) {
    energy += samples[i] * samples[i];
    change += (samples[i] - samples[i - 1]) ** 2;
  }
  return change / energy;
}

describe('rush and hush', () => {
  const PASSING = {
    start: 0.01,
    length: 0.14,
    peak: 0.05,
    from: 400,
    top: 1600,
    to: 500,
    level: 1,
  };

  it('ease in from silence, swell to a peak and stay inside their length', () => {
    for (const shape of [rush, hush]) {
      Math.random = seededRandom(4);
      const track = createTrack(8820, 44100);
      shape(track, { ...PASSING, resonance: 1.4 });
      expect(loudest(track.samples, 0, 441)).toBe(0);
      expect(loudest(track.samples, 441, 500)).toBeLessThan(0.01);
      expect(loudest(track.samples, 2400, 3200)).toBeGreaterThan(loudest(track.samples, 441, 1000));
      expect(loudest(track.samples, 6615, 8820)).toBe(0);
    }
  });

  it('hush carries the same air darker, without the hiss', () => {
    Math.random = seededRandom(4);
    const band = createTrack(8820, 44100);
    rush(band, { ...PASSING, resonance: 1.4 });
    Math.random = seededRandom(4);
    const dark = createTrack(8820, 44100);
    hush(dark, PASSING);
    expect(brightness(dark.samples)).toBeLessThan(brightness(band.samples) / 2);
  });
});
