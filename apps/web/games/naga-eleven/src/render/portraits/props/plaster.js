import { stamp } from '../grid.js';

const PLASTER = ['RPPPR', 'RPQPR', '.RRR.'];

// every boy who plays in the paddies comes home with one somewhere
export function plaster({ x, y }) {
  return (grid) => stamp(grid, PLASTER, { x, y });
}
