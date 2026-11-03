import { describe, expect, it } from 'vitest';
import { cellOf, decodePart } from '../../../../../src/render/portraits/kit/decode.js';

describe('a baked kit part', () => {
  it('reads its size and the point that sits on the top of the skull', () => {
    const part = decodePart('3 2 1.5 0|O3/.hO');

    expect(part).toMatchObject({ width: 3, height: 2, anchor: { x: 1.5, y: 0 } });
  });

  it('repeats a letter by its count and leaves a dot empty', () => {
    const part = decodePart('4 2 0 0|O2h/.k2');

    expect(part.cells).toEqual(['O', 'O', 'h', null, null, 'k', 'k', null]);
  });

  it('reads the skin back as the portraits’ digits, which it stores as a to d', () => {
    const part = decodePart('4 1 0 0|abcd');

    expect(part.cells).toEqual(['1', '2', '3', '4']);
  });

  it('reads a skin letter followed by a count as a run of it', () => {
    expect(decodePart('5 1 0 0|b5').cells).toEqual(['2', '2', '2', '2', '2']);
  });

  it('has nothing outside its own box', () => {
    const part = decodePart('2 2 0 0|O2/O2');

    expect(cellOf(part, 1, 1)).toBe('O');
    expect(cellOf(part, 2, 0)).toBeNull();
    expect(cellOf(part, -1, 0)).toBeNull();
  });
});
