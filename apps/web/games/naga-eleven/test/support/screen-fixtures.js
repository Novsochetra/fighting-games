import { groupRows } from '../../src/campaign/group-table.js';
import { heroAtLevel, xpForLevel } from '../../src/campaign/levels.js';
import { progressSummary } from '../../src/campaign/progress-summary.js';
import { newSave } from '../../src/campaign/save.js';

export function fakeStorage(entries = {}) {
  const store = new Map(Object.entries(entries));

  return {
    store,
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => store.set(key, String(value)),
  };
}

// a private window: reading and writing both throw
export const throwingStorage = {
  getItem() {
    throw new Error('blocked');
  },
  setItem() {
    throw new Error('blocked');
  },
};

const stages = (count) => Array.from({ length: count }, () => ({ kind: 'scene', scene: 'x' }));

export const SAMPLE_CHAPTERS = [
  ['chapter-1', 'The Boy from Chrey Village', 'ក្មេងប្រុសមកពីភូមិជ្រៃ'],
  ['chapter-2', 'Fire of Youth', 'ភ្លើងយុវវ័យ'],
  ['chapter-3', 'Asia Awakens', 'អាស៊ីភ្ញាក់រលឹក'],
  ['chapter-4', 'The World Stage', 'ឆាកពិភពលោក'],
].map(([id, en, km], index) => ({ id, number: index + 1, title: { en, km }, stages: stages(3) }));

const stats = (value) => ({
  speed: value,
  shot: value,
  pass: value,
  dribble: value,
  tackle: value,
  keeping: value,
  stamina: value,
});

const player = (id, name, number) => ({ id, name, number, role: 'forward', stats: stats(50) });

export const CHREY = {
  id: 'chrey-school',
  name: { en: 'Chrey School', km: 'សាលាជ្រៃ' },
  short: 'CHR',
  kit: 'chrey-school',
  format: '7',
  players: [player('sochetra', 'Sochetra', 10), player('chrey-school-4', 'Vuthy', 4)],
};

export const ROYAL = {
  id: 'royal-kids',
  name: { en: 'Royal Kids', km: 'រ៉ូយ៉ាល់ឃីដ' },
  short: 'ROY',
  kit: 'royal-kids',
  format: '7',
  players: [player('rithy', 'Rithy', 9)],
};

export const NEIGHBOR = {
  id: 'neighbor-village',
  name: { en: 'Neighbour Village', km: 'ភូមិជិតខាង' },
  short: 'NEI',
  kit: 'neighbor-village',
  format: '7',
  players: [],
};

export const HIGH_SCHOOL = {
  id: 'kampong-cham-high',
  name: { en: 'Kampong Cham High', km: 'វិទ្យាល័យកំពង់ចាម' },
  short: 'KCH',
  kit: 'kampong-cham-high',
  format: '11',
  players: [],
};

export function savedAt({ chapter = 1, stage = 1, level = 12, moves = ['power-shot'] } = {}) {
  const hero = { ...heroAtLevel(level), moves };

  return { ...newSave(), chapter, stage, hero: { ...hero, xp: hero.xp + 40 } };
}

export const sampleSummary = (save = savedAt()) => progressSummary(save, SAMPLE_CHAPTERS);

export const SAMPLE_PREMATCH = {
  cup: { en: 'National Primary Schools Cup', km: 'ពានរង្វាន់សាលាបឋមសិក្សាជាតិ' },
  round: { en: 'Final', km: 'វគ្គផ្ដាច់ព្រ័ត្រ' },
  teams: [CHREY, ROYAL],
  venue: 'city-school-stadium',
  rival: { character: 'rithy', age: 'child', mood: 'smirk', move: 'preah-khan-strike' },
};

const GROUP_TEAMS = [CHREY, ROYAL, NEIGHBOR];

export const SAMPLE_GROUP = {
  rows: groupRows({
    teams: GROUP_TEAMS.map((team) => team.id),
    results: [
      { home: 'chrey-school', away: 'neighbor-village', homeGoals: 3, awayGoals: 1 },
      { home: 'royal-kids', away: 'neighbor-village', homeGoals: 1, awayGoals: 1 },
    ],
  }),
  teams: GROUP_TEAMS,
  own: 'chrey-school',
  advance: 2,
};

export const SAMPLE_POSTMATCH = {
  teams: [CHREY, ROYAL],
  score: [2, 1],
  side: 0,
  penalties: null,
  goals: [
    { team: 0, scorer: 'chrey-school-4', move: null, minute: 38, byHero: false },
    { team: 1, scorer: 'rithy', move: 'preah-khan-strike', minute: 12, byHero: false },
    { team: 0, scorer: 'sochetra', move: 'naga-shot', minute: 31, byHero: true },
  ],
  xp: {
    before: { level: 3, xp: xpForLevel(3) + 10 },
    after: { level: 4, xp: xpForLevel(4) + 55 },
  },
  woken: ['naga-shot'],
  group: SAMPLE_GROUP,
};
