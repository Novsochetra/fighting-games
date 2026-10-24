import { afterEach, describe, expect, it } from 'vitest';
import { SOUND_DEFINITIONS } from '../../../src/audio/bank/definitions.js';
import { synthesizeTake } from '../../../src/audio/bank/synthesize.js';
import { planRoom } from '../../../src/audio/bank/voice-pool.js';
import { TICK_MS } from '../../../src/config.js';
import { RUN_STRIDE_TICKS } from '../../../src/sim/hero-animation.js';
import { seededRandom } from '../../support/seeded-random.js';

const STEP = SOUND_DEFINITIONS.step;
const originalRandom = Math.random;

function playing(key, start) {
  const { group, priority } = SOUND_DEFINITIONS[key];
  return { key, start, group, priority };
}

describe('the footstep', () => {
  afterEach(() => {
    Math.random = originalRandom;
  });

  it('is gone well before the next stride, and plays under the landing', () => {
    expect(STEP.seconds * 1000).toBeLessThan((RUN_STRIDE_TICKS * TICK_MS) / 2);
    expect(STEP.level).toBeLessThan(SOUND_DEFINITIONS.land.level);
    Math.random = seededRandom(4);
    for (let take = 0; take < STEP.takes; take++) {
      const samples = synthesizeTake('step', { pitch: 1, take, sampleRate: 44100 });
      const tail = samples.slice(Math.floor(samples.length * 0.6));
      expect(Math.max(...tail.map(Math.abs))).toBeLessThan(0.01);
    }
  });

  it('never takes a voice from another movement sound', () => {
    const busy = ['jump', 'land', 'dash'].map((key, i) => playing(key, i));
    expect(planRoom(busy, STEP)).toEqual({ play: false, steal: [] });
  });

  it('gives its voice up to any other movement sound, and to the next footstep', () => {
    const voices = [playing('step', 0), playing('step', 1), playing('jump', 2)];
    expect(planRoom(voices, SOUND_DEFINITIONS.land)).toEqual({ play: true, steal: [voices[0]] });
    expect(planRoom(voices, STEP)).toEqual({ play: true, steal: [voices[0]] });
  });
});
