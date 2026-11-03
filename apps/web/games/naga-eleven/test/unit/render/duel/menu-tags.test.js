import { describe, expect, it } from 'vitest';

import { tagWords } from '../../../../src/render/duel/menu-tags.js';

// every letter 6 canvas pixels wide, two art pixels: a plate is two per letter and two of padding
const context = { font: '', measureText: (text) => ({ width: [...text].length * 6 }) };

const RITHY = { en: 'Rithy', km: 'រិទ្ធី' };
const GUSTAVO = { en: 'Gustavo' };

const wordsOf = (tags, { lang = 'en', name, room }) =>
  tagWords(context, { tags, lang, name, room });

describe("the words on a duel menu row's tags", () => {
  it("name a duo's partner beside DUO, in the menu's language", () => {
    const tags = [{ word: 'duo', partner: RITHY }];

    expect(wordsOf(tags, { name: 'Twin Naga', room: 60 })).toEqual([['DUO + ', 'RITHY']]);
    expect(wordsOf(tags, { lang: 'km', name: 'នាគភ្លោះ', room: 60 })).toEqual([
      ['គូ + ', 'រិទ្ធី'],
    ]);
  });

  it('keep a partner with no Khmer name in a piece of his own, for the pixel face', () => {
    const tags = [{ word: 'duo', partner: GUSTAVO }];

    expect(wordsOf(tags, { lang: 'km', name: 'ទាត់', room: 80 })).toEqual([['គូ + ', 'GUSTAVO']]);
  });

  it('name the partner alone where the row’s name would not fit by DUO and him', () => {
    const tags = [{ word: 'duo', partner: GUSTAVO }];

    expect(wordsOf(tags, { name: 'Carnival Bicycle', room: 50 })).toEqual([['+ GUSTAVO']]);
    expect(wordsOf(tags, { name: 'Carnival Bicycle', room: 70 })).toEqual([['DUO + ', 'GUSTAVO']]);
  });

  it('say DUO for a partner not known, the lift with its sign, and CHAIN', () => {
    const tags = [{ word: 'bonus', value: 8 }, { word: 'duo', partner: null }, { word: 'chain' }];

    expect(wordsOf(tags, { name: 'Naga Shot', room: 80 })).toEqual([['+8'], ['DUO'], ['CHAIN']]);
    expect(wordsOf(tags, { lang: 'km', name: 'ទាត់នាគ', room: 80 })).toEqual([
      ['+៨'],
      ['គូ'],
      ['ច្រវាក់'],
    ]);
  });
});
