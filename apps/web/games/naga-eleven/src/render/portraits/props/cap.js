import { stamp } from '../grid.js';

// the brim's shadow falls across the brow, two rows of shaded skin under it
const CAP = [
  '..............QQ..............',
  '..........PPPPQRQQQQ..........',
  '.......PPPPPPQQRQQQQRRR.......',
  '.....PPPPPPQQQQRQQQQQRRRR.....',
  '....PPPPPQQQQQQRQQQQQQRRRR....',
  '...PPPPQQQQQQQMMQQQQQQQRRRR...',
  '...PPPQQQQQQQMMNNQQQQQQQRRR...',
  '...PPQQQQQQQQQKKQQQQQQQQRRR...',
  '...QQQQQQQQQQQQQQQQQQQQQRRR...',
  '.RRRRRRRRRRRRRRRRRRRRRRRRRRRR.',
  'PPPPPPPPPPPPPPPPPPPPPPPQQQQQQQ',
  'RRRRRRRRRRRRRRRRRRRRRRRRRRRRRR',
  '.OOOOOOOOOOOOOOOOOOOOOOOOOOOO.',
  '....3333333333333333333333....',
];

export function cap() {
  return (grid) => stamp(grid, CAP, { x: 17, y: 3 });
}
