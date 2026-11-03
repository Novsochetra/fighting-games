import { stamp } from '../grid.js';

const HEADBAND = [
  'PPPPPPPPPPPPPPPPPPPPPPPPPQQQQQQQQQ',
  'TTTTTTTTTTTTTTTTTTTTTTTTTTUUUUUUUU',
  'RRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR',
];

export function headband() {
  return (grid) => stamp(grid, HEADBAND, { x: 15, y: 13 });
}
