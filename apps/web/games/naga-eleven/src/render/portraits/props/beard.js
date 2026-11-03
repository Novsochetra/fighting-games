import { setCell } from '../grid.js';
import { CROWN_Y, HEAD_SHAPES } from '../head-shapes.js';

function beardLetter({ x, y, chin }) {
  if (y === chin) {
    return 'k';
  }

  if (x < 30 && (x + y) % 3 === 0) {
    return 'h';
  }

  return x < 32 ? 'g' : 'k';
}

function inBeard({ x, y, left, right, mouthY }) {
  const nearEdge = x <= left + 2 || x >= right - 2;
  const aroundMouth = y >= mouthY - 2 && Math.abs(x - 31.5) <= 6;
  const onMouth = y >= mouthY && y <= mouthY + 1 && Math.abs(x - 31.5) <= 3;

  return (nearEdge || aroundMouth || y >= mouthY + 3) && !onMouth;
}

export function beard({ shape, fromY, mouthY }) {
  const chin = CROWN_Y + HEAD_SHAPES[shape].length - 1;

  return (grid) => {
    for (let y = fromY; y <= chin; y += 1) {
      const half = HEAD_SHAPES[shape][y - CROWN_Y];

      for (let x = 32 - half; x <= 31 + half; x += 1) {
        if (inBeard({ x, y, left: 32 - half, right: 31 + half, mouthY })) {
          setCell(grid, x, y, beardLetter({ x, y, chin }));
        }
      }
    }
  };
}
