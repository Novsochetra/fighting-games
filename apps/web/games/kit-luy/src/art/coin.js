// A riel coin face on, a letter a pixel (COIN in palette.js); it spins by losing columns.
export const COIN_FACE = [
  '..ggg..',
  '.gywyg.',
  'gywyryg',
  'gyyryyg',
  'gyryyyg',
  '.gyyyg.',
  '..ggg..',
];

export const COIN_SPIN = [
  [0, 1, 2, 3, 4, 5, 6],
  [0, 1, 3, 5, 6],
  [0, 3, 6],
  [3],
  [0, 3, 6],
  [0, 1, 3, 5, 6],
];
