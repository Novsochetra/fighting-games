import { stamp } from '../grid.js';

// a farmer's hat is wide enough to shade the whole face under its brim
const STRAW_HAT = [
  '.....................PPPQQQ.....................',
  '...................PPPPQQQQQQ...................',
  '..................PPPPQQQQQQQQ..................',
  '.................PPPPQQQQQQQQRRRR...............',
  '................PPPPQQQQQQQQQRRRR...............',
  '................PPPQQQQQQQQQQRRRR...............',
  '...............PPPQQQQQQQQQQQRRRR...............',
  '...............QQQQQQQQQQQQQQRRRR...............',
  '..............GGGGGGGGGGGGGGGGGGGG..............',
  '......QQQQQQQQFFFFFFFFFFFFFFFFFFFFQQQQQQQQ......',
  '..PPPPPPPPPPPPPPPQQQQQQQQQQQQQQQQQQQRRRRRRRRRR..',
  'PPPPPPPPPPPPPQQQQQQQQQQQQQQQQQQQQQQQQQRRRRRRRRRR',
  'RRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR',
  '..OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO..',
  '............333333333333333333333333............',
  '.............3333333333333333333333.............',
];

export function strawHat() {
  return (grid) => stamp(grid, STRAW_HAT, { x: 8, y: 2 });
}
