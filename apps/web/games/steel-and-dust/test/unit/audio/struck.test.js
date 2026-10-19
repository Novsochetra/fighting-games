import { afterEach, describe, expect, it } from 'vitest';
import { bell, excitation, modes, ring, woodKnock } from '../../../src/audio/synth/struck.js';
import { createTrack } from '../../../src/audio/synth/track.js';
import { seededRandom } from '../../support/seeded-random.js';

const originalRandom = Math.random;
const peak = (samples) => samples.reduce((loudest, value) => Math.max(loudest, Math.abs(value)), 0);

afterEach(() => {
  Math.random = originalRandom;
});

describe('excitation', () => {
  it('is a few milliseconds of decaying noise with a click on the first sample', () => {
    Math.random = () => 0.5;
    const strike = excitation({ milliseconds: 2, lowpass: 0, click: 1 }, 44100);
    expect(strike.length).toBe(88);
    expect(strike[0]).toBe(1);
    expect(strike[1]).toBe(0);
  });

  it('is never shorter than one sample', () => {
    expect(excitation({ milliseconds: 0, lowpass: 1000 }, 44100).length).toBe(1);
  });
});

describe('modes', () => {
  it('adds each mode normalized to its level, from the start offset', () => {
    const track = createTrack(4410, 44100);
    const strike = new Float32Array([1]);
    modes(track, strike, [[440, 0.05, 0.5]], 0.01);
    expect(Array.from(track.samples.slice(0, 441)).every((value) => value === 0)).toBe(true);
    expect(peak(track.samples)).toBeCloseTo(0.5, 6);
  });
});

describe('ring', () => {
  it('scales the mode frequencies by pitch, exactly like listing them pre-scaled', () => {
    const resonator = {
      strike: { milliseconds: 3, lowpass: 7000, click: 1 },
      modes: [[2900, 0.014, 0.5]],
    };
    Math.random = seededRandom(7);
    const viaRing = createTrack(2000, 44100);
    ring(viaRing, resonator, 1.03);
    Math.random = seededRandom(7);
    const direct = createTrack(2000, 44100);
    modes(direct, excitation(resonator.strike, 44100), [[2900 * 1.03, 0.014, 0.5]]);
    expect(Array.from(viaRing.samples)).toEqual(Array.from(direct.samples));
  });
});

describe('bell and woodKnock', () => {
  it('make sound that dies away inside the track', () => {
    Math.random = seededRandom(3);
    const track = createTrack(8000, 44100);
    bell(track, { base: 2380, ratios: [1, 1.5], decay: 0.1, level: 0.45 });
    woodKnock(track, 430, 0.02);
    expect(peak(track.samples)).toBeGreaterThan(0.1);
    expect(track.samples[7999]).toBe(0);
  });
});
