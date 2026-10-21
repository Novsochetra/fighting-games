import { describe, expect, it } from 'vitest';
import { nineSlicePieces } from '../../../src/render/nine-slice.js';

const IMAGE = { width: 44, height: 40 };
const SLICE = [12, 14, 12, 14];
const RECT = { x: 10, y: 4, width: 132, height: 62 };

const pieces = nineSlicePieces(IMAGE, SLICE, RECT, 2);
const topRow = pieces.filter(({ source }) => source[1] === 0);

describe('a nine-slice frame', () => {
  it('draws its four corners whole at the corners of the rect, in view units', () => {
    const corners = pieces.filter(({ source }) => source[2] === 14 && source[3] === 12);
    expect(corners.map(({ destination }) => destination)).toEqual([
      [10, 4, 7, 6],
      [135, 4, 7, 6],
      [10, 60, 7, 6],
      [135, 60, 7, 6],
    ]);
  });

  it('repeats the middle of an edge instead of stretching it, cutting the last tile short', () => {
    const tiles = topRow.slice(1, -1);
    expect(tiles.every(({ source }) => source[0] === 14)).toBe(true);
    expect(tiles.map(({ source }) => source[2])).toEqual([...Array(14).fill(16), 12]);
    expect(tiles.every(({ source, destination }) => destination[2] === source[2] / 2)).toBe(true);
  });

  it('closes the edge with no gap or overlap between the tiles', () => {
    topRow.slice(1).forEach(({ destination }, i) => {
      const before = topRow[i].destination;
      expect(destination[0]).toBe(before[0] + before[2]);
    });
  });

  it('leaves the middle of the image out', () => {
    const middle = pieces.filter(({ source }) => source[0] === 14 && source[1] === 12);
    expect(middle).toEqual([]);
  });
});
