import { describe, expect, it } from 'vitest';
import { pieceFigures } from '../../../src/ui/piece.js';
import { closingCount } from '../../../src/ui/results-view.js';
import { answerLine, sumParts, sumSize } from '../../../src/ui/sum-text.js';
import { createText } from '../../../src/ui/text.js';

const english = createText({ lang: 'en', numerals: 'latin' });
const khmer = createText({ lang: 'km', numerals: 'khmer' });

describe('the game’s text', () => {
  it('speaks the language and writes the numerals of the settings', () => {
    expect(english.t('play.give')).toBe('Give');
    expect(khmer.t('play.give')).toBe('ឲ្យលុយ');
    expect(english.money(12500)).toBe('12,500៛');
    expect(khmer.money(12500)).toBe('១២,៥០០៛');
    expect(khmer.digits('000')).toBe('០០០');
    expect(english.digits('000')).toBe('000');
  });

  it('follows the settings as they change', () => {
    const settings = { lang: 'en', numerals: 'latin' };
    const text = createText(settings);

    settings.lang = 'km';
    settings.numerals = 'khmer';

    expect(text.t('over.title')).toBe('បិទតូប');
    expect(text.number(25)).toBe('២៥');
  });

  it('fills the blanks of a sentence, and gives an unknown word back as its key', () => {
    expect(english.t('play.shortBy', { amount: '500៛' })).toBe('Short 500៛');
    expect(khmer.t('over.served', { count: '១៧' })).toBe('ភ្ញៀវ ១៧ នាក់');
    expect(english.t('no.such.word')).toBe('no.such.word');
  });
});

describe('a piece’s figures', () => {
  it('sets the thousands apart from their zeros', () => {
    expect(pieceFigures(5000)).toEqual({ lead: '5', zeros: '000' });
    expect(pieceFigures(20000)).toEqual({ lead: '20', zeros: '000' });
  });

  it('writes the hundreds whole', () => {
    expect(pieceFigures(100)).toEqual({ lead: '100', zeros: '' });
    expect(pieceFigures(500)).toEqual({ lead: '500', zeros: '' });
  });
});

describe('a bill’s sum', () => {
  it('is written without the riel sign, money on both sides of adding and change', () => {
    expect(answerLine({ op: 'add', left: 6500, right: 2000 }, english)).toBe('6,500 + 2,000');
    expect(answerLine({ op: 'sub', left: 10000, right: 6500 }, khmer)).toBe('១០,០០០ − ៦,៥០០');
  });

  it('writes how many, and how many share, as plain counts', () => {
    expect(answerLine({ op: 'mul', left: 700, right: 6 }, english)).toBe('700 × 6');
    expect(answerLine({ op: 'div', left: 24000, right: 12 }, khmer)).toBe('២៤,០០០ ÷ ១២');
  });

  it('sets a long sum smaller, so it stays on one line of the pad', () => {
    expect(sumSize(sumParts({ op: 'add', left: 500, right: 500 }, english))).toBe('short');
    expect(sumSize(sumParts({ op: 'sub', left: 50000, right: 12500 }, english))).toBe('long');
  });
});

describe('the takings counted out at closing', () => {
  it('are their fewest pieces, largest first', () => {
    expect(closingCount(8500)).toEqual([5000, 2000, 1000, 500]);
    expect(closingCount(0)).toEqual([]);
  });

  it('stop at a dozen pieces on a day too good to count out', () => {
    const counted = closingCount(987600);

    expect(counted).toHaveLength(12);
    expect(counted.every((value) => value === 50000)).toBe(true);
  });
});
