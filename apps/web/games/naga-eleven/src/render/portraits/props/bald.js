import { fillRow } from '../grid.js';

// a bald crown catches the light from the top left in a soft patch
export function baldShine({ y }) {
  return (grid) => {
    fillRow(grid, { y, from: 26, to: 29, letter: '1' });
    fillRow(grid, { y: y + 1, from: 24, to: 30, letter: '1' });
    fillRow(grid, { y: y + 2, from: 24, to: 26, letter: '1' });
  };
}
