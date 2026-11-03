import { setCell, mirrorX } from '../grid.js';

function bothSides(grid, cells, letter) {
  cells.forEach(([x, y]) => {
    setCell(grid, x, y, letter);
    setCell(grid, mirrorX(x), y, letter);
  });
}

const forehead = ({ foreheadY }) => [
  ...[26, 27, 28, 29].map((x) => [x, foreheadY]),
  ...[25, 26, 27, 28, 29, 30].map((x) => [x, foreheadY + 2]),
];

const crowsFeet = ({ eyeY, eyeLeft }) => [
  [eyeLeft - 1, eyeY],
  [eyeLeft - 2, eyeY + 1],
  [eyeLeft - 1, eyeY + 2],
];

const smileLines = ({ noseY, mouthY }) => [
  [28, noseY + 2],
  [27, noseY + 3],
  [27, mouthY - 1],
  [26, mouthY],
  [26, mouthY + 1],
];

const underEyes = ({ eyeY, eyeLeft, eyeHeight }) =>
  [2, 3, 4, 5].map((step) => [eyeLeft + step, eyeY + eyeHeight + 1]);

const LINES = { forehead, crowsFeet, smileLines, underEyes };

// lines of shade, not outline, so the years show without scarring the face
export function wrinkles(kinds, where) {
  return (grid) =>
    kinds.forEach((kind) => bothSides(grid, LINES[kind](where), kind === 'smileLines' ? '4' : '3'));
}
