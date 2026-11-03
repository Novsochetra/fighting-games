const shirt = ([clothLight, cloth, clothShade, clothDeep], [trim, trimShade]) => ({
  clothLight,
  cloth,
  clothShade,
  clothDeep,
  trim,
  trimShade,
});

const WHITE_TRIM = ['#f6f3ec', '#b9bfcc'];
const GOLD_TRIM = ['#ffd760', '#b9812a'];
const BLUE_TRIM = ['#3a6ad8', '#1e3888'];

export const SHIRTS = {
  chreySchool: shirt(['#c4ecff', '#7cc6f0', '#4a8ec8', '#2c5a90'], WHITE_TRIM),
  kampongCham: shirt(['#ffbc78', '#ea7f2a', '#b4501e', '#6e2c16'], WHITE_TRIM),
  cambodia: shirt(['#f2685a', '#cf2a3c', '#951a34', '#580e26'], BLUE_TRIM),
  royalKids: shirt(['#ae90e6', '#6e4ec2', '#45308c', '#2a1c5a'], GOLD_TRIM),
  phnomPenhElite: shirt(['#62667c', '#35384e', '#202232', '#12121e'], GOLD_TRIM),
  teacher: shirt(['#ffffff', '#e7e7e0', '#b6bac8', '#7c8298'], ['#3a4a7a', '#22305a']),
  tracksuit: shirt(['#b84c5e', '#7e2238', '#521628', '#300c18'], WHITE_TRIM),
  nationalJacket: shirt(['#4f6ed2', '#27399c', '#172266', '#0c123c'], ['#de3a40', '#8e1e30']),
  japan: shirt(['#5585dc', '#1f4aa8', '#142e70', '#0a1a44'], WHITE_TRIM),
  korea: shirt(['#f47070', '#d22a3a', '#921a2c', '#560e1e'], ['#2a2b40', '#111220']),
  brazil: shirt(['#fff384', '#f2cc2a', '#c4921c', '#7e5a12'], ['#2aa04a', '#146a2c']),
  germany: shirt(['#ffffff', '#e8e8ee', '#b4b6c6', '#787a90'], ['#2c2c36', '#111118']),
  suit: shirt(['#6c7088', '#40445a', '#272a3c', '#151724'], ['#f2f0ea', '#b8bcc8']),
  blouse: shirt(['#e67caa', '#b9407c', '#82285a', '#50163c'], GOLD_TRIM),
  cream: shirt(['#fffaf0', '#ebe2d0', '#bfb29c', '#83765e'], ['#8a6a4a', '#5a4030']),
};

// the crowd of Chrey wears what no one with a name does, in colours none of them wear
export const VILLAGER_SHIRTS = {
  lime: shirt(['#dcf48a', '#9cc43a', '#62882a', '#34501e'], WHITE_TRIM),
  rose: shirt(['#ffd0d6', '#f290a6', '#c4587e', '#7c2c56'], WHITE_TRIM),
  flannel: shirt(['#e8a070', '#c0603a', '#8a3a2c', '#52201e'], ['#2a3050', '#161a30']),
  lavender: shirt(['#dcd2fa', '#a594dc', '#7262aa', '#443a72'], WHITE_TRIM),
  farmer: shirt(['#8fb0d8', '#5a7cb0', '#3a5482', '#22324e'], WHITE_TRIM),
  coral: shirt(['#ffc8aa', '#ec8a6a', '#b85a52', '#76323c'], ['#fff6e8', '#e0bca8']),
  khaki: shirt(['#d4cc94', '#a29a5a', '#706a3a', '#403c22'], ['#5a5434', '#3a361e']),
  indigo: shirt(['#9a86c8', '#5a4688', '#3a2c60', '#22183c'], ['#e8c06a', '#a8762a']),
};

export const KEEPER_SHIRTS = {
  chreySchool: shirt(['#ffd27a', '#f0a12a', '#b86e1c', '#6e3e12'], WHITE_TRIM),
  kampongCham: shirt(['#9aeaf8', '#2fb3d8', '#1d7a9e', '#114866'], WHITE_TRIM),
  cambodia: shirt(['#82e4a6', '#2aa862', '#177040', '#0c4226'], ['#de3a40', '#8e1e30']),
  iran: shirt(['#6e748c', '#3e435a', '#262a3a', '#151722'], ['#56c862', '#2a7a36']),
};

// the national kit's seams: white edged in the blue of the flag
export const NATIONAL_PIPING = {
  accentLight: '#ffffff',
  accentPale: '#c4c8d8',
  accent: '#2c4ec0',
  accentShade: '#1a2a6e',
};

export const KRAMA = {
  accentLight: '#f8f0e4',
  accentPale: '#c9b8b4',
  accent: '#d2343c',
  accentShade: '#8a1c2e',
};

export const GLOVES = {
  propLight: '#ffffff',
  prop: '#d9dde8',
  propShade: '#9aa0b6',
  accentLight: '#5c628a',
  accent: '#2c3154',
  accentShade: '#181a2e',
};

export const PROPS = {
  cap: { propLight: '#5a8ad0', prop: '#2e5498', propShade: '#1a3262' },
  headset: { propLight: '#7a7f94', prop: '#3c4052', propShade: '#20222e' },
  glasses: { propLight: '#9aa6c0', prop: '#2a2e3c', propShade: '#151722' },
  headband: { propLight: '#ffffff', prop: '#e8eaf0', propShade: '#aab0c2' },
  tie: { accentLight: '#f0606a', accent: '#c42a3c', accentShade: '#7c1428' },
  undershirt: { accentLight: '#ffffff', accent: '#e6e6ee', accentShade: '#a8aec0' },
  cord: { accentLight: '#ffd760', accent: '#d8343c', accentShade: '#7c1428' },
  strawHat: {
    propLight: '#f6dc8e',
    prop: '#d8b05a',
    propShade: '#9a7434',
    accent: '#8a3c2c',
    accentShade: '#561f1c',
  },
  ribbon: { accentLight: '#ff9ab8', accent: '#e8487c', accentShade: '#9e2452' },
  plaster: { propLight: '#fffaf2', prop: '#f6dcc0', propShade: '#d8a882' },
  flower: { propLight: '#ffffff', prop: '#f6ead2', propShade: '#cdb48c', accent: '#f2b632' },
};
