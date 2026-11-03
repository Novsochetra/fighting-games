import { cellAt, setCell } from '../grid.js';
import { CROWN_Y, HEAD_SHAPES } from '../head-shapes.js';

const LIT = new Set(['1', '2']);

// a day's growth: a light grain over the lip, on the chin and along the jaw, sparser up the
// cheeks, so it shades the face without turning into a beard
function grown({ x, y, half, mouthY }) {
  const fromEdge = Math.min(x - (32 - half), 31 + half - x);
  const nearMiddle = Math.abs(x - 31.5) <= 5;
  const overLip = nearMiddle && (y === mouthY - 2 || y === mouthY - 1);
  const onChin = y >= mouthY + 3 && fromEdge >= 2;
  const onJaw = y >= mouthY - 3 && fromEdge <= 2 && y % 2 === 0;

  return (overLip || onChin || onJaw) && (x + y) % 2 === 0;
}

export function stubble({ shape, mouthY }) {
  const chin = CROWN_Y + HEAD_SHAPES[shape].length - 1;

  return (grid) => {
    for (let y = mouthY - 6; y <= chin; y += 1) {
      const half = HEAD_SHAPES[shape][y - CROWN_Y];

      for (let x = 32 - half; x <= 31 + half; x += 1) {
        if (LIT.has(cellAt(grid, x, y)) && grown({ x, y, half, mouthY })) {
          setCell(grid, x, y, x < 32 ? '3' : '4');
        }
      }
    }
  };
}
