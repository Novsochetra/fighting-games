import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it } from 'vitest';
import { SOUND_TAKES, synthesizeTake } from '../../../src/audio/index.js';
import { digest } from '../../support/digest.js';
import { seededRandom } from '../../support/seeded-random.js';

const FIXTURE = JSON.parse(
  readFileSync(new URL('../fixtures/sound-bank.json', import.meta.url), 'utf8'),
);
const originalRandom = Math.random;

function fixtureTakes() {
  const takes = [];
  for (const [key, recorded] of Object.entries(FIXTURE)) {
    recorded.forEach((expected, take) =>
      takes.push({ key, take, expected, seed: 1000 + takes.length }),
    );
  }
  return takes;
}

describe('sound bank matches the legacy synthesis sample for sample', () => {
  afterEach(() => {
    Math.random = originalRandom;
  });

  it('has the same sounds, in the same order, with the same number of takes', () => {
    const recorded = Object.fromEntries(
      Object.entries(FIXTURE).map(([key, list]) => [key, list.length]),
    );
    expect(SOUND_TAKES).toEqual(recorded);
    expect(Object.keys(SOUND_TAKES)).toEqual(Object.keys(FIXTURE));
  });

  it.each(fixtureTakes())('$key take $take', ({ key, take, expected, seed }) => {
    Math.random = seededRandom(seed);
    const samples = synthesizeTake(key, { pitch: 1, take, sampleRate: 44100 });
    expect(samples.length).toBe(expected.length);
    expect(digest(Array.from(samples))).toBe(expected.digest);
  });
});
