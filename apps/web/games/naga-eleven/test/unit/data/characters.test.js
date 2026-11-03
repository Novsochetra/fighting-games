import { describe, expect, it } from 'vitest';
import { CHARACTERS, CHARACTER_IDS } from '../../../src/data/characters.js';
import { AGES, CAST, KHMER } from './story/readme-ids.js';

const cast = Object.values(CHARACTERS);

describe('the cast', () => {
  it('is the README cast, each kept under their own id', () => {
    expect(CHARACTER_IDS).toEqual(CAST);

    for (const [id, character] of Object.entries(CHARACTERS)) {
      expect(character.id).toBe(id);
    }
  });

  it('is named in English and in Khmer, Sochetra as សុចិត្រា', () => {
    for (const character of cast) {
      expect(character.name.en).toBeTruthy();
      expect(character.name.km).toMatch(KHMER);
    }

    expect(CHARACTERS.sochetra.name).toEqual({ en: 'Sochetra', km: 'សុចិត្រា' });
  });

  it('grows up with Sochetra: he, Dara and Rithy are drawn at all four ages', () => {
    for (const id of ['sochetra', 'dara', 'rithy']) {
      expect(CHARACTERS[id].ages).toEqual(AGES);
    }
  });

  it('draws everyone else at README ages, and the narrator not at all', () => {
    for (const character of cast) {
      expect(character.ages.every((age) => AGES.includes(age))).toBe(true);
    }

    expect(CHARACTERS.narrator.ages).toEqual([]);
  });

  it('gives each rival a nation, Rithy the only Cambodian among them', () => {
    const rivals = cast.filter((character) => character.role === 'rival');

    expect(rivals.map((character) => character.nation)).toEqual([
      'cambodia',
      'japan',
      'korea',
      'iran',
      'brazil',
      'germany',
    ]);
  });
});
