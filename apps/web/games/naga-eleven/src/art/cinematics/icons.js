import { CINE } from './palette.js';

// pixel maps, one letter a pixel and '.' left clear; a map's colours come with it, or, for a
// team's shirt, from its kit when it is drawn

// O ink, L the shirt lit, S its base, D its shade, T the trim
export const SHIRT = [
  '....OOO..OOO....',
  '..OOLLLTTSSSOO..',
  '.OLLLLLLSSSSSSO.',
  'OLLLLLLSSSSSSSDO',
  'OLLLLLSSSSSSSSDO',
  'OTTOLSSSSSSDOTTO',
  '.OOOLSSSSSSDOOO.',
  '...OLSSSSSSDO...',
  '...OLSSSSSSDO...',
  '...OLSSSSSSDO...',
  '...OLSSSSSSDO...',
  '...OLSSSSSDDO...',
  '...OTTTTTTTTO...',
  '...OOOOOOOOOO...',
];

export const BALL = {
  rows: ['..OOO..', '.OWWWO.', 'OWKWWGO', 'OWWWKGO', 'OKWWWGO', '.OGGGO.', '..OOO..'],
  colours: { O: CINE.ink, W: CINE.white, G: '#aab4c8', K: '#2a3048' },
};

// two arrows, the second dim: the play is running at half its speed
export const SLOW = {
  rows: ['WW...GG...', 'WWWW.GGGG.', 'WWWWWGGGGG', 'WWWW.GGGG.', 'WW...GG...'],
  colours: { W: CINE.text, G: CINE.muted },
};

export const RECORD_DOT = {
  rows: ['.RRR.', 'RLRRR', 'RRRRR', 'RRRRD', '.RDD.'],
  colours: { R: CINE.white, L: CINE.flash, D: CINE.replay[3] },
};

// a corner of a board, a curl of gold in the manner of a kbach flame
export const KBACH_CORNER = {
  rows: [
    'GGGGGGGGG',
    'GLLLLLGG.',
    'GLDDGG...',
    'GLDG.....',
    'GLG..G...',
    'GGG.GL...',
    'GG..GG...',
    'GG.......',
    'G........',
  ],
  colours: { G: CINE.gold[2], L: CINE.gold[3], D: CINE.gold[1] },
};

export const TROPHY = {
  rows: [
    '..OOOOOOOOOO..',
    'OOOLLYYYYYDOOO',
    'OYOLYYYYYYDOYO',
    'OYOLYYYYYYDOYO',
    '.OOLYYYYYYDOO.',
    '...OLYYYYDO...',
    '....OLYYDO....',
    '.....OYDO.....',
    '.....OYDO.....',
    '....OOLDOO....',
    '...OLYYYYDO...',
    '...OOOOOOOO...',
  ],
  colours: { O: CINE.ink, L: CINE.gold[3], Y: CINE.gold[2], D: CINE.gold[1] },
};
