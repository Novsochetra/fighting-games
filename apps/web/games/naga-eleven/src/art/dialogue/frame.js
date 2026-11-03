// The dialogue box's frame, in the letters of ART_KEYS. A band is read from the outer edge in,
// lit from the top left like a gold rod: light along its top, dark along its bottom.

const ROD = ['o', '4', '3', '3', '2', '1', 'o'];
const ROD_BELOW = ['o', '1', '2', '3', '3', '4', 'o'];

// the four-petal flower of Khmer carving, in gold round a ruby, on each corner
export const CORNER = [
  '......ooo......',
  '.....o544o.....',
  '....o53334o....',
  '....o43322o....',
  '..oo2333321oo..',
  '.o54323131344o.',
  'o533331p133334o',
  'o43331pnm13322o',
  'o432331m133221o',
  '.o42213131221o.',
  '..oo1333321oo..',
  '....o43322o....',
  '....o43221o....',
  '.....o421o.....',
  '......ooo......',
];

// the same flower, smaller, for the slim box shown over a match
export const SMALL_CORNER = [
  '....ooo....',
  '...o544o...',
  '..o53334o..',
  '.o5231314o.',
  'o5331p1334o',
  'o431pnm122o',
  'o4331m1321o',
  '.o4131311o.',
  '..o43221o..',
  '...o421o...',
  '....ooo....',
];

// a lotus bud between two flames of kbach, rising from the middle of the top edge
export const CREST = [
  '....................o....................',
  '...................o5o...................',
  '..................o534o..................',
  '..................o432o..................',
  '....ooo..........o53324o..........ooo....',
  '...o544o.........o43322o.........o544o...',
  '...o41o.........o5333324o.........o42o...',
  '..o52o.....oo...o4333322o...oo.....o44o..',
  '..o42o....o54o..o4333322o..o54o....o42o..',
  '..o42o....o42o.o533333324o.o41o....o42o..',
  '..o434o....o44oo4333p3322oo52o....o531o..',
  'oo.o42ooo..o434o4333n3322o531o..ooo42o.oo',
  '54oo43444oooo434333nmm333432oooo54422oo54',
  '42442233344442232222l22223224444333224421',
  'oo4222222222222222222222222222222222221oo',
];

export const FULL_FRAME = {
  id: 'full',
  top: [...ROD, 'a'],
  left: [...ROD, 'a'],
  bottom: [...ROD_BELOW, 'd'],
  right: [...ROD_BELOW, 'c'],
  fill: ['v', 'w', 'x', 'y', 'z'],
  corner: CORNER,
  crest: CREST,
};

export const SLIM_FRAME = {
  id: 'slim',
  top: ['o', '4', '3', '2', 'o', 'a'],
  left: ['o', '4', '3', '2', 'o', 'a'],
  bottom: ['o', '1', '2', '3', 'o', 'd'],
  right: ['o', '1', '2', '3', 'o', 'c'],
  fill: ['v', 'w', 'x', 'y'],
  corner: SMALL_CORNER,
  crest: null,
};

export const WINDOW = { band: ['o', '3'], back: 'a' };
