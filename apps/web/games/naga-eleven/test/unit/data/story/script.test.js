import { describe, expect, it } from 'vitest';
import { FINAL, groupMatch } from '../../../../src/data/story/rounds.js';
import { narrate, say, scene, villager } from '../../../../src/data/story/script.js';

const TEXT = { en: 'Hello.', km: 'សួស្ដី។' };

describe('the story script helpers', () => {
  it('write a scene and its lines in the README shape', () => {
    expect(scene('black', 'calm', [say('dara', 'happy', 'right', TEXT)])).toEqual({
      backdrop: 'black',
      mood: 'calm',
      lines: [{ speaker: 'dara', mood: 'happy', side: 'right', text: TEXT }],
    });
  });

  it('give narration to the narrator', () => {
    expect(narrate(TEXT)).toMatchObject({ speaker: 'narrator', text: TEXT });
  });

  it('let a villager carry a name and an age, on the right by default', () => {
    const line = villager({ name: { en: 'Bopha', km: 'បុប្ផា' }, age: 'child' }, TEXT);

    expect(line).toMatchObject({ speaker: 'villager', side: 'right', age: 'child', text: TEXT });
    expect(line.name.en).toBe('Bopha');
  });
});

describe('the rounds', () => {
  it('number group matches in both scripts', () => {
    expect(groupMatch(2)).toEqual({ en: 'Group, match 2', km: 'វគ្គចែកពូល ប្រកួតទី២' });
    expect(FINAL.km).toBe('វគ្គផ្ដាច់ព្រ័ត្រ');
  });
});
