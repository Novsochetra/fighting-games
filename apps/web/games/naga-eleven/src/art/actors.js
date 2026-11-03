// the people and the ball on the pitch; every ramp runs deep to light
export const SKINS = {
  khmer: ['#4e2c22', '#7e4a32', '#ad6f46', '#d29462'],
  deep: ['#3e2219', '#643a28', '#8c5634', '#b2764a'],
  warm: ['#5e3a2a', '#976044', '#c48a5e', '#e2b07e'],
  fair: ['#80523f', '#b8826a', '#e2b293', '#f6d4b6'],
  dark: ['#24140f', '#3c241a', '#5a3524', '#7c4e34'],
  tan: ['#66402c', '#a06a46', '#cc9466', '#ecbc8e'],
};

export const HAIRS = {
  black: ['#0c0a12', '#1a1622', '#2a2534', '#423a50'],
  brown: ['#1c110c', '#352018', '#543428', '#76503c'],
  chestnut: ['#2a180e', '#4c2c18', '#734424', '#9a6236'],
  blond: ['#6a4620', '#a4762e', '#d6a846', '#f2d27a'],
};

// whom a team's players look like, picked by place in the team so no two neighbours are twins
const ASIA = { skins: ['fair', 'warm', 'fair'], hairs: ['black', 'black', 'brown'] };

export const TEAM_LOOKS = {
  default: { skins: ['khmer', 'deep', 'warm'], hairs: ['black', 'black', 'brown'] },
  japan: ASIA,
  korea: ASIA,
  thailand: { skins: ['warm', 'khmer', 'tan'], hairs: ['black', 'brown', 'black'] },
  iran: { skins: ['tan', 'warm', 'fair'], hairs: ['black', 'brown', 'chestnut'] },
  brazil: { skins: ['khmer', 'dark', 'tan'], hairs: ['black', 'brown', 'chestnut'] },
  nigeria: { skins: ['dark', 'deep', 'dark'], hairs: ['black', 'black', 'brown'] },
  mexico: { skins: ['tan', 'warm', 'khmer'], hairs: ['black', 'brown', 'chestnut'] },
  germany: { skins: ['fair', 'fair', 'tan'], hairs: ['blond', 'chestnut', 'brown'] },
};

export const STAR_LOOKS = {
  sochetra: { skin: 'khmer', hair: 'black' },
  dara: { skin: 'warm', hair: 'black' },
  rithy: { skin: 'warm', hair: 'brown' },
  haruto: { skin: 'fair', hair: 'black' },
  minjun: { skin: 'fair', hair: 'black' },
  farhad: { skin: 'tan', hair: 'black' },
  rafael: { skin: 'khmer', hair: 'brown' },
  lukas: { skin: 'fair', hair: 'blond' },
};

export const BOOTS = ['#0a0a10', '#1a1a24', '#2e2e3c', '#4a4a5c'];

export const OUTLINE = '#120e1a';

// the outline the PixelLab sheets draw in, for the arms a throw-in pose draws on them
export const SHEET_OUTLINE = '#000000';

export const SHADOW = '#0a1a12';

export const BALL_ART = {
  outline: '#1a1c26',
  white: ['#8e98b4', '#c4cbdc', '#eef0f4', '#ffffff'],
  patch: ['#14161e', '#2a2e3e'],
  smear: '#f4f6fa',
};

// the ball pinned to the top edge while a long ball is over the view, drawn at the HUD's scale:
// white, lit from the top left, a black pentagon in the middle and the next ones round its rim
export const BALL_MARKER = {
  rows: [
    '...ooooo...',
    '..oHHLWWo..',
    '.oHHWWWWSo.',
    'oLHWWPWWWPo',
    'oPWWPPPWWPo',
    'oWWWPPPWWSo',
    'oWWWWWWWSSo',
    'oWWPWWWPSSo',
    '.oWPPSSPPo.',
    '..oSSSDDo..',
    '...ooooo...',
  ],
  colours: {
    o: '#1a1c26',
    H: '#ffffff',
    W: '#eef0f4',
    S: '#c4cbdc',
    D: '#8e98b4',
    P: '#14161e',
    L: '#2a2e3e',
  },
};

export const MARKER = {
  fill: ['#a8641a', '#e09a24', '#ffd04a', '#fff2a8'],
  outline: '#2a1606',
  charge: ['#ffd04a', '#ff8a2a', '#ff3e3e'],
  track: '#14101c',
};

// the mate a keeper's pass or a goal kick is aimed at: pale gold and white, apart from the steered
// player's deep gold
export const AIM_MARKER = {
  ring: ['#fff6cc', '#ffd04a'],
  fill: ['#ffffff', '#fff2a8'],
  outline: '#2a1606',
};

export const NAME_TAG = { panel: '#0e1220', edge: '#2a3350', text: '#f4f1e8', star: '#ffd04a' };

export const EFFECT_COLOURS = {
  dust: ['#8a7a5c', '#b4a27c', '#d8c8a0'],
  grass: ['#2c6a2c', '#3f8f3a', '#6cbf52'],
  flash: '#fff6d8',
};
