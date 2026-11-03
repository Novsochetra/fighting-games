import { stamp } from '../grid.js';

const THIN = ['.kkkk..kkkk.', 'k..........k'];

export function moustache({ y }) {
  return (grid) => stamp(grid, THIN, { x: 26, y });
}
