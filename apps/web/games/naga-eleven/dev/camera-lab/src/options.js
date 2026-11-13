import { FIELD_RESULTS } from '../../../src/data/duels.js';
import { MOVES } from '../../../src/data/moves.js';
import { SAVE_CAM_VENUES } from '../../../src/render/save-cam/backdrops/index.js';

const movesWhere = (test) =>
  Object.values(MOVES)
    .filter(test)
    .map((move) => move.id);

const ofKinds = (kinds) => movesWhere((move) => kinds.includes(move.kind));

// what each of the lab's pickers offers
export const CHOICES = {
  scene: ['shot', 'clash', 'saveCam'],
  camera: ['full', 'short', 'off'],
  lang: ['en', 'km'],
  shot: ofKinds(['shot']),
  guard: ['', ...ofKinds(['save'])],
  outcome: ['goal', 'catch', 'parry', 'punch', 'wall', 'wide', 'post'],
  dive: ['auto', '-1', '0', '1'],
  attack: ['dribble', 'pass', 'shoot', ...ofKinds(['dribble', 'pass'])],
  defend: ['tackle', 'block', 'intercept', ...ofKinds(['tackle', 'block'])],
  word: [...new Set(Object.values(FIELD_RESULTS).flat())],
  venue: SAVE_CAM_VENUES,
};

export const DEFAULT_SETTINGS = {
  scene: 'shot',
  camera: 'full',
  lang: 'en',
  shot: 'naga-shot',
  guard: 'mountain-guard',
  outcome: 'catch',
  dive: 'auto',
  side: 0.55,
  height: 0.6,
  attack: 'hanuman-leap',
  defend: 'tackle',
  word: 'stolen',
  venue: 'world-stadium',
  repeat: false,
};

// the side a field duel's word goes to: the first of each kind's pair is the attack's win
export const sideOfWord = (word) =>
  Object.values(FIELD_RESULTS).some(([win]) => win === word) ? 'attack' : 'defend';
