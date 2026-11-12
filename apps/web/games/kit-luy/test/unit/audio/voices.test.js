import { describe, expect, it } from 'vitest';
import { voicesFor } from '../../../src/audio/strikes.js';
import { HAPTICS } from '../../../src/data/haptics.js';
import { INSTRUMENTS, MASTER_GAIN, SOUNDS } from '../../../src/data/sounds.js';

const LOUDEST = 0.25;
const LONGEST = 1.5;
const WAVES = ['sine', 'square', 'sawtooth', 'noise'];
const FULL_CLOTH = [50000, 20000, 10000, 5000, 2000, 1000, 500, 500, 100, 100, 100, 100];
const AS_PLAYED = [
  ['deal', { value: 100 }],
  ['take', { value: 50000 }],
  ['paid', { pieces: FULL_CLOTH }],
  ['arrive', { kind: 'students' }],
  ['count', { value: 20000 }],
  ...Object.keys(SOUNDS).map((name) => [name, {}]),
];

const lengthOf = (voice) => voice.attack + (voice.hold ?? 0) + voice.decay;
const everyVoice = Object.entries(INSTRUMENTS).flatMap(([instrument, voices]) =>
  voices.map((voice, i) => [`${instrument} ${i + 1}`, voice]),
);

describe('the voices in the data', () => {
  it.each(everyVoice)(
    '%s is an oscillator or a burst of noise with a gain envelope',
    (_, voice) => {
      expect(WAVES).toContain(voice.wave);
      expect(voice.gain).toBeGreaterThan(0);
      expect(voice.attack).toBeGreaterThan(0);
      expect(voice.decay).toBeGreaterThan(0);
      expect(voice.wave === 'noise' || voice.freq > 0 || voice.ratio > 0).toBe(true);
    },
  );

  it.each(everyVoice)('%s is no louder than 0.25 and no longer than 1.5 s', (_, voice) => {
    expect(voice.gain).toBeLessThanOrEqual(LOUDEST);
    expect(lengthOf(voice)).toBeLessThanOrEqual(LONGEST);
  });

  it.each(AS_PLAYED)(
    '%s, as it is played, keeps every voice that quiet and short',
    (name, detail) => {
      const voices = voicesFor(name, detail);

      expect(voices.length).toBeGreaterThan(0);

      for (const voice of voices) {
        expect(voice.gain).toBeGreaterThan(0);
        expect(voice.gain).toBeLessThanOrEqual(LOUDEST);
        expect(voice.at + lengthOf(voice)).toBeLessThanOrEqual(LONGEST);
      }
    },
  );

  it('plays only instruments there are', () => {
    const asked = Object.values(SOUNDS).flatMap((strikes) => strikes.map((strike) => strike.play));

    expect(asked.filter((instrument) => !INSTRUMENTS[instrument])).toEqual([]);
  });

  it('leaves the master just under full', () => {
    expect(MASTER_GAIN).toBeCloseTo(0.9, 1);
    expect(MASTER_GAIN).toBeLessThan(1);
  });
});

describe('a sound made of strikes', () => {
  it('gives each voice the pitch of its strike, times its own ratio', () => {
    const [bar, second, mallet] = voicesFor('count', { value: 50000 });

    expect(bar).toMatchObject({ wave: 'sine', freq: 196, at: 0, hold: 0 });
    expect(second.freq).toBe(4 * 196);
    expect(mallet.wave).toBe('noise');
    expect(mallet.freq).toBeUndefined();
  });

  it('plays a soft strike at a share of the instrument’s gain', () => {
    const [soft] = voicesFor('left');
    const [full] = voicesFor('count', { value: 1000 });

    expect(soft.gain).toBeCloseTo(full.gain / 2, 6);
  });

  it('leaves the data as it was', () => {
    const before = JSON.stringify({ INSTRUMENTS, SOUNDS });

    voicesFor('paid', { pieces: [1000, 500] });
    voicesFor('clear');

    expect(JSON.stringify({ INSTRUMENTS, SOUNDS })).toBe(before);
  });

  it('has no voice for a name it does not know', () => {
    expect(voicesFor('hasOwnProperty', {})).toEqual([]);
    expect(voicesFor('fanfare')).toEqual([]);
  });
});

describe('the buzzes', () => {
  it('are short pulses for a piece, a payment, a wrong give and the closing', () => {
    expect(HAPTICS).toEqual({ deal: [8], paid: [12], wrong: [12, 30, 12], closed: [160] });
  });
});
