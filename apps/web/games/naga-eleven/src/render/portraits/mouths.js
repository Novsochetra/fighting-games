import { stamp } from './grid.js';

export const MOUTHS = {
  calm: ['.3444.', '..11..'],
  smile: ['4....4', '.4444.', '..11..'],
  grin: ['OOOOOOOO', '4OttttO4', '.OmnnmO.', '..OOOO..'],
  beam: ['OOOOOOOOOO', '4OttttttO4', '.OmmnnmmO.', '..OOOOOO..'],
  laugh: ['.OOOOOOOO.', 'OttttttttO', 'OmmmmmmmmO', '.OmmnnmmO.', '..OOOOOO..'],
  firm: ['.444444.', '4......4'],
  clench: ['.OOOOOO.', 'OtOttOtO', '.OOOOOO.'],
  gasp: ['.OOOO.', 'OmmmmO', 'OmnnmO', '.OOOO.'],
  frown: ['.4444.', '4....4'],
  shout: ['.OOOOOO.', 'OttttttO', 'OmmmmmmO', 'OmmnnmmO', '4OOOOOO4'],
  smirk: ['.....44.', '.4444..3', '..11....'],
  sneer: ['.....OO4', '.44OttO.', '...OOO..'],
  sob: ['..OOOO..', '.OmmmmO.', 'OmmnnmmO', 'OOOOOOOO'],
  stern: ['44444444', '.3....3.'],
  tight: ['.4444.'],
};

export const MOOD_MOUTHS = {
  neutral: 'calm',
  happy: 'grin',
  determined: 'clench',
  shocked: 'gasp',
  sad: 'frown',
  angry: 'shout',
  smirk: 'smirk',
  cry: 'sob',
};

export function mouthFor(mood, overrides = {}) {
  return overrides[mood] ?? MOOD_MOUTHS[mood] ?? MOOD_MOUTHS.neutral;
}

export function paintMouth(grid, { name, y }) {
  const rows = MOUTHS[name];
  const width = Math.max(...rows.map((row) => row.length));

  stamp(grid, rows, { x: 32 - Math.floor(width / 2), y });
}
