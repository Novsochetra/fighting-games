import { describe, expect, it } from 'vitest';
import { SKILL_WORDS } from '../../../src/data/skill-words.js';
import { KHMER } from './story/readme-ids.js';

describe('the words on skills and combos', () => {
  it('are set in capitals in English, and written in Khmer too', () => {
    for (const [id, word] of Object.entries(SKILL_WORDS)) {
      expect(word.en, id).toMatch(/^[A-Z]+$/);
      expect(word.km, id).toMatch(KHMER);
    }
  });
});
