// the most effects that sound at once: a phone's audio thread keeps up, and a busy goalmouth
// stays clear
export const VOICE_CAP = 12;

// rank: what a full set of voices gives up first (lowest first); cap: the most of one cue at once
export const CUE_RULES = {
  blip: { rank: 0, cap: 1 },
  cursor: { rank: 0, cap: 1 },
  pass: { rank: 1, cap: 2 },
  loft: { rank: 1, cap: 2 },
  header: { rank: 1, cap: 2 },
  tackle: { rank: 1, cap: 2 },
  ooh: { rank: 1, cap: 1, bus: 'crowd' },
  kick: { rank: 2, cap: 2 },
  save: { rank: 2, cap: 1 },
  post: { rank: 2, cap: 1 },
  net: { rank: 2, cap: 1 },
  groan: { rank: 2, cap: 1, bus: 'crowd' },
  duelEnd: { rank: 2, cap: 1 },
  roar: { rank: 3, cap: 1, bus: 'crowd' },
  whistle: { rank: 3, cap: 1 },
  duel: { rank: 3, cap: 1 },
  charge: { rank: 3, cap: 1 },
  impact: { rank: 3, cap: 1 },
  levelUp: { rank: 3, cap: 1 },
  moveUnlocked: { rank: 3, cap: 1 },
};

export const DEFAULT_CUE_RULE = { rank: 1, cap: 2, bus: 'effects' };

export const AUDIO = {
  // two of the same cue this close (two passes in one tick) sound once
  mergeSeconds: 0.03,
  startDelay: 0.005,
  stealSeconds: 0.03,
  pumpMs: 50,
  // music is scheduled this far ahead, so a slow frame never leaves a gap
  lookahead: 0.3,
  crossfade: 1.6,
  jingleFade: 0.05,
  levels: { effects: 0.85, music: 0.5, crowd: 0.7 },
};

// depth: the share of the music left under the moment; hold: how long; release: how fast it returns
export const DUCKS = {
  goal: { depth: 0.3, hold: 3, release: 0.7 },
  special: { depth: 0.35, hold: 2, release: 0.5 },
  duel: { depth: 0.6, hold: 1.2, release: 0.4 },
};

export const CROWD = {
  // the bed at its quietest is this share of the crowd's level
  floor: 0.35,
  base: 0.25,
  late: 0.25,
  close: 0.2,
  nearGoal: 0.3,
  phases: { halfTime: 0.2, over: 0.35, goal: 1, duel: 0.75, kickoff: 0.4 },
  // a shot that goes out for a goal kick or a corner this soon after was a near miss
  nearMissTicks: 150,
  defaultLevel: 0.6,
  bedPeak: 0.5,
};

// a speaker's letters tick at their own pitch (Hz), higher for the young
export const VOICES = {
  base: 300,
  speakers: {
    sochetra: 300,
    neary: 380,
    'ta-sok': 185,
    'coach-vannak': 225,
    dara: 285,
    rithy: 310,
    'coach-sokha': 245,
    'coach-bora': 205,
    haruto: 290,
    minjun: 300,
    farhad: 210,
    rafael: 320,
    lukas: 220,
    announcer: 330,
    narrator: 250,
    villager: 340,
  },
  ages: { child: 1.32, teen: 1.14, young: 1, adult: 0.96 },
  child: 1.3,
};
