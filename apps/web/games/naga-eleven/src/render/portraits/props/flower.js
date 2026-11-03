import { stamp } from '../grid.js';

const FLOWER = ['..P..', '.PPPQ', 'PPFPQ', '.PQQR', '..R..'];

// a romduol, Cambodia's own flower, pinned above the ear
export function flower({ x, y }) {
  return (grid) => stamp(grid, FLOWER, { x, y });
}
