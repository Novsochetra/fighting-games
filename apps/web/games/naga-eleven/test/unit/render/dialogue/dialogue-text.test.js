import { describe, expect, it } from 'vitest';
import {
  firstVisibleRow,
  layoutLine,
  revealRows,
} from '../../../../src/render/dialogue/dialogue-text.js';
import { textStyleOf } from '../../../../src/render/dialogue/layout.js';
import { createPixelCanvas } from '../../../support/pixel-canvas.js';
import { LONG_ENGLISH } from '../../../support/story-fixtures.js';

const context = createPixelCanvas(8, 8).getContext('2d');

describe('the words of a line', () => {
  it('show each wrapped row as far as it has been typed', () => {
    const text = 'One day, it will be you.';
    const rows = ['One day,', 'it will be', 'you.'];

    expect(revealRows(rows, text, 0)).toEqual(['', '', '']);
    expect(revealRows(rows, text, 5)).toEqual(['One d', '', '']);
    expect(revealRows(rows, text, 13)).toEqual(['One day,', 'it w', '']);
    expect(revealRows(rows, text, text.length)).toEqual(rows);
  });

  it('roll up a row at a time once more are typed than fit', () => {
    expect(firstVisibleRow(['a', 'b', ''], 2)).toBe(0);
    expect(firstVisibleRow(['a', 'b', 'c'], 2)).toBe(1);
    expect(firstVisibleRow(['a', 'b', 'c', 'd', ''], 2)).toBe(2);
  });

  it('are wrapped whole before they are typed, so a word never jumps a row', () => {
    const area = { x: 0, y: 0, width: 300, height: 200 };
    const early = layoutLine(
      context,
      { text: LONG_ENGLISH, shown: LONG_ENGLISH.slice(0, 20) },
      area,
    );
    const late = layoutLine(context, { text: LONG_ENGLISH, shown: LONG_ENGLISH }, area);

    expect(early.rows).toEqual(late.rows.slice(0, early.rows.length));
    expect(early.shown[0]).toBe(LONG_ENGLISH.slice(0, 20));
  });

  it('keep the last rows typed in view when the line runs past the box', () => {
    const area = { x: 0, y: 0, width: 200, height: 42 };
    const { rows, shown } = layoutLine(context, { text: LONG_ENGLISH, shown: LONG_ENGLISH }, area);

    expect(rows).toHaveLength(2);
    expect(shown.at(-1)).toBe(rows.at(-1));
    expect(LONG_ENGLISH.endsWith(rows.at(-1))).toBe(true);
  });

  it('are set larger in Khmer than in English', () => {
    expect(textStyleOf('ចៅនឹងដាស់វា').size).toBeGreaterThan(textStyleOf('Go').size);
    expect(textStyleOf('Go')).toEqual({ size: 16, lineHeight: 21 });
  });
});
