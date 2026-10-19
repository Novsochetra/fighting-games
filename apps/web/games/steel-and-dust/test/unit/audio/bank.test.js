import { afterEach, describe, expect, it } from 'vitest';
import { createBank } from '../../../src/audio/bank/bank.js';
import { SOUND_TAKES, synthesizeTake } from '../../../src/audio/index.js';
import { randomBetween } from '../../../src/lib/math.js';
import { seededRandom } from '../../support/seeded-random.js';
import { createFakeAudioContext } from './fake-audio-context.js';

const originalRandom = Math.random;
const stillClock = () => ({ now: () => 0, later: () => {} });

afterEach(() => {
  Math.random = originalRandom;
});

describe('createBank', () => {
  it('builds every take of a sound once, as mono buffers at the context rate', () => {
    const context = createFakeAudioContext();
    const bank = createBank(context, stillClock());
    const takes = bank.get('jump');
    expect(takes).toHaveLength(SOUND_TAKES.jump);
    expect(takes[0]).toMatchObject({ numberOfChannels: 1, length: 5733, sampleRate: 44100 });
    expect(bank.get('jump')).toBe(takes);
    expect(bank.builtCount()).toBe(1);
    expect(bank.get('nope')).toBeNull();
  });

  it('fills each buffer with synthesizeTake at a random pitch near 1', () => {
    Math.random = seededRandom(21);
    const takes = createBank(createFakeAudioContext(), stillClock()).get('warp');
    Math.random = seededRandom(21);
    const pitch = randomBetween(0.94, 1.06);
    const expected = synthesizeTake('warp', { pitch, take: 0, sampleRate: 44100 });
    expect(Array.from(takes[0].getChannelData(0))).toEqual(Array.from(expected));
  });

  it('warms up in slices of about 8 ms, coming back 30 ms later', () => {
    let time = 0;
    const scheduled = [];
    const clock = {
      now: () => (time += 10),
      later: (callback, milliseconds) => scheduled.push({ callback, milliseconds }),
    };
    const bank = createBank(createFakeAudioContext(), clock);
    bank.warm();
    expect(bank.builtCount()).toBe(1);
    expect(scheduled).toEqual([{ callback: bank.warm, milliseconds: 30 }]);
    scheduled[0].callback();
    expect(bank.builtCount()).toBe(2);
  });

  it('builds the whole bank when a slice never runs out of time', () => {
    const bank = createBank(createFakeAudioContext(), stillClock());
    bank.warm();
    expect(bank.builtCount()).toBe(Object.keys(SOUND_TAKES).length);
  });
});
