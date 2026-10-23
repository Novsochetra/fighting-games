import { afterEach, describe, expect, it } from 'vitest';
import { pulses, strikeEnvelope } from '../../../src/audio/synth/envelopes.js';
import { phasor, signal } from '../../../src/audio/synth/signal.js';
import { fmSource, ringModSource, sawStackSource } from '../../../src/audio/synth/sources.js';
import { createTrack } from '../../../src/audio/synth/track.js';

const originalRandom = Math.random;
const peak = (samples) => samples.reduce((loudest, value) => Math.max(loudest, Math.abs(value)), 0);

afterEach(() => {
  Math.random = originalRandom;
});

describe('envelopes', () => {
  it('strikeEnvelope rises over the attack, then falls about 60 dB over the decay', () => {
    const envelope = strikeEnvelope(0.01, 0.1);
    expect(envelope(0.005)).toBeCloseTo(0.5, 6);
    expect(envelope(0.01)).toBe(1);
    expect(envelope(0.11)).toBeCloseTo(0.001, 3);
  });

  it('pulses gates each burst on its own and keeps the louder one where they overlap', () => {
    const envelope = pulses([
      [0, 0.001, 0.02, 0.01],
      [0.1, 0.001, 0.02, 0.01, 0.5],
    ]);
    expect(envelope(0.01)).toBe(1);
    expect(envelope(0.06)).toBeLessThan(0.001);
    expect(envelope(0.11)).toBe(0.5);
    expect(envelope(0.09)).toBeLessThan(0.001);
  });
});

describe('phasor and signal', () => {
  it('phasor wraps from 0 to 1 at the given frequency', () => {
    Math.random = () => 0;
    const phase = phasor(441, 44100);
    expect(phase(0)).toBeCloseTo(0.01, 9);
    for (let i = 0; i < 98; i++) {
      phase(0);
    }
    const wrapped = phase(0);
    expect(Math.min(wrapped, 1 - wrapped)).toBeLessThan(1e-9);
  });

  it('signal adds a source from its start, through the envelope and level', () => {
    const track = createTrack(100, 1000);
    signal(track, { source: () => () => 1, start: 0.02, length: 0.05, envelope: 0.5, level: 2 });
    expect(track.samples[19]).toBe(0);
    expect(track.samples[20]).toBe(1);
    expect(track.samples[69]).toBe(1);
    expect(track.samples[70]).toBe(0);
  });

  it('signal can filter and drive the source', () => {
    const track = createTrack(2000, 44100);
    const square = () => (time) => (Math.floor(time * 2000) % 2 ? 1 : -1);
    signal(track, { source: square, length: 0.04, filter: 'lowpass', cutoff: 200, drive: 3 });
    expect(peak(track.samples)).toBeLessThan(0.6);
  });
});

describe('sources', () => {
  it('fmSource with no modulation is a plain sine at the carrier', () => {
    Math.random = () => 0;
    const source = fmSource({ carrier: 1000, ratio: 1.4, index: 0 })(8000);
    const samples = Array.from({ length: 4 }, (_, i) => source(i / 8000));
    expect(samples.map((value) => Number(value.toFixed(6)))).toEqual([0.707107, 1, 0.707107, 0]);
  });

  it('ringModSource stays inside -1..1 and averages out to nothing', () => {
    const source = ringModSource({ carrier: 620, modulator: 233 })(44100);
    const samples = Array.from({ length: 44100 }, (_, i) => source(i / 44100));
    const mean = samples.reduce((sum, value) => sum + value, 0) / samples.length;
    expect(peak(samples)).toBeLessThanOrEqual(1);
    expect(Math.abs(mean)).toBeLessThan(0.01);
  });

  it('sawStackSource plays two saws per frequency, scaled so the stack stays near full scale', () => {
    Math.random = () => 0;
    const source = sawStackSource({ frequencies: [55, 77.8], detune: 0.01 })(44100);
    const samples = Array.from({ length: 44100 }, (_, i) => source(i / 44100));
    expect(peak(samples)).toBeGreaterThan(1.5);
    expect(peak(samples)).toBeLessThanOrEqual(2);
  });
});
