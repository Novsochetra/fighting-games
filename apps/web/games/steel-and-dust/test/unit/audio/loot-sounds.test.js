import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { LOOT_CHEST_SOUNDS } from '../../../src/audio/bank/loot-chest.js';
import { LOOT_PIECE_SOUNDS } from '../../../src/audio/bank/loot-pieces.js';
import { synthesizeTake } from '../../../src/audio/bank/synthesize.js';
import { GROUP_CAPS } from '../../../src/audio/bank/voice-pool.js';
import { isBankSound } from '../../../src/audio/bank/definitions.js';
import { seededRandom } from '../../support/seeded-random.js';

const LOOT_SOUNDS = { ...LOOT_PIECE_SOUNDS, ...LOOT_CHEST_SOUNDS };
const SAMPLE_RATE = 22050;

function loudness(samples, from, to) {
  let peak = 0;
  for (let i = from; i < to; i++) {
    peak = Math.max(peak, Math.abs(samples[i]));
  }
  return peak;
}

// the frequency a stretch of samples crosses zero at, rising
function pitchOf(samples, from, to) {
  let crossings = 0;
  for (let i = from + 1; i < to; i++) {
    if (samples[i - 1] < 0 && samples[i] >= 0) {
      crossings++;
    }
  }
  return (crossings * SAMPLE_RATE) / (to - from);
}

// the noise layers draw from Math.random, so each test hears the same takes every run
const originalRandom = Math.random;

describe('the loot sounds', () => {
  beforeEach(() => {
    Math.random = seededRandom(7);
  });

  afterEach(() => {
    Math.random = originalRandom;
  });

  it('are bank sounds of their own group, which has a cap', () => {
    for (const [key, definition] of Object.entries(LOOT_SOUNDS)) {
      expect(isBankSound(key)).toBe(true);
      expect(definition.group).toBe('loot');
    }
    expect(GROUP_CAPS.loot).toBeGreaterThan(0);
  });

  it('never outrank a blow landing when the voices run out', () => {
    for (const definition of Object.values(LOOT_SOUNDS)) {
      expect(definition.priority).toBeLessThanOrEqual(2);
    }
    expect(LOOT_SOUNDS.coin.priority).toBe(0);
  });

  it.each(Object.keys(LOOT_SOUNDS))('%s is loud, clean and dies away to silence', (key) => {
    const definition = LOOT_SOUNDS[key];
    for (let take = 0; take < definition.takes; take++) {
      const samples = synthesizeTake(key, { pitch: 1, take, sampleRate: SAMPLE_RATE });
      expect(samples.length).toBe(Math.ceil(definition.seconds * SAMPLE_RATE));
      expect(samples.every(Number.isFinite)).toBe(true);
      expect(loudness(samples, 0, samples.length)).toBeCloseTo(1, 5);
      expect(loudness(samples, samples.length - 8, samples.length)).toBeLessThan(0.05);
    }
  });

  it('the coin leaps up a fourth from its first note to its second', () => {
    const samples = synthesizeTake('coin', { pitch: 1, take: 0, sampleRate: SAMPLE_RATE });
    const low = pitchOf(samples, 40, Math.round(0.045 * SAMPLE_RATE));
    const high = pitchOf(samples, Math.round(0.07 * SAMPLE_RATE), Math.round(0.2 * SAMPLE_RATE));
    expect(low).toBeGreaterThan(900);
    expect(low).toBeLessThan(1080);
    expect(high / low).toBeCloseTo(4 / 3, 1);
  });

  it('the chest opening rings on well after its creak', () => {
    const samples = synthesizeTake('chestOpen', { pitch: 1, take: 0, sampleRate: SAMPLE_RATE });
    const late = loudness(samples, Math.round(0.6 * SAMPLE_RATE), Math.round(0.7 * SAMPLE_RATE));
    expect(late).toBeGreaterThan(0.08);
  });
});
