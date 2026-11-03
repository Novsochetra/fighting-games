import { describe, expect, it } from 'vitest';
import { cellAt, createGrid, fillBox, setCell } from '../../../../src/render/portraits/grid.js';
import { castHairShadow, outlineShape } from '../../../../src/render/portraits/outline.js';

describe('the outline and the hair shadow', () => {
  it('rings a shape with outline on its four sides, leaving the corners open', () => {
    const grid = createGrid();

    fillBox(grid, { x: 10, y: 10, width: 2, height: 2, letter: 'B' });
    outlineShape(grid);

    expect(cellAt(grid, 9, 10)).toBe('O');
    expect(cellAt(grid, 12, 11)).toBe('O');
    expect(cellAt(grid, 10, 9)).toBe('O');
    expect(cellAt(grid, 9, 9)).toBeNull();
    expect(cellAt(grid, 10, 10)).toBe('B');
  });

  it('shades the lit skin just under a lock of hair', () => {
    const grid = createGrid();

    setCell(grid, 5, 5, 'h');
    setCell(grid, 5, 6, '2');
    setCell(grid, 6, 6, '2');
    castHairShadow(grid);

    expect(cellAt(grid, 5, 6)).toBe('3');
    expect(cellAt(grid, 6, 6)).toBe('2');
  });
});
