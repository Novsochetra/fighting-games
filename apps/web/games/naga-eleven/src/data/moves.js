import { COMBO_MOVE_ROWS } from './combos.js';
import { LOOK_STAND_INS } from './look-stand-ins.js';
import { CAST_SKILL_ROWS, SKILL_ROWS } from './skills.js';

// power adds to the stats a duel weighs (1..99); cost is spirit, out of a gauge of about 100.
// An owner of null is a move any named player may carry
const ROWS = [
  ['naga-shot', 'sochetra', 'shot', 'Naga Shot', 'ទាត់នាគ', 22, 40, 'naga'],
  ['hanuman-leap', 'sochetra', 'dribble', 'Hanuman Leap', 'លោតហនុមាន', 18, 30, 'hanuman'],
  ['garuda-volley', 'sochetra', 'shot', 'Garuda Volley', 'ទាត់គ្រុឌ', 28, 50, 'garuda'],
  ['twin-naga', 'sochetra', 'shot', 'Twin Naga', 'នាគភ្លោះ', 36, 60, 'twin-naga'],
  [
    'seven-headed-naga',
    'sochetra',
    'shot',
    'Seven-Headed Naga',
    'នាគប្រាំពីរក្បាល',
    48,
    80,
    'seven-naga',
  ],
  ['preah-khan-strike', 'rithy', 'shot', 'Preah Khan Strike', 'ទាត់ព្រះខ័ន', 26, 45, 'sword'],
  ['angkor-wall', 'dara', 'save', 'Angkor Wall', 'កំពែងអង្គរ', 26, 40, 'wall'],
  ['silent-moon', 'haruto', 'shot', 'Silent Moon', 'ចន្ទស្ងាត់', 30, 50, 'moon'],
  ['mirror-step', 'haruto', 'dribble', 'Mirror Step', 'ជំហានកញ្ចក់', 22, 35, 'mirror'],
  ['hwarang-charge', 'minjun', 'dribble', 'Hwarang Charge', 'សម្រុកហ្វារ៉ាំង', 22, 35, 'charge'],
  ['mountain-guard', 'farhad', 'save', 'Mountain Guard', 'របាំងភ្នំ', 30, 45, 'mountain'],
  ['samba-mirage', 'rafael', 'dribble', 'Samba Mirage', 'សាំបាមរីចិកា', 26, 40, 'samba'],
  ['carnival-rocket', 'rafael', 'shot', 'Carnival Rocket', 'រ៉ុក្កែតកាណាវ៉ាល់', 36, 60, 'rocket'],
  ['iron-gate', 'lukas', 'tackle', 'Iron Gate', 'ទ្វារដែក', 28, 45, 'iron'],
  ['power-shot', null, 'shot', 'Power Shot', 'ទាត់ខ្លាំង', 16, 20, 'plain'],
];

// `family` says where a player gets a move: 'star' moves are carried in a player's `moves`, 'role'
// skills come by post or cast (skills.js) and 'combo' moves by playing together (combos.js);
// `play` is what it does in the open, which for a star's move is its kind
const toMove = ({ id, owner = null, kind, play = kind, family, en, km, power, cost, look }) =>
  Object.freeze({
    id,
    owner,
    kind,
    play,
    family,
    name: Object.freeze({ en, km }),
    power,
    cost,
    look: LOOK_STAND_INS[look] ?? look,
    plannedLook: look,
  });

const owned =
  (family) =>
  ([id, owner, kind, en, km, power, cost, look]) =>
    toMove({ id, owner, kind, family, en, km, power, cost, look });

// a skill's or a combo's row has no owner: anyone the rules give it to may play it
const unowned =
  (family) =>
  ([id, kind, play, en, km, power, cost, look]) =>
    toMove({ id, kind, play, family, en, km, power, cost, look });

const ALL = [
  ...ROWS.map(owned('star')),
  ...CAST_SKILL_ROWS.map(owned('role')),
  ...SKILL_ROWS.map(unowned('role')),
  ...COMBO_MOVE_ROWS.map(unowned('combo')),
];

export const MOVES = Object.freeze(Object.fromEntries(ALL.map((move) => [move.id, move])));

// the stars' moves first, in the story's order
export const MOVE_IDS = Object.freeze(ALL.map((move) => move.id));

export const moveOf = (id) => MOVES[id] ?? null;
