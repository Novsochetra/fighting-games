import { describe, expect, it } from 'vitest';
import { clampIndex, countGridColumns, moveSelection } from '../../../src/home/navigation.js';

describe('countGridColumns', () => {
  it.each([
    ['216px 216px 216px 216px', 4],
    ['343px', 1],
    ['[full-start] 300px [mid] 300px [full-end]', 2],
    ['repeat(3, minmax(0, 1fr))', 3],
    ['none', 1],
    ['', 1],
    [undefined, 1],
  ])('reads %j as %i columns', (trackList, expected) => {
    expect(countGridColumns(trackList)).toBe(expected);
  });
});

describe('clampIndex', () => {
  it('keeps an index inside the list', () => {
    expect(clampIndex(-3, 4)).toBe(0);
    expect(clampIndex(2, 4)).toBe(2);
    expect(clampIndex(9, 4)).toBe(3);
  });
});

describe('moveSelection', () => {
  const move = (index, direction, { count = 6, columns = 3 } = {}) =>
    moveSelection({ index, count, columns, direction });

  it('moves left and right one step', () => {
    expect(move(1, 'right')).toBe(2);
    expect(move(2, 'left')).toBe(1);
  });

  it('wraps left and right around the whole shelf', () => {
    expect(move(5, 'right')).toBe(0);
    expect(move(0, 'left')).toBe(5);
  });

  it('moves up and down by one row', () => {
    expect(move(1, 'down')).toBe(4);
    expect(move(4, 'up')).toBe(1);
  });

  it('stays put when there is no row above or below', () => {
    expect(move(1, 'up')).toBe(1);
    expect(move(4, 'down')).toBe(4);
  });

  it('drops to the last game when the row below is shorter', () => {
    expect(move(2, 'down', { count: 5, columns: 3 })).toBe(4);
    expect(move(3, 'down', { count: 5, columns: 3 })).toBe(3);
  });

  it('treats a single column as a vertical list', () => {
    expect(move(0, 'down', { count: 3, columns: 1 })).toBe(1);
    expect(move(2, 'down', { count: 3, columns: 1 })).toBe(2);
    expect(move(0, 'up', { count: 3, columns: 1 })).toBe(0);
  });

  it('keeps the only game selected whatever the direction', () => {
    for (const direction of ['up', 'down', 'left', 'right']) {
      expect(move(0, direction, { count: 1, columns: 4 })).toBe(0);
    }
  });

  it('survives a broken column count and an out of range index', () => {
    expect(move(0, 'down', { count: 3, columns: 0 })).toBe(1);
    expect(move(0, 'down', { count: 3, columns: Number.NaN })).toBe(1);
    expect(move(10, 'left', { count: 3, columns: 1 })).toBe(1);
  });

  it('ignores unknown directions', () => {
    expect(move(2, 'sideways')).toBe(2);
  });

  it('returns -1 when there is nothing to select', () => {
    expect(move(0, 'right', { count: 0 })).toBe(-1);
  });
});
