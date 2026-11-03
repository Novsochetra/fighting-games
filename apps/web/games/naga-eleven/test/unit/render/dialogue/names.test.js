import { describe, expect, it } from 'vitest';
import { speakerName } from '../../../../src/render/dialogue/names.js';

describe('the name on the plate', () => {
  it('is the one the line gives, in the language shown', () => {
    const line = { speaker: 'villager', name: { en: 'Fisherman', km: 'អ្នកនេសាទ' } };

    expect(speakerName(line, { lang: 'en' })).toBe('Fisherman');
    expect(speakerName(line, { lang: 'km' })).toBe('អ្នកនេសាទ');
  });

  it('is the cast’s own name, kept by id or in a list', () => {
    const byId = { 'ta-sok': { name: { en: 'Grandpa Sok', km: 'តាសុខ' } } };
    const list = [{ id: 'ta-sok', name: { en: 'Grandpa Sok', km: 'តាសុខ' } }];

    expect(speakerName({ speaker: 'ta-sok' }, { lang: 'km', characters: byId })).toBe('តាសុខ');
    expect(speakerName({ speaker: 'ta-sok' }, { characters: list })).toBe('Grandpa Sok');
  });

  it('is the cast’s name by default', () => {
    expect(speakerName({ speaker: 'coach-vannak' }, { lang: 'km' })).toBe('លោកគ្រូវណ្ណៈ');
    expect(speakerName({ speaker: 'sochetra' })).toBe('Sochetra');
  });

  it('is the id written out when the cast does not list the speaker', () => {
    expect(speakerName({ speaker: 'old-fisherman' })).toBe('Old Fisherman');
    expect(speakerName({ speaker: 'dara' }, { characters: { rithy: { name: 'Rithy' } } })).toBe(
      'Dara',
    );
  });
});
