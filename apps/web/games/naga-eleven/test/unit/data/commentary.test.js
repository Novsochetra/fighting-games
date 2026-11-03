import { describe, expect, it } from 'vitest';
import { COMMENTARY } from '../../../src/data/commentary.js';
import { KHMER } from './story/readme-ids.js';

const EVENTS = [
  'goal',
  'goalAgainst',
  'save',
  'special',
  'skill',
  'combo',
  'finisher',
  'duo',
  'chain',
  'duelWon',
  'duelLost',
  'halfTime',
  'fullTime',
  'kickoff',
];

const WHISTLES = ['kickoff', 'halfTime', 'fullTime'];

const placeholders = (text) => text.match(/\{[a-z]+\}/g) ?? [];

describe('the commentary', () => {
  it('has three to five lines for each event', () => {
    expect(Object.keys(COMMENTARY).sort()).toEqual([...EVENTS].sort());

    for (const event of EVENTS) {
      expect(COMMENTARY[event].length, event).toBeGreaterThanOrEqual(3);
      expect(COMMENTARY[event].length, event).toBeLessThanOrEqual(5);
    }
  });

  it('says every line in English and in Khmer, with the same placeholders', () => {
    for (const line of Object.values(COMMENTARY).flat()) {
      expect(line.en).toBeTruthy();
      expect(line.km).toMatch(KHMER);
      expect(placeholders(line.km)).toEqual(placeholders(line.en));
      expect(placeholders(line.en).every((name) => name === '{name}')).toBe(true);
    }
  });

  it('names nobody at a whistle, and the player in every line about one player', () => {
    for (const event of WHISTLES) {
      expect(COMMENTARY[event].every((line) => !line.en.includes('{name}'))).toBe(true);
    }

    for (const event of ['goal', 'save', 'skill', 'chain', 'duelWon', 'duelLost']) {
      expect(
        COMMENTARY[event].every((line) => line.en.includes('{name}')),
        event,
      ).toBe(true);
    }
  });

  it('keeps each line short enough for a banner', () => {
    for (const line of Object.values(COMMENTARY).flat()) {
      expect(line.en.length).toBeLessThanOrEqual(60);
    }
  });
});
