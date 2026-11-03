import { rampOf } from './ramp.js';

// each part is a ramp of four shades, deep to light; a national kit only wears its country's
// colours, never a badge or a maker's mark
const kit = (shirt, shorts, socks, trim) => ({
  shirt: rampOf(shirt),
  shorts: rampOf(shorts),
  socks: rampOf(socks),
  trim: rampOf(trim),
});

const WHITE = '#f4f2ec';
const NAVY = '#1f2c5a';
const BLACK = ['#0c0c14', '#181a26', '#262a3a', '#3a4058'];

export const KITS = {
  'chrey-school': {
    home: kit('#2f82d2', WHITE, '#2f82d2', '#ffd04a'),
    away: kit(WHITE, '#2f82d2', WHITE, '#2f82d2'),
    keeper: kit('#f0a12a', BLACK, '#f0a12a', WHITE),
  },
  'neighbor-village': {
    home: kit('#3f9a46', BLACK, '#3f9a46', WHITE),
    away: kit('#f2cf3c', '#3f9a46', '#f2cf3c', '#3f9a46'),
    keeper: kit('#8a5ad0', BLACK, '#8a5ad0', WHITE),
  },
  'riverside-school': {
    home: kit('#1fa39c', WHITE, '#1fa39c', NAVY),
    away: kit(NAVY, NAVY, WHITE, '#1fa39c'),
    keeper: kit('#e2486e', BLACK, '#e2486e', WHITE),
  },
  'royal-kids': {
    home: kit('#6b3fb4', '#f0c84a', '#6b3fb4', '#f0c84a'),
    away: kit(WHITE, '#6b3fb4', WHITE, '#f0c84a'),
    keeper: kit('#3fbf5e', BLACK, '#3fbf5e', WHITE),
  },
  'kampong-cham-high': {
    home: kit('#e07a26', NAVY, '#e07a26', WHITE),
    away: kit(WHITE, NAVY, NAVY, '#e07a26'),
    keeper: kit('#2fb3d8', BLACK, '#2fb3d8', WHITE),
  },
  'siem-reap-high': {
    home: kit('#e8c23a', '#2e6b3c', '#e8c23a', '#2e6b3c'),
    away: kit('#2e6b3c', WHITE, '#2e6b3c', '#e8c23a'),
    keeper: kit('#e2486e', BLACK, '#e2486e', WHITE),
  },
  'battambang-high': {
    home: kit('#2a7a46', WHITE, WHITE, '#f2cf3c'),
    away: kit('#c9393f', WHITE, '#c9393f', WHITE),
    keeper: kit('#f0a12a', BLACK, '#f0a12a', WHITE),
  },
  'kampot-high': {
    home: kit('#58b4e6', NAVY, '#58b4e6', WHITE),
    away: kit(NAVY, '#58b4e6', NAVY, WHITE),
    keeper: kit('#a8d83a', BLACK, '#a8d83a', NAVY),
  },
  'phnom-penh-elite': {
    home: kit(BLACK, BLACK, BLACK, '#f0c84a'),
    away: kit(WHITE, BLACK, WHITE, '#f0c84a'),
    keeper: kit('#e2486e', BLACK, '#e2486e', WHITE),
  },
  cambodia: {
    home: kit('#d0262e', '#1f3e94', '#d0262e', WHITE),
    away: kit('#1f3e94', WHITE, '#1f3e94', '#d0262e'),
    keeper: kit('#2fbf6a', BLACK, '#2fbf6a', WHITE),
  },
  japan: {
    home: kit('#1c3c9c', WHITE, '#1c3c9c', '#d0262e'),
    away: kit(WHITE, '#1c3c9c', WHITE, '#d0262e'),
    keeper: kit('#f0a12a', BLACK, '#f0a12a', WHITE),
  },
  thailand: {
    home: kit('#2852c4', '#2852c4', '#2852c4', WHITE),
    away: kit(WHITE, '#d0262e', WHITE, '#2852c4'),
    keeper: kit('#f2cf3c', BLACK, '#f2cf3c', NAVY),
  },
  korea: {
    home: kit('#d42436', BLACK, '#d42436', WHITE),
    away: kit(WHITE, '#1f3e94', WHITE, '#d42436'),
    keeper: kit('#a8d83a', BLACK, '#a8d83a', BLACK),
  },
  iran: {
    home: kit(WHITE, WHITE, WHITE, '#2a9a4a'),
    away: kit('#cf2a32', '#cf2a32', '#cf2a32', WHITE),
    keeper: kit('#3a3f52', BLACK, '#3a3f52', '#2a9a4a'),
  },
  brazil: {
    home: kit('#f4d02a', '#2352b4', WHITE, '#1f9a4a'),
    away: kit('#2352b4', WHITE, '#2352b4', '#f4d02a'),
    keeper: kit('#3a3f52', BLACK, '#3a3f52', '#f4d02a'),
  },
  nigeria: {
    home: kit('#24a458', '#24a458', '#24a458', WHITE),
    away: kit(WHITE, '#24a458', WHITE, '#24a458'),
    keeper: kit('#f0a12a', BLACK, '#f0a12a', WHITE),
  },
  mexico: {
    home: kit('#156c44', WHITE, '#cf2a32', '#cf2a32'),
    away: kit(WHITE, '#156c44', WHITE, '#156c44'),
    keeper: kit('#e2486e', BLACK, '#e2486e', WHITE),
  },
  germany: {
    home: kit(WHITE, BLACK, WHITE, BLACK),
    away: kit('#2f3442', '#2f3442', '#2f3442', '#d0262e'),
    keeper: kit('#3fbf5e', BLACK, '#3fbf5e', BLACK),
  },
};

// what a keeper changes into when their own shirt looks like one already on the pitch
export const KEEPER_SPARES = [
  kit('#8a5ad0', BLACK, '#8a5ad0', WHITE),
  kit('#f2cf3c', BLACK, '#f2cf3c', NAVY),
  kit('#e2486e', BLACK, '#e2486e', WHITE),
  kit('#3a3f52', BLACK, '#3a3f52', '#f2cf3c'),
];

// two plain teams, for a match whose teams name no kit of their own
export const PLAIN_KITS = [
  {
    home: kit('#d0262e', WHITE, '#d0262e', '#ffd04a'),
    away: kit(WHITE, '#d0262e', WHITE, '#d0262e'),
    keeper: kit('#3fbf5e', BLACK, '#3fbf5e', WHITE),
  },
  {
    home: kit('#2f6fd6', NAVY, WHITE, '#9fe3ff'),
    away: kit('#f2cf3c', NAVY, '#f2cf3c', NAVY),
    keeper: kit('#f0a12a', BLACK, '#f0a12a', WHITE),
  },
];
