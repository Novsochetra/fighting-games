const repeat = (half, rows) => new Array(rows).fill(half);

const CROWN = [6, 9, 10, 11, 12, 12];

// half-widths row by row from the crown at y 8; the face's middle falls between columns 31 and 32
export const HEAD_SHAPES = {
  child: [7, 9, 11, 12, 12, 13, ...repeat(13, 18), 12, 12, 11, 11, 10, 9, 8, 7, 5, 3],
  teen: [...CROWN, ...repeat(13, 17), 12, 12, 11, 11, 10, 10, 9, 8, 7, 6, 4, 3],
  young: [...CROWN, ...repeat(13, 17), 12, 12, 11, 11, 10, 10, 9, 8, 7, 6, 5, 4, 3],
  adult: [...CROWN, ...repeat(13, 18), 12, 12, 12, 12, 11, 11, 10, 9, 8, 7, 6, 5, 5],
  square: [...CROWN, ...repeat(13, 19), 12, 12, 12, 12, 12, 11, 11, 10, 9, 8, 7, 7],
  round: [7, 10, 11, 12, 13, 13, ...repeat(14, 17), 13, 13, 12, 12, 11, 10, 9, 8, 6, 4],
  woman: [...CROWN, ...repeat(12, 17), 12, 11, 11, 10, 10, 9, 8, 7, 6, 5, 4, 3],
  elder: [...CROWN, ...repeat(12, 18), 11, 11, 11, 10, 10, 10, 9, 8, 8, 7, 6, 5, 4],
  long: [...CROWN, ...repeat(13, 19), 13, 12, 12, 12, 11, 11, 10, 10, 9, 8, 7, 6, 6],
};

export const CROWN_Y = 8;

export function chinOf(shape) {
  return CROWN_Y + HEAD_SHAPES[shape].length - 1;
}

export function halfWidthAt(shape, y) {
  return HEAD_SHAPES[shape][y - CROWN_Y] ?? 0;
}
