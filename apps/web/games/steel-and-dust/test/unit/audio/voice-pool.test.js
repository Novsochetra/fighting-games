import { describe, expect, it } from 'vitest';
import {
  chooseTake,
  GROUP_CAPS,
  isDuplicate,
  lowestPriority,
  MAX_VOICES,
  planRoom,
  pruneFinished,
} from '../../../src/audio/bank/voice-pool.js';

const voiceOf = (fields) => ({
  key: 'blunt',
  group: 'hit',
  priority: 2,
  start: 0,
  end: 1,
  take: 0,
  ...fields,
});

describe('pruneFinished', () => {
  it('drops voices that ended before now', () => {
    const voices = [voiceOf({ end: 0.5 }), voiceOf({ end: 2 }), voiceOf({ end: 0.9 })];
    pruneFinished(voices, 1);
    expect(voices.map((voice) => voice.end)).toEqual([2]);
  });
});

describe('isDuplicate', () => {
  const voices = [voiceOf({ start: 1 })];

  it('merges the same sound started within 35 ms', () => {
    expect(isDuplicate(voices, { key: 'blunt', group: 'hit', start: 1.02 })).toBe(true);
    expect(isDuplicate(voices, { key: 'blunt', group: 'hit', start: 1.04 })).toBe(false);
    expect(isDuplicate(voices, { key: 'blade', group: 'hit', start: 1 })).toBe(false);
  });

  it('never merges shouts', () => {
    const shouts = [voiceOf({ key: 'voiceHurt', group: 'voice', start: 1 })];
    expect(isDuplicate(shouts, { key: 'voiceHurt', group: 'voice', start: 1 })).toBe(false);
  });
});

describe('lowestPriority', () => {
  it('picks the lowest priority, then the oldest', () => {
    const old = voiceOf({ priority: 1, start: 0.1 });
    const newer = voiceOf({ priority: 1, start: 0.2 });
    expect(lowestPriority([voiceOf({ priority: 2 }), newer, old])).toBe(old);
  });
});

describe('planRoom', () => {
  it('plays freely below the caps', () => {
    expect(planRoom([voiceOf({})], { group: 'hit', priority: 2 })).toEqual({
      play: true,
      steal: [],
    });
  });

  it('steals the weakest voice of a full group', () => {
    const swings = [0.3, 0.1, 0.2].map((start) => voiceOf({ group: 'swing', priority: 0, start }));
    expect(GROUP_CAPS.swing).toBe(3);
    expect(planRoom(swings, { group: 'swing', priority: 0 })).toEqual({
      play: true,
      steal: [swings[1]],
    });
  });

  it('refuses when everything in the full group matters more', () => {
    const voices = Array.from({ length: GROUP_CAPS.voice }, () =>
      voiceOf({ group: 'voice', priority: 3 }),
    );
    expect(planRoom(voices, { group: 'voice', priority: 1 })).toEqual({ play: false, steal: [] });
  });

  it('steals from everything once the total cap is reached', () => {
    const groups = ['swing', 'hit', 'movement', 'crash', 'voice'];
    const voices = Array.from({ length: MAX_VOICES }, (_, i) =>
      voiceOf({ group: groups[i % 5], priority: i === 6 ? 0 : 2, start: i }),
    );
    const room = planRoom(voices, { group: 'voice', priority: 2 });
    expect(MAX_VOICES).toBe(14);
    expect(room).toEqual({ play: true, steal: [voices[6]] });
  });
});

describe('chooseTake', () => {
  it('uses the roll when nothing is in the way', () => {
    expect(chooseTake([], { key: 'blunt', count: 4, roll: 0.6 })).toBe(2);
  });

  it('skips the last take and takes still playing', () => {
    const playing = [voiceOf({ take: 3 })];
    expect(chooseTake(playing, { key: 'blunt', count: 4, last: 2, roll: 0.6 })).toBe(0);
  });

  it('gives up after one lap when every take is busy', () => {
    const playing = [0, 1, 2].map((take) => voiceOf({ take }));
    expect(chooseTake(playing, { key: 'blunt', count: 3, last: 0, roll: 0 })).toBe(0);
  });

  it('honours a requested take, wrapped to the take count', () => {
    expect(chooseTake([], { key: 'blunt', count: 4, last: 1, requested: 5, roll: 0.9 })).toBe(1);
  });

  it('always plays the only take of a single-take sound', () => {
    expect(chooseTake([], { key: 'shatter', count: 1, last: 0, roll: 0.5 })).toBe(0);
  });
});
