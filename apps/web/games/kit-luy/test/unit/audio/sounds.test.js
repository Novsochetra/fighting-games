import { describe, expect, it } from 'vitest';
import { oscillators, played } from './open-audio.js';

const VALUES = [100, 500, 1000, 2000, 5000, 10000, 20000, 50000];
const KINDS = ['shopper', 'driver', 'cook', 'students'];
const BELL = [1760, 2470, 3730];
const LOWEST_BAR = 196;
const BAR_GAP = 0.055;

const barOf = (value) => LOWEST_BAR * 2 ** ((7 - VALUES.indexOf(value)) / 7);
const isBar = (voice) => voice.frequency >= LOWEST_BAR - 1 && voice.frequency <= 2 * LOWEST_BAR + 1;
const barsOf = (started) => oscillators(started).filter(isBar);
const bellOf = (started) => oscillators(started).filter((voice) => voice.frequency >= BELL[0] - 1);
const pitches = (voices) => voices.map((voice) => voice.frequency);
const times = (voices) => voices.map((voice) => voice.at);
const noises = (started) => started.filter((voice) => voice.kind === 'noise');

function expectClose(actual, wanted) {
  expect(actual).toHaveLength(wanted.length);
  actual.forEach((value, i) => expect(value).toBeCloseTo(wanted[i], 3));
}

const tickOf = (name, value) => pitches(oscillators(played(name, { value })))[0];

describe('a piece laid on the cloth', () => {
  it('is 35 ms of paper between 2.5 and 5 kHz over one wooden tick', () => {
    const started = played('deal', { value: 1000 });
    const [paper] = noises(started);

    expect(started).toHaveLength(2);
    expect(oscillators(started)).toHaveLength(1);
    expect(paper.filter.type).toBe('bandpass');
    expect(paper.filter.frequency).toBeGreaterThan(2500);
    expect(paper.filter.frequency).toBeLessThan(5000);
  });

  it('ticks lower the bigger the piece, on eight pitches for the eight values', () => {
    const ticks = VALUES.map((value) => tickOf('deal', value));

    expect(new Set(ticks).size).toBe(8);
    expect(ticks).toEqual([...ticks].sort((high, low) => low - high));
  });

  it('is duller when taken back: everything under a 600 Hz low-pass', () => {
    const started = played('take', { value: 1000 });

    expect(started).toHaveLength(2);
    expect(tickOf('take', 1000)).toBe(tickOf('deal', 1000));
    expect(started.map((voice) => voice.filter)).toEqual([
      { type: 'lowpass', frequency: 600, q: 1 },
      { type: 'lowpass', frequency: 600, q: 1 },
    ]);
  });

  it('is cleared in three paper flicks, each lower than the last', () => {
    const started = played('clear');
    const centres = started.map((voice) => voice.filter.frequency);

    expect(noises(started)).toHaveLength(3);
    expect(centres).toEqual([...centres].sort((high, low) => low - high));
    expect(new Set(centres).size).toBe(3);
    expect(times(started)).toEqual([...times(started)].sort((early, late) => early - late));
  });
});

describe('the wooden bars', () => {
  it('stand on seven equal steps to the octave, 50,000 lowest at 196 Hz', () => {
    const descending = [...VALUES].reverse();
    const bars = descending.map((value) => pitches(barsOf(played('count', { value })))[0]);

    expectClose(
      bars,
      descending.map((_value, steps) => LOWEST_BAR * 2 ** (steps / 7)),
    );
  });

  it('ring the bar for 100 an octave above the bar for 50,000', () => {
    const [high] = pitches(barsOf(played('count', { value: 100 })));
    const [low] = pitches(barsOf(played('count', { value: 50000 })));

    expect(low).toBeCloseTo(LOWEST_BAR, 6);
    expect(high / low).toBeCloseTo(2, 6);
  });

  it('are a sine, a quieter sine at four times its pitch and a mallet click', () => {
    const started = played('count', { value: 5000 });
    const [bar, second] = pitches(oscillators(started));

    expect(started).toHaveLength(3);
    expect(second / bar).toBeCloseTo(4, 6);
    expect(noises(started)[0].filter.type).toBe('highpass');
  });

  it('ring an amount that is no piece as the biggest piece within it', () => {
    const [bar] = pitches(barsOf(played('count', { value: 3500 })));

    expect(bar).toBeCloseTo(barOf(2000), 6);
  });
});

describe('a customer paid', () => {
  it('counts the pieces back, one bar each in the order given, 55 ms apart, then the bell', () => {
    const pieces = [5000, 2000, 500, 500];
    const started = played('paid', { pieces });

    expectClose(pitches(barsOf(started)), pieces.map(barOf));
    expectClose(
      times(barsOf(started)),
      pieces.map((_piece, i) => i * BAR_GAP),
    );
    expectClose(pitches(bellOf(started)), BELL);
    expectClose(times(bellOf(started)), [4 * BAR_GAP, 4 * BAR_GAP, 4 * BAR_GAP]);
  });

  it('rises as the pieces get smaller', () => {
    const bars = pitches(barsOf(played('paid', { pieces: [10000, 5000, 1000, 100] })));

    expect(bars).toEqual([...bars].sort((low, high) => low - high));
  });

  it('counts back no more than 8 bars, however full the cloth', () => {
    const started = played('paid', { pieces: Array(12).fill(500) });

    expect(barsOf(started)).toHaveLength(8);
    expectClose(times(bellOf(started)), [8 * BAR_GAP, 8 * BAR_GAP, 8 * BAR_GAP]);
  });

  it('strikes two bars a fifth apart, then the bell, for the fifth in a row', () => {
    const started = played('extra');
    const [low, high] = pitches(barsOf(started));

    expect(times(barsOf(started))).toEqual([0, 0]);
    expect(high / low).toBeGreaterThan(1.48);
    expect(high / low).toBeLessThan(1.51);
    expectClose(pitches(bellOf(started)), BELL);
    expect(times(bellOf(started))[0]).toBeGreaterThan(0);
  });

  it('rings the bell three times, rising, for a new best', () => {
    const bells = bellOf(played('best'));
    const strikes = [0, 3, 6].map((first) => bells[first]);

    expect(bells).toHaveLength(9);
    expect(pitches(strikes)).toEqual([...pitches(strikes)].sort((low, high) => low - high));
    expect(new Set(times(strikes)).size).toBe(3);
    expect(strikes[0].frequency).toBe(BELL[0]);
  });
});

describe('the customers', () => {
  it.each(KINDS)('a %s calls through a tinny megaphone, 110 ms then 160 ms', (kind) => {
    const started = played('arrive', { kind });

    expect(started).toHaveLength(2);
    expectClose(times(started), [0, 0.11]);
    expect(started.map((voice) => voice.filter)).toEqual([
      { type: 'bandpass', frequency: 1400, q: 6 },
      { type: 'bandpass', frequency: 1400, q: 6 },
    ]);
  });

  it('each kind arrives on its own pair of pitches', () => {
    const pairs = KINDS.map((kind) => pitches(played('arrive', { kind })));

    expect(new Set(pairs.map(String)).size).toBe(4);
    expect(new Set(pairs.flat()).size).toBe(8);
  });

  it('one going next door is three bars coming down', () => {
    const bars = barsOf(played('left'));

    expect(bars).toHaveLength(3);
    expect(pitches(bars)).toEqual([...pitches(bars)].sort((high, low) => low - high));
    expect(new Set(times(bars)).size).toBe(3);
  });
});

describe('the stall', () => {
  it('knocks twice on wood, 120 ms apart, for a wrong give', () => {
    const started = played('wrong');

    expect(pitches(oscillators(started))).toEqual([180, 180]);
    expectClose(times(oscillators(started)), [0, 0.12]);
    expect(noises(started)).toHaveLength(2);
  });

  it('stamps through a 400 Hz low-pass with a click on top', () => {
    const filters = played('stamp').map((voice) => voice.filter);

    expect(filters.map((filter) => filter.type)).toEqual(['lowpass', 'highpass']);
    expect(filters[0].frequency).toBe(400);
  });

  it('twangs from 300 Hz when new bundles arrive', () => {
    expect(pitches(played('stage'))).toEqual([300]);
  });

  it('shuts in low bursts that slow to a stop, then one low bar', () => {
    const started = played('closed');
    const bursts = times(noises(started).filter((voice) => voice.filter.type === 'lowpass'));
    const gaps = bursts.slice(1).map((at, i) => at - bursts[i]);
    const [bar] = barsOf(started);

    expect(bursts.length).toBeGreaterThan(5);
    expect(gaps).toEqual([...gaps].sort((short, long) => short - long));
    expect(Math.max(...bursts)).toBeGreaterThan(0.9);
    expect(bar.frequency).toBeCloseTo(LOWEST_BAR, 6);
    expect(bar.at).toBeGreaterThan(Math.max(...bursts));
  });

  it('ticks once for a button', () => {
    expect(played('tap')).toHaveLength(1);
    expect(played('tap')[0].kind).toBe('oscillator');
  });
});
