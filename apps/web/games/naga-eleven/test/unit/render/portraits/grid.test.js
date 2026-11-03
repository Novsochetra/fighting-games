import { describe, expect, it } from 'vitest';
import {
  cellAt,
  createGrid,
  fillRow,
  mirrorX,
  overlay,
  stamp,
  stampBothSides,
} from '../../../../src/render/portraits/grid.js';

describe('the portrait grid', () => {
  it('stamps a pixel map, skipping dots and clearing on x', () => {
    const grid = createGrid();

    fillRow(grid, { y: 1, from: 0, to: 3, letter: 'B' });
    stamp(grid, ['O.', 'xH'], { x: 1, y: 0 });

    expect(cellAt(grid, 1, 0)).toBe('O');
    expect(cellAt(grid, 2, 0)).toBeNull();
    expect(cellAt(grid, 1, 1)).toBeNull();
    expect(cellAt(grid, 2, 1)).toBe('H');
    expect(cellAt(grid, 3, 1)).toBe('B');
  });

  it('mirrors a map onto the far side of the face', () => {
    const grid = createGrid();

    stampBothSides(grid, ['AB'], { x: 10, y: 5 });

    expect(cellAt(grid, 10, 5)).toBe('A');
    expect(cellAt(grid, 11, 5)).toBe('B');
    expect(cellAt(grid, mirrorX(10), 5)).toBe('A');
    expect(cellAt(grid, mirrorX(11), 5)).toBe('B');
  });

  it('lays one grid over another, shifted down, and ignores what falls off the edge', () => {
    const under = createGrid();
    const over = createGrid();

    stamp(over, ['Q'], { x: 4, y: 2 });
    stamp(over, ['Q'], { x: 4, y: 63 });
    overlay(under, over, { dy: 3 });

    expect(cellAt(under, 4, 5)).toBe('Q');
    expect(under.cells.filter(Boolean)).toHaveLength(1);
  });
});
