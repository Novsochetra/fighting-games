import { stamp, stampBothSides } from './grid.js';

const BLUSH = ['.r.r.r', 'r.r.r.'];

const SWEAT = ['..O..', '.OsO.', 'OssqO', 'OsqqO', 'OqquO', '.OOO.'];

const VEIN = ['.vv.vv.', 'vv...vv', 'v.....v', '.......', 'v.....v', 'vv...vv', '.vv.vv.'];

const STREAM = ['sq', 'sq', 'sq', '.sq', '.sq', '.sq', '.sq', '.sq', '..q', '..u'];

const WELL = ['sq', '.u'];

export function paintTouches(grid, { mood, eyes, face }) {
  const cheekY = eyes.bottom + 2;

  if (mood === 'happy' || mood === 'cry') {
    stampBothSides(grid, BLUSH, { x: face.left + 2, y: cheekY });
  }

  if (mood === 'shocked') {
    stamp(grid, SWEAT, { x: face.right - 3, y: eyes.top - 9 });
  }

  if (mood === 'angry') {
    stamp(grid, VEIN, { x: face.left + 1, y: eyes.top - 12 });
  }

  if (mood === 'cry') {
    stampBothSides(grid, STREAM, { x: eyes.left + 1, y: eyes.bottom });
  }

  if (mood === 'sad') {
    stamp(grid, WELL, { x: eyes.left + 1, y: eyes.bottom });
  }
}
