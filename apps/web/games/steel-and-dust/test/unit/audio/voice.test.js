import { afterEach, describe, expect, it } from 'vitest';
import { shout, shoutBuilder } from '../../../src/audio/bank/shout.js';
import { createTrack } from '../../../src/audio/synth/track.js';
import { voice } from '../../../src/audio/synth/voice.js';
import { seededRandom } from '../../support/seeded-random.js';

const originalRandom = Math.random;
const loudest = (samples, from, to) =>
  samples.slice(from, to).reduce((max, value) => Math.max(max, Math.abs(value)), 0);

const UGH = shout({
  length: 0.2,
  pitch: [0, 190, 0.03, 240, 0.2, 150],
  vowels: [0, 'V', 0.2, 'U'],
  envelope: [0, 0, 0.012, 1, 0.2, 0],
  breath: [0, 0.6, 0.2, 0.3],
  rough: 0.2,
  openQuotient: 0.5,
});

function render(params, seed) {
  Math.random = seededRandom(seed);
  const track = createTrack(11025, 44100);
  voice(track, params);
  return track.samples;
}

afterEach(() => {
  Math.random = originalRandom;
});

describe('shout', () => {
  it('turns point lists into curves and keeps numbers as they are', () => {
    expect(UGH.pitch(0)).toBe(190);
    expect(UGH.pitch(0.03)).toBe(240);
    expect(UGH.envelope(0.012)).toBe(1);
    expect(UGH.breath(0.2)).toBe(0.3);
    expect(UGH.rough).toBe(0.2);
    expect(UGH.openQuotient).toBe(0.5);
  });
});

describe('voice', () => {
  it('sings inside its length and is silent after it', () => {
    const samples = render(UGH, 1);
    expect(loudest(samples, 0, 8820)).toBeGreaterThan(0.01);
    expect(loudest(samples, 8820, 11025)).toBe(0);
  });

  it('waits for its start offset', () => {
    const samples = render({ ...UGH, start: 0.05 }, 1);
    expect(loudest(samples, 0, 2205)).toBe(0);
    expect(loudest(samples, 2205, 11025)).toBeGreaterThan(0.01);
  });

  it('is the same voice for the same random seed, and another for another', () => {
    expect(Array.from(render(UGH, 4))).toEqual(Array.from(render(UGH, 4)));
    expect(Array.from(render(UGH, 4))).not.toEqual(Array.from(render(UGH, 5)));
  });
});

describe('shoutBuilder', () => {
  it('picks the shout by take and returns the lo-fi finish', () => {
    Math.random = seededRandom(2);
    const build = shoutBuilder([UGH, { ...UGH, start: 0.1 }], 1.5);
    const track = createTrack(11025, 44100);
    const shape = build(track, 1, 3);
    expect(shape).toEqual({ drive: 1.5, crush: { rate: 18500, bits: 12 }, lowpass: 7500 });
    expect(loudest(track.samples, 0, 4410)).toBe(0);
  });
});
