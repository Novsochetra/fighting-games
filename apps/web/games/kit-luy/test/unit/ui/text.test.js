import { describe, expect, it } from 'vitest';
import { sumSize, sumText } from '../../../src/ui/sum-text.js';
import { createText } from '../../../src/ui/text.js';

const english = createText({ lang: 'en', numerals: 'latin' });
const khmer = createText({ lang: 'km', numerals: 'khmer' });

describe('the game’s text', () => {
  it('speaks the language and writes the numerals of the settings', () => {
    expect(english.t('menu.play')).toBe('Play');
    expect(khmer.t('menu.play')).toBe('លេង');
    expect(english.money(12500)).toBe('12,500៛');
    expect(khmer.money(12500)).toBe('១២,៥០០៛');
  });

  it('follows the settings as they change', () => {
    const settings = { lang: 'en', numerals: 'latin' };
    const text = createText(settings);

    settings.lang = 'km';
    settings.numerals = 'khmer';

    expect(text.t('menu.paused')).toBe('ផ្អាក');
    expect(text.number(25)).toBe('២៥');
  });

  it('fills the blanks of a sentence', () => {
    expect(english.t('hud.level', { level: 3 })).toBe('Level 3');
    expect(khmer.t('over.toNext', { amount: '៨,០០០៛', rank: 'អ្នកលក់នំ' })).toBe(
      '៨,០០០៛ ទៀត ដល់ អ្នកលក់នំ',
    );
  });

  it('gives a word it does not know back as its key', () => {
    expect(english.t('no.such.word')).toBe('no.such.word');
  });
});

describe('a sum as written', () => {
  it('writes money on both sides of adding and taking away', () => {
    const sub = { op: 'sub', left: 5000, right: 3200 };

    expect(sumText({ op: 'add', left: 1500, right: 500 }, english)).toBe('1,500៛ + 500៛');
    expect(sumText(sub, khmer)).toBe('៥,០០០៛ − ៣,២០០៛');
  });

  it('writes how many times as a plain number', () => {
    expect(sumText({ op: 'mul', left: 1200, right: 3 }, english)).toBe('1,200៛ × 3');
    expect(sumText({ op: 'div', left: 6000, right: 12 }, khmer)).toBe('៦,០០០៛ ÷ ១២');
  });

  it('sets a longer sum smaller, so it stays on one line of the note', () => {
    expect(sumSize('500៛ + 300៛')).toBe('short');
    expect(sumSize('1,500៛ + 500៛')).toBe('short');
    expect(sumSize('12,500៛ + 3,700៛')).toBe('medium');
    expect(sumSize('100,000៛ − 99,900៛')).toBe('long');
  });
});
