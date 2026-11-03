import { stampBothSides } from '../grid.js';

const STUD = ['MN', 'NK'];

export function earrings({ x, y }) {
  return (grid) => stampBothSides(grid, STUD, { x, y });
}
