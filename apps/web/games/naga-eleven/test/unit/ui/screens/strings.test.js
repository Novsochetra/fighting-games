import { describe, expect, it } from 'vitest';
import { numberIn, say, sayWith, STRINGS, textIn } from '../../../../src/ui/screens/strings.js';

describe('the screens’ words', () => {
  it('says a string in the language asked', () => {
    expect(say('settings', 'en')).toBe('Settings');
    expect(say('settings', 'km')).toBe('ការកំណត់');
  });

  it('shows the key of a string it does not have, so the gap is plain to see', () => {
    expect(say('noSuchString', 'en')).toBe('noSuchString');
  });

  it('fills a string’s blanks, numbers in the language’s own digits', () => {
    expect(sayWith('continueNote', 'en', { chapter: 2, level: 14 })).toBe('Chapter 2 · Lv 14');
    expect(sayWith('continueNote', 'km', { chapter: 2, level: 14 })).toBe('ជំពូកទី២ · កម្រិត ១៤');
  });

  it('fills a blank with a text in the language asked', () => {
    const venue = { en: 'National Stadium', km: 'ពហុកីឡដ្ឋានជាតិ' };

    expect(sayWith('atVenue', 'km', { venue })).toBe('នៅពហុកីឡដ្ឋានជាតិ');
    expect(sayWith('atVenue', 'en', {})).toBe('at ');
  });

  it('writes Khmer digits only for Khmer, and leaves the signs as they are', () => {
    expect(numberIn('+12', 'km')).toBe('+១២');
    expect(numberIn(-3, 'km')).toBe('-៣');
    expect(numberIn(30, 'en')).toBe('30');
  });

  it('resolves a game text, falling back to English', () => {
    expect(textIn({ en: 'Final', km: 'វគ្គផ្ដាច់ព្រ័ត្រ' }, 'km')).toBe('វគ្គផ្ដាច់ព្រ័ត្រ');
    expect(textIn({ en: 'Final' }, 'km')).toBe('Final');
    expect(textIn('Rithy', 'km')).toBe('Rithy');
  });

  it('keeps the same blanks in both languages of every string', () => {
    const blanks = (text) => [...text.matchAll(/\{(\w+)\}/g)].map((match) => match[1]).sort();

    for (const text of Object.values(STRINGS)) {
      expect(blanks(text.km)).toEqual(blanks(text.en));
    }
  });
});
