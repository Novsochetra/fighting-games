import { describe, expect, it } from 'vitest';
import { finish, normalize } from '../../../src/audio/synth/finish.js';
import { createTrack } from '../../../src/audio/synth/track.js';

function noisyTrack(length) {
  const track = createTrack(length, 44100);
  for (let i = 0; i < length; i++) {
    track.samples[i] = Math.sin(i * 0.37) * 0.3 + Math.sin(i * 0.05) * 0.2;
  }
  return track;
}

const peak = (samples) => samples.reduce((loudest, value) => Math.max(loudest, Math.abs(value)), 0);

describe('normalize', () => {
  it('scales the loudest sample to 1 and leaves silence alone', () => {
    const samples = new Float32Array([0.25, -0.5, 0.1]);
    normalize(samples);
    expect(Array.from(samples)).toEqual([0.5, -1, 0.20000000298023224]);
    const silent = new Float32Array(3);
    normalize(silent);
    expect(Array.from(silent)).toEqual([0, 0, 0]);
  });
});

describe('finish', () => {
  it('ends normalized, with the tail faded to silence', () => {
    const track = noisyTrack(2000);
    finish(track, { drive: 1.5 });
    expect(peak(track.samples)).toBeCloseTo(1, 6);
    expect(Math.abs(track.samples[1999])).toBe(0);
  });

  it('holds and quantizes samples when crushed', () => {
    const track = noisyTrack(2000);
    finish(track, { drive: 1.5, crush: { rate: 11025, bits: 4 }, lowpass: 7500 });
    for (let i = 0; i < 1000; i += 4) {
      expect(track.samples[i + 1]).toBe(track.samples[i]);
      expect(track.samples[i + 3]).toBe(track.samples[i]);
    }
    const levels = new Set(Array.from(track.samples.slice(0, 1000)));
    expect(levels.size).toBeLessThanOrEqual(17);
  });

  it('works without a shape', () => {
    const track = noisyTrack(500);
    finish(track);
    expect(peak(track.samples)).toBeCloseTo(1, 6);
  });
});
