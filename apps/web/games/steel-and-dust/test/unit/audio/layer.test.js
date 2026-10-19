import { afterEach, describe, expect, it } from 'vitest';
import { layer } from '../../../src/audio/synth/layer.js';
import { createTrack } from '../../../src/audio/synth/track.js';

const SAMPLE_RATE = 1000;
const originalRandom = Math.random;

function constantRandom(value) {
  let calls = 0;
  Math.random = () => {
    calls++;
    return value;
  };
  return () => calls;
}

afterEach(() => {
  Math.random = originalRandom;
});

describe('layer', () => {
  it('adds a waveform shaped by the strike envelope', () => {
    constantRandom(0);
    const track = createTrack(20, SAMPLE_RATE);
    layer(track, { wave: 'square', frequency: 100, attack: 0.002, decay: 0.01 });
    expect(track.samples[0]).toBe(0);
    expect(track.samples[1]).toBeCloseTo(0.5, 6);
    expect(track.samples[2]).toBeCloseTo(1, 6);
    expect(track.samples[11]).toBeCloseTo(Math.exp(-6.9 * 0.9), 6);
    expect(track.samples[12]).toBe(0);
  });

  it('starts at its offset, adds into what is there and never writes past the end', () => {
    constantRandom(0);
    const track = createTrack(10, SAMPLE_RATE);
    track.samples.fill(1);
    layer(track, {
      wave: 'square',
      frequency: 1,
      length: 0.05,
      start: 0.006,
      envelope: () => 1,
      level: 2,
    });
    expect(Array.from(track.samples.slice(0, 6))).toEqual([1, 1, 1, 1, 1, 1]);
    expect(Array.from(track.samples.slice(6))).toEqual([3, 3, 3, 3]);
  });

  it('draws one random phase, then one random value per noise sample', () => {
    const calls = constantRandom(0.75);
    const track = createTrack(30, SAMPLE_RATE);
    layer(track, { length: 0.01, envelope: () => 1 });
    expect(calls()).toBe(11);
    expect(track.samples[0]).toBeCloseTo(0.5, 6);
    expect(track.samples[10]).toBe(0);
  });

  it('lets a constant through a lowpass and blocks it with a highpass', () => {
    const flat = { wave: 'square', frequency: 0, length: 0.2, envelope: () => 1 };
    constantRandom(0.1);
    const low = createTrack(200, SAMPLE_RATE);
    layer(low, { ...flat, filter: 'lowpass', cutoff: 50 });
    const high = createTrack(200, SAMPLE_RATE);
    layer(high, { ...flat, filter: 'highpass', cutoff: 50 });
    expect(low.samples[199]).toBeCloseTo(1, 3);
    expect(Math.abs(high.samples[199])).toBeLessThan(0.001);
  });

  it('drives the signal through tanh, so it stays inside -1..1', () => {
    constantRandom(0);
    const track = createTrack(5, SAMPLE_RATE);
    layer(track, { wave: 'square', frequency: 1, length: 0.005, envelope: () => 1, drive: 2 });
    expect(track.samples[0]).toBeCloseTo(Math.tanh(2), 6);
  });
});
