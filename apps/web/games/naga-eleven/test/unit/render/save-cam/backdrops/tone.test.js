import { describe, expect, it } from 'vitest';

import { toneOf } from '../../../../../src/render/save-cam/backdrops/tone.js';

const RAMP = ['a', 'b', 'c', 'd'];

const shadesOver = (tone) => {
  const found = new Set();

  for (let row = 0; row < 8; row += 1) {
    for (let column = 0; column < 8; column += 1) {
      found.add(toneOf(RAMP, tone, column, row));
    }
  }

  return found;
};

describe('a tone of a backdrop’s ramp', () => {
  it('keeps to one shade near a step of the ramp, so no chequer shows at six to a pixel', () => {
    expect([...shadesOver(2)]).toEqual(['c']);
    expect([...shadesOver(1.2)]).toEqual(['b']);
    expect([...shadesOver(0.8)]).toEqual(['b']);
  });

  it('dithers two shades into each other only about halfway between them', () => {
    expect([...shadesOver(2.5)].sort()).toEqual(['c', 'd']);
  });

  it('stays on the ramp for a tone off either end', () => {
    expect([...shadesOver(-3)]).toEqual(['a']);
    expect([...shadesOver(9)]).toEqual(['d']);
  });
});
