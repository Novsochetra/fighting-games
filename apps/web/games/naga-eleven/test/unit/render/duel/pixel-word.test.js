import { describe, expect, it } from 'vitest';

import { fitLines, nameLines } from '../../../../src/render/duel/name-lines.js';
import { wordWidth } from '../../../../src/render/duel/pixel-word.js';

describe('the big pixel words', () => {
  it('measures five pixels a letter and one between them', () => {
    expect(wordWidth('GOAL', 1)).toBe(4 * 6 - 1);
    expect(wordWidth('GOAL', 3)).toBe((4 * 6 - 1) * 3);
  });

  it('breaks a long name where its two lines come out most even', () => {
    expect(nameLines('Seven-Headed Naga')).toEqual(['SEVEN-HEADED', 'NAGA']);
    expect(nameLines('Preah Khan Strike')).toEqual(['PREAH KHAN', 'STRIKE']);
    expect(nameLines('Naga')).toEqual(['NAGA']);
  });

  it('keeps a short name on one line, as big as the room allows', () => {
    expect(fitLines('Naga Shot', 156)).toEqual({ lines: ['NAGA SHOT'], size: 3 });
    expect(fitLines('Seven-Headed Naga', 156).lines).toHaveLength(2);
  });
});
