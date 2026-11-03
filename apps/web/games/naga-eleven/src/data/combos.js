import { DUELS } from './duels.js';

// The three combos (README "Skills and combos"): pass combos, duo combos and skill chains. Each one
// stops play for a cut-in, as a special does. Their moves are rows as in skills.js:
// [id, kind, play, en, km, power, cost, look]
export const COMBO_MOVE_ROWS = [
  ['mekong-current', 'shot', 'shot', 'Mekong Current', 'ចរន្តមេគង្គ', 18, 0, 'mekong'],
  ['tonle-sap-tide', 'shot', 'shot', 'Tonle Sap Tide', 'ជំនោរទន្លេសាប', 26, 0, 'tonle-sap'],
  ['wave-strike', 'shot', 'shot', 'Wave Strike', 'ទាត់រលក', 18, 0, 'wave'],
  ['tidal-wave', 'shot', 'shot', 'Tidal Wave', 'រលកយក្ស', 26, 0, 'wave'],
  ['kite-header', 'shot', 'shot', 'Kite Header', 'បុកក្បាលខ្លែង', 26, 50, 'kite'],
  ['chrey-lightning', 'shot', 'shot', 'Chrey Lightning', 'រន្ទះជ្រៃ', 30, 55, 'lightning'],
  ['moon-relay', 'shot', 'shot', 'Moon Relay', 'បញ្ជូនចន្ទ', 30, 55, 'moon'],
  [
    'carnival-bicycle',
    'shot',
    'shot',
    'Carnival Bicycle',
    'ទាត់ក្រឡាប់កាណាវ៉ាល់',
    34,
    60,
    'rocket',
  ],
  ['flying-naga', 'shot', 'shot', 'Flying Naga', 'នាគហោះ', 30, 40, 'flying-naga'],
  ['storm-garuda', 'shot', 'shot', 'Storm Garuda', 'គ្រុឌព្យុះ', 36, 50, 'storm-garuda'],
  ['eclipse-moon', 'shot', 'shot', 'Eclipse Moon', 'ចន្ទគ្រាស', 38, 50, 'eclipse'],
  ['samba-rocket', 'shot', 'shot', 'Samba Rocket', 'រ៉ុក្កែតសាំបា', 44, 60, 'rocket'],
];

// arrays are read by the counter's level (0 to `most`); a step is a pass played on within
// `holdTicks` of the touch that took it, and the finisher is free: the passing paid for it
export const PASS_COMBO = {
  holdTicks: { 7: 45, 11: 45 },
  showFrom: 2,
  most: 5,
  oneTwo: 2,
  stepSpirit: [0, 0, 2, 3, 4, 5],
  shotPower: [0, 0, 3, 6, 9, 12],
  shotSpeed: [0, 0, 0.03, 0.06, 0.09, 0.12],
  finisherFrom: 3,
  finishers: {
    khmer: { 3: 'mekong-current', 5: 'tonle-sap-tide' },
    world: { 3: 'wave-strike', 5: 'tidal-wave' },
  },
};

// Two players strike together. A partner is a cast member (`star`) or any mate on a post (`post`,
// skills.js). `entry` 'strike': the striker has the ball and the partner is within `reach`;
// 'pass': the partner plays it to the striker within `reach`, who strikes first time. Reach is a
// share of the pitch's length; each pays his share. A duo struck with the head or an overhead kick
// is struck from no further out than `range` (a plain shot's), where a special's range would let it
// fly from halfway. Sochetra's duos wake with a move he knows (`needs`) or in a story match and
// after (`from`); a rival's are always his
export const DUO_COMBOS = [
  {
    move: 'twin-naga',
    striker: 'sochetra',
    partner: { star: 'rithy' },
    entry: 'strike',
    shares: { striker: 36, partner: 24 },
    reach: 0.14,
    needs: 'twin-naga',
  },
  {
    move: 'kite-header',
    striker: 'sochetra',
    partner: { post: 'wing' },
    entry: 'pass',
    shares: { striker: 25, partner: 25 },
    reach: 0.25,
    range: DUELS.shotRange,
    from: 'ch2-semi',
  },
  {
    move: 'chrey-lightning',
    striker: 'sochetra',
    partner: { star: 'dara' },
    entry: 'pass',
    shares: { striker: 30, partner: 25 },
    reach: 0.45,
    from: 'ch4-group-nigeria',
  },
  {
    move: 'moon-relay',
    striker: 'haruto',
    partner: { post: 'forward' },
    entry: 'pass',
    shares: { striker: 35, partner: 20 },
    reach: 0.2,
  },
  {
    move: 'carnival-bicycle',
    striker: 'rafael',
    partner: { post: 'wing' },
    entry: 'pass',
    shares: { striker: 40, partner: 20 },
    reach: 0.35,
    range: DUELS.shotRange,
  },
];

// a skill that plays `starts` and then, within `ticks`, a shot skill or special by the same player
// (or by the mate a pass skill went to) is a chain: the shot gains `power`. The named chains are
// a star's own, with a move and a cut-in of their own
export const CHAIN_RULES = { ticks: 120, power: 8, starts: ['dribble', 'pass', 'cross'] };

export const NAMED_CHAINS = [
  { from: 'hanuman-leap', to: 'naga-shot', move: 'flying-naga' },
  { from: 'hanuman-leap', to: 'garuda-volley', move: 'storm-garuda' },
  { from: 'mirror-step', to: 'silent-moon', move: 'eclipse-moon' },
  { from: 'samba-mirage', to: 'carnival-rocket', move: 'samba-rocket' },
];

// the first story match each part plays in, both sides alike, so the story teaches one at a time
export const SYSTEMS_FROM = {
  passCombo: 'ch1-friendly',
  roleSkills: 'ch1-semi',
  chains: 'ch2-group-siem-reap',
};
