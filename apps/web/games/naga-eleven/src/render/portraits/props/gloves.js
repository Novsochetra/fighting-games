import { stampBothSides } from '../grid.js';

const GLOVE = [
  '.OO.OO.OO.OO....',
  'OPPOPPOPPOPPO...',
  'OPQOPQOPQOPQO...',
  'OPQOPQOPQOPQO...',
  'OPQOPQOPQOPQO...',
  'OPQQPQQPQQPQO.OO',
  'OPQRRRRRRRRQOOPO',
  'OPQRQRQRQRRQOPQO',
  'OPQRRRRRRRRQQPQO',
  'OPQRQRQRQRRQQQRO',
  'OPQQQQQQQQQQQRO.',
  'OPQQQQQQQQQQRO..',
  'OEFFFFFFFFFGO...',
  'OFFFFFFFFFFGO...',
  'OTTTTTTTTTTUO...',
  'OBBBBBBBBBBCO...',
  'OBBBBBBBBBBCO...',
  'OBBBBBBBBBBCO...',
];

export function gloves({ y = 46 } = {}) {
  return (grid) => stampBothSides(grid, GLOVE, { x: 2, y });
}
