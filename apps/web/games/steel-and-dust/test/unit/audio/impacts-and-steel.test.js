import { afterEach, describe, expect, it } from 'vitest';
import { boom, burst, crack, rumble } from '../../../src/audio/synth/impacts.js';
import { steel } from '../../../src/audio/synth/steel.js';
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

const silentFrom = (samples, time) =>
  Array.from(samples.slice(Math.round(time * RATE))).every((value) => value === 0);

afterEach(() => {
  Math.random = originalRandom;
});

describe('impacts', () => {
  it('crack is an N-wave: it jumps up at its start and swings below zero', () => {
    Math.random = () => 0.5;
    const track = createTrack(2000, RATE);
    crack(track, { start: 0.01, level: 1 });
    const first = Math.round(0.01 * RATE);
    expect(track.samples[first - 1]).toBe(0);
    expect(track.samples[first]).toBeGreaterThan(0.9);
    expect(Math.min(...track.samples.slice(first, first + 60))).toBeLessThan(-0.4);
  });

  it('boom, burst and rumble start where they are told and stay inside their length', () => {
    Math.random = seededRandom(5);
    const track = createTrack(RATE, RATE);
    boom(track, { start: 0.1, from: 120, to: 40, decay: 0.2, level: 1 });
    burst(track, { start: 0.1, from: 2000, to: 600, decay: 0.05, level: 1, drive: 2 });
    rumble(track, { start: 0.1, length: 0.4, from: 1500, to: 80, level: 2, rolls: 3 });
    expect(rms(track.samples, 0, 0.1)).toBe(0);
    expect(rms(track.samples, 0.1, 0.2)).toBeGreaterThan(0.05);
    expect(silentFrom(track.samples, 0.51)).toBe(true);
  });
});

describe('steel', () => {
  it('rings on long after the strike, as metal does', () => {
    Math.random = seededRandom(9);
    const track = createTrack(RATE, RATE);
    steel(track, { base: 1720, ratios: [[1, 1, 1]], decay: 0.75, level: 0.5 });
    expect(rms(track.samples, 0.3, 0.35)).toBeGreaterThan(rms(track.samples, 0, 0.05) * 0.02);
  });

  it('gives every mode a detuned twin, so the ring beats instead of holding still', () => {
    Math.random = seededRandom(9);
    const track = createTrack(RATE, RATE);
    steel(track, { base: 1000, ratios: [[1, 1, 1]], decay: 2, level: 0.5, beat: 0.01 });
    const windows = Array.from({ length: 10 }, (_, i) =>
      rms(track.samples, i * 0.02, i * 0.02 + 0.01),
    );
    const rising = windows.slice(1).some((value, i) => value > windows[i] * 1.2);
    expect(rising).toBe(true);
  });
});
