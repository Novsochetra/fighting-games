// Every player has one skill (README "Skills and combos"): a star plays his own moves, a star with
// none his CAST_SKILLS entry, and everyone else his side's skill for his post. A row is
// [id, kind, play, en, km, power, cost, look]: `kind` is the duel option it is, `play` what it does
// in the open, and `look` the cut-in it is drawn with (src/data/look-stand-ins.js until it lands)
export const SKILL_ROWS = [
  ['bayon-eyes', 'save', 'save', 'Bayon Eyes', 'ភ្នែកបាយ័ន', 24, 20, 'bayon'],
  ['elephant-guard', 'block', 'block', 'Elephant Guard', 'របាំងដំរី', 14, 35, 'elephant'],
  ['apsara-curl', 'pass', 'pass', 'Apsara Curl', 'កោងអប្សរា', 12, 40, 'apsara'],
  ['kite-cross', 'pass', 'cross', 'Kite Cross', 'បាល់ខ្លែង', 12, 40, 'kite'],
  ['kouprey-kick', 'shot', 'shot', 'Kouprey Kick', 'ទាត់គោព្រៃ', 14, 35, 'kouprey'],
  ['panther-dive', 'save', 'save', 'Panther Dive', 'លោតខ្លារខិន', 24, 20, 'panther'],
  ['steel-block', 'block', 'block', 'Steel Block', 'របាំងដែកថែប', 14, 35, 'steel'],
  ['curl-pass', 'pass', 'pass', 'Curl Pass', 'បញ្ជូនកោង', 12, 40, 'plain'],
  ['whip-cross', 'pass', 'cross', 'Whip Cross', 'បាល់ឆ្លងរំពាត់', 12, 40, 'plain'],
  ['thunder-shot', 'shot', 'shot', 'Thunder Shot', 'ទាត់ផ្គរលាន់', 14, 35, 'plain'],
];

// a cast member's own skill, in the star rows' shape ([id, owner, kind, ...] as in moves.js), for
// the chapters he carries no move: Dara in goal for Chrey as a boy
export const CAST_SKILL_ROWS = [
  ['belly-block', 'dara', 'save', 'Belly Block', 'បាំងពោះ', 20, 25, 'belly'],
];

export const CAST_SKILLS = { dara: 'belly-block' };

// how each keeper's save skill keeps the ball out, which is what the save cam shows: a catch holds
// it (or pushes it away when it only just reaches it), a punch knocks it out wide, a wall stands
// big and it bounces back off him. Both styles' role saves catch, so neither side is stronger
export const SAVE_STYLES = {
  'bayon-eyes': 'catch',
  'panther-dive': 'catch',
  'belly-block': 'wall',
  'angkor-wall': 'wall',
  'mountain-guard': 'punch',
};

// a post is a formation role, but for a midfielder or forward out wide, who plays the wing
export const SKILL_POSTS = ['keeper', 'defender', 'midfielder', 'wing', 'forward'];

// Cambodian sides play Khmer skills; the sides in these kits play the world's, the same numbers
// under other names, so neither side is stronger for its style
export const WORLD_KITS = [
  'japan',
  'thailand',
  'korea',
  'iran',
  'brazil',
  'nigeria',
  'mexico',
  'germany',
];

export const ROLE_SKILLS = {
  khmer: {
    keeper: 'bayon-eyes',
    defender: 'elephant-guard',
    midfielder: 'apsara-curl',
    wing: 'kite-cross',
    forward: 'kouprey-kick',
  },
  world: {
    keeper: 'panther-dive',
    defender: 'steel-block',
    midfielder: 'curl-pass',
    wing: 'whip-cross',
    forward: 'thunder-shot',
  },
};

// what a skill does when it plays on in the open, by what it plays (README "Using a skill")
export const SKILL_PLAY = {
  // faster than any full charge (KICK.shotMax) by this share, and this share of the spread
  shot: { speed: 1.15, spread: 0.5 },
  // only a man this near the receiver can cut it out; it counts this many pass-combo steps
  pass: { cutReach: 24, steps: 2 },
  // dropped on the head of the mate it is struck to, who meets it first time within `ticks`
  cross: { steps: 2, ticks: 30 },
  // a burst this much faster for this long, in which no tackle wins the ball
  dribble: { speed: 1.35, ticks: 36 },
  // a tackle he makes wins the ball this much more often (TACKLE.odds)
  tackle: { odds: 0.25 },
  // the defender throws himself in front of a shot or pass struck past him this near
  block: { reach: 30 },
  // the keeper's dive reaches this much further than his own (KEEPER.diveReach)
  save: { reach: 1.4 },
};

export const SKILL_RULES = {
  // after a skill or a special a player waits this long for his next, so one attack is not three
  cooldown: 300,
  // two presses of RUN this close together, with the ball, play a dribble skill
  doubleTap: 15,
  // a midfielder or forward whose slot stands this far across from the middle plays the wing
  wingFromMiddle: 0.3,
  // the most power a pass combo and a chain add to one move between them
  mostBonus: 16,
};

// how often the computer uses a skill it has the spirit for when the moment comes; `answer` is the
// weight its defender gives his skill against a special (DUEL_WEIGHTS.special is 6)
export const SKILL_AI = {
  shot: 0.5,
  pass: 0.25,
  cross: 0.4,
  dribble: 0.3,
  duo: 0.6,
  finisher: 0.7,
  answer: 20,
};
