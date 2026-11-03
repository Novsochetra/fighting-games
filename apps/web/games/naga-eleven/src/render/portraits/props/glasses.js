import { fillRow, mirrorX, setCell, stampBothSides } from '../grid.js';

const FRAME = [
  '.QQQQQQQQ.',
  'Q........Q',
  'Q........Q',
  'Q........Q',
  'Q........Q',
  'Q........Q',
  '.QQQQQQQQ.',
];

const GLARE = ['..........', '.ewwe.....', '.wewwe....', '..wewwe...', '...wewwe..', '....wewwe.'];

// a strict teacher's lenses flash white when he means it
const GLARING = new Set(['angry', 'determined']);

export function glasses({ y, left }) {
  return (grid, mood) => {
    stampBothSides(grid, FRAME, { x: left, y });
    fillRow(grid, { y: y + 2, from: left + 10, to: mirrorX(left + 10), letter: 'Q' });
    setCell(grid, left - 1, y + 2, 'Q');
    setCell(grid, mirrorX(left - 1), y + 2, 'R');

    if (GLARING.has(mood)) {
      stampBothSides(grid, GLARE, { x: left, y });
    }
  };
}
