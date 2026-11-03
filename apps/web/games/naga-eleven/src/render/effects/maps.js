// The little pictures the pitch's effects draw, facing right and lit from the top left, as codes:
// o the look's deepest shade, d m l h its body ramp from dark to light, y g G its accent from deep
// to light, e E the eye, r the mouth, w the fangs; paletteOf (move-plan.js) colours them

// the Naga's head, its jaws open on the ball, its snout curling up, the flames of its crest swept
// back over it
export const NAGA_HEAD = {
  anchor: { x: 22, y: 9 },
  rows: [
    '.......y...y............',
    '......ygy.yGy...y.......',
    '....yyGGgyGGgy.yGy......',
    '...yGGggggGgggyGgy...oo.',
    '..oyggooooooooooog..ohho',
    '.odooommmmmmmlllloooohlo',
    'odmmmmmmmmmmlllllllllhlo',
    'odmmmmmEEmmmmllllllllllo',
    'odmmmmEEeEmmmmmmmmmmmoo.',
    'odmmmmmeemmmmmooooooo...',
    '.odmmmmmmmmoorrrrrrr....',
    '.oddmmmmmmorwrwrrwrw....',
    '..oddmmmmmmooooooooooo..',
    '...odddmmmmmmmlllhhhlo..',
    '....ooddddddmmmmmmmoo...',
    '......oooooooooooooo....',
  ],
};

// one of the seven heads of the hood
export const SMALL_HEAD = {
  anchor: { x: 9, y: 3 },
  rows: ['..yGy.yGy.', '.oooooooo.', 'odmmmlllho', 'odEemmmmoo', '.odmorwrw.', '..oooooo..'],
};

// Garuda's wing raised, level and beaten down, its root at the anchor, on the ball
export const WING_FRAMES = [
  {
    anchor: { x: 20, y: 18 },
    rows: [
      '.....oooo..............',
      '...o.ohhho.............',
      '..ooooohhho............',
      '.ohhhoomlhho...........',
      '..ohlhoomlhho..........',
      '...omlhomllhho.........',
      '.oooomloomllhoo........',
      '.ohhommlommllho........',
      'oohhhommlomllhho.......',
      '..omllommlomllhho......',
      '..oomllommoomllhhoo....',
      '..ohommloomoomllhmmo...',
      '..ohhoommoomommlmmmmo..',
      '..oomloommoomoddmmmmoo.',
      '....ommloommoddddmmmmo.',
      '....ooommmoododdddmmmmo',
      '....ohhooommoooddddmmm.',
      '.....oommmooooooddgdm..',
      '.......ooommmooodddgG..',
      '..........oooooooddy...',
      '...............ooodd...',
      '...............ooooo...',
    ],
  },
  {
    anchor: { x: 24, y: 9 },
    rows: [
      '...oooooo................',
      '..ohhhhhhooo.............',
      '..oohlllhhhhooo..........',
      '.oooommllllhhhooo..oo....',
      'ohhhloommllllhhhhommmooo.',
      'ooohmlloommmllllhhmmmmmoo',
      '..ooommmlooommmllmmmmmmmm',
      '..ohhooommmooommmdddmmmmm',
      '..oohmmlooooomooodddddgm.',
      '....ooommmmmoooodddddddgG',
      '.....ohooooooooooooddddy.',
      '.....oooommmmmmoooooooddd',
      '........oooooooomoooooooo',
      '.........oooooooo...ooo..',
    ],
  },
  {
    anchor: { x: 22, y: 4 },
    rows: [
      '...................oo....',
      '................ooomm....',
      '..............oommmmmm...',
      '.............oommmmmgm...',
      '..........ooohhmmmmmdgG..',
      '......oooohhhhhmmddddydd.',
      '....oohhhhhlllldddddddddo',
      '..oohhhhlllllmmmdddddooo.',
      'oohhhllllmmmmoooddoooooo.',
      'ohhlllmmmmooommoooooooo..',
      'ohhmmooooommmoomooooo....',
      'oooohlllmmooomoomomo.....',
      'oohlllmmooommoomomo......',
      'ohhhmooolmmoommomo.......',
    ],
  },
];

// a khleng kite: its paper on a bamboo cross, painted in two halves, a bow at its foot
export const KITE = {
  anchor: { x: 6, y: 16 },
  rows: [
    '......o......',
    '.....oho.....',
    '....ohlGo....',
    '...ohllgGo...',
    '..ohlllgggo..',
    '.ohllllggggo.',
    'oooooooyoooooo',
    '.odmmmmyggyo.',
    '..odmmmygyo..',
    '...odmmyyo...',
    '....odmyo....',
    '.....odo.....',
    '......o......',
    '.....gyg.....',
    '....gy.yg....',
    '......g......',
    '......g......',
  ],
};
