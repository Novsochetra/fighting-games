// the ids the game's README fixes, which the story and team data must keep to
export const CAST = [
  'sochetra',
  'neary',
  'ta-sok',
  'coach-vannak',
  'dara',
  'rithy',
  'coach-sokha',
  'coach-bora',
  'haruto',
  'minjun',
  'farhad',
  'rafael',
  'lukas',
  'announcer',
  'narrator',
  'villager',
];

export const VENUES = [
  'village-field',
  'provincial-ground',
  'city-school-stadium',
  'national-stadium',
  'asia-stadium',
  'world-stadium',
];

export const BACKDROPS = [
  'village-dawn',
  'village-dusk',
  'home-night',
  'school-yard',
  'city-street',
  'high-school',
  'temple-dawn',
  'training-ground',
  'dressing-room',
  'federation-office',
  'airport',
  'hotel-night',
  'stadium-tunnel',
  'village-tv',
  'trophy-stage',
  'angkor-sunrise',
  'black',
];

export const DRILLS = ['cone-dribble', 'target-shot', 'spirit-focus'];

export const PORTRAIT_MOODS = [
  'neutral',
  'happy',
  'determined',
  'shocked',
  'sad',
  'angry',
  'smirk',
  'cry',
];

export const SCENE_MOODS = ['calm', 'hope', 'tense', 'sad', 'triumph'];

export const AGES = ['child', 'teen', 'young', 'adult'];

// move id: its owner, null for a move any named star may carry
export const MOVE_OWNERS = {
  'naga-shot': 'sochetra',
  'hanuman-leap': 'sochetra',
  'garuda-volley': 'sochetra',
  'twin-naga': 'sochetra',
  'seven-headed-naga': 'sochetra',
  'preah-khan-strike': 'rithy',
  'angkor-wall': 'dara',
  'silent-moon': 'haruto',
  'mirror-step': 'haruto',
  'hwarang-charge': 'minjun',
  'mountain-guard': 'farhad',
  'samba-mirage': 'rafael',
  'carnival-rocket': 'rafael',
  'iron-gate': 'lukas',
  'power-shot': null,
};

// the move each chapter wakes in Sochetra, and the stage kind it wakes in
export const CHAPTER_MOVES = {
  1: [['naga-shot', 'match']],
  2: [
    ['hanuman-leap', 'training'],
    ['garuda-volley', 'match'],
  ],
  3: [['twin-naga', 'match']],
  4: [['seven-headed-naga', 'match']],
};

// team id: [chapter, kit]
export const TEAM_KITS = {
  'chrey-school': [1, 'chrey-school'],
  'neighbor-village': [1, 'neighbor-village'],
  'riverside-school': [1, 'riverside-school'],
  'royal-kids': [1, 'royal-kids'],
  'kampong-cham-high': [2, 'kampong-cham-high'],
  'siem-reap-high': [2, 'siem-reap-high'],
  'battambang-high': [2, 'battambang-high'],
  'kampot-high': [2, 'kampot-high'],
  'phnom-penh-elite': [2, 'phnom-penh-elite'],
  'cambodia-youth': [3, 'cambodia'],
  'japan-youth': [3, 'japan'],
  'thailand-youth': [3, 'thailand'],
  'korea-youth': [3, 'korea'],
  'iran-youth': [3, 'iran'],
  cambodia: [4, 'cambodia'],
  brazil: [4, 'brazil'],
  nigeria: [4, 'nigeria'],
  mexico: [4, 'mexico'],
  germany: [4, 'germany'],
};

// the stat range of ordinary players in each chapter
export const LEVELS = {
  1: { min: 30, max: 50 },
  2: { min: 45, max: 65 },
  3: { min: 60, max: 75 },
  4: { min: 75, max: 90 },
};

export const KHMER = /[ក-៿]/;
