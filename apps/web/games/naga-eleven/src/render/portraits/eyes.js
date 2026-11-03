import { stamp, mirrorX } from './grid.js';
import { EYE_SETS } from './eye-sets.js';
import {
  addShine,
  dropShine,
  happyArc,
  lowerLid,
  mirrorEye,
  wideOpen,
  squeezedShut,
} from './eye-moods.js';

const flat = (width, drop) => new Array(width).fill(drop);

const towardOuter = (width) =>
  Array.from({ length: width }, (_, column) => (column < width / 2 ? 2 : 1));

const towardInner = (width) =>
  Array.from({ length: width }, (_, column) => (column < width / 3 ? 1 : 2));

const MOOD_EYES = {
  neutral: (rows) => ({ rows }),
  happy: (rows) => ({ rows: happyArc(rows[0].length), dy: 1 }),
  determined: (rows) => ({ rows: addShine(lowerLid(rows, flat(rows[0].length, 1))) }),
  shocked: (rows) => ({ rows: wideOpen(rows), dy: -1 }),
  sad: (rows) => ({ rows: lowerLid(rows, towardOuter(rows[0].length)) }),
  angry: (rows) => ({ rows: dropShine(lowerLid(rows, towardInner(rows[0].length))) }),
  smirk: (rows) => ({ rows: lowerLid(rows, flat(rows[0].length, 2)) }),
  cry: (rows) => ({ rows: squeezedShut(rows[0].length), dy: 1 }),
};

export function eyeRows(set, mood) {
  const open = EYE_SETS[set];
  const { rows, dy = 0 } = (MOOD_EYES[mood] ?? MOOD_EYES.neutral)(open);

  return { rows, dy };
}

export function eyeBox({ set, y, gap }) {
  const width = EYE_SETS[set][0].length;
  const left = 32 - gap - width;

  return { left, right: left + width - 1, top: y, bottom: y + EYE_SETS[set].length - 1 };
}

export function paintEyes(grid, { set, mood, y, gap }) {
  const { rows, dy } = eyeRows(set, mood);
  const { left, right } = eyeBox({ set, y, gap });

  stamp(grid, rows, { x: left, y: y + dy });
  stamp(grid, mirrorEye(rows), { x: mirrorX(right), y: y + dy });
}
