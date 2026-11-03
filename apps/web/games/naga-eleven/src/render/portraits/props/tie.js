import { fillRow, stamp } from '../grid.js';

const TIE = ['..EF..', '..FG..', '...F..', '..FFG.', '..FFG.', '.FFFGG', '.FFFGG', '.FFFGG'];

export function tie({ top }) {
  return (grid) => {
    for (let step = 0; step < 9; step += 1) {
      const half = Math.max(1, 4 - Math.floor(step / 2));

      fillRow(grid, {
        y: top + step,
        from: 32 - half,
        to: 31 + half,
        letter: step === 0 ? 'w' : 'e',
      });
      fillRow(grid, { y: top + step, from: 32 - half, to: 31, letter: 'w' });
    }

    stamp(grid, TIE, { x: 29, y: top + 1 });
  };
}
