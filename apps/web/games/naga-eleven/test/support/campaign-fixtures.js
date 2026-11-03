import { settleStage, stageOf } from '../../src/campaign/index.js';

export const both = (text) => ({ en: text, km: `${text} (km)` });

const allStats = (value) => ({
  speed: value,
  shot: value,
  pass: value,
  dribble: value,
  tackle: value,
  keeping: value,
  stamina: value,
});

const ROLES = {
  7: ['keeper', 'defender', 'defender', 'midfielder', 'midfielder', 'midfielder', 'forward'],
  11: [
    'keeper',
    ...Array(4).fill('defender'),
    ...Array(3).fill('midfielder'),
    'forward',
    'forward',
    'forward',
  ],
};

const HERO_SLOT = { 7: 6, 11: 9 };

const heroPlace = (role) => ({
  id: 'sochetra',
  name: 'Sochetra',
  number: 10,
  role,
  stats: allStats(1),
  star: 'sochetra',
  hero: true,
  moves: [],
  spiritMax: 1,
});

export function makeTeam({ id, format = '11', strength = 50, hero = false }) {
  const players = ROLES[format].map((role, index) =>
    hero && index === HERO_SLOT[format]
      ? heroPlace(role)
      : {
          id: `${id}-${index + 1}`,
          name: `${id} ${index + 1}`,
          number: index + 1,
          role,
          stats: allStats(strength),
          star: null,
          moves: [],
          spiritMax: 100,
        },
  );

  return { id, name: both(id), short: id.slice(0, 3).toUpperCase(), kit: id, format, players };
}

export const FIXTURE_TEAMS = [
  makeTeam({ id: 'village-school', format: '7', hero: true }),
  makeTeam({ id: 'river-kids', format: '7', strength: 35 }),
  makeTeam({ id: 'hill-kids', format: '7', strength: 40 }),
  makeTeam({ id: 'city-stars', format: '7', strength: 55 }),
  makeTeam({ id: 'town-high', hero: true }),
  makeTeam({ id: 'north-high', strength: 50 }),
  makeTeam({ id: 'south-high', strength: 48 }),
  makeTeam({ id: 'capital-elite', strength: 62 }),
  makeTeam({ id: 'nation-youth', hero: true }),
  makeTeam({ id: 'dragon-youth', strength: 80 }),
  makeTeam({ id: 'tiger-youth', strength: 58 }),
  makeTeam({ id: 'eagle-youth', strength: 62 }),
  makeTeam({ id: 'lion-youth', strength: 66 }),
];

export const KNOWN = {
  teams: FIXTURE_TEAMS,
  venues: ['field', 'stadium'],
  backdrops: ['dawn', 'black'],
  drills: ['cone-dribble', 'target-shot', 'spirit-focus'],
  moves: ['power-shot', 'naga-shot', 'twin-naga'],
  characters: ['narrator', 'coach'],
};

const sceneOf = (id) => ({
  backdrop: 'dawn',
  mood: 'hope',
  lines: [{ speaker: 'narrator', mood: 'happy', side: 'left', text: both(id) }],
});

function matchStage({ id, rule, opponent, cup, extra, name }) {
  const after = { win: name('win'), lose: name('lose') };

  if (rule !== 'knockout') {
    after.draw = name('draw');
  }

  return {
    kind: 'match',
    id,
    rule,
    cup,
    opponent,
    venue: 'field',
    before: name('before'),
    after,
    ...extra,
  };
}

// steps: ['scene'], ['training', drill], [rule, opponent, cupId, extra fields]
function stageFrom([kind, detail, cup, extra = {}], index, sceneId) {
  const name = (part) => sceneId(`${index + 1}-${part}`);

  if (kind === 'scene') {
    return { kind, scene: name('scene') };
  }

  if (kind === 'training') {
    return { kind, drill: detail, before: name('before'), after: name('after'), ...extra };
  }

  return matchStage({ id: `m${index + 1}`, rule: kind, opponent: detail, cup, extra, name });
}

export function buildChapter({ number, format, team, heroAge, cups = {}, plan }) {
  const scenes = {};
  const sceneId = (part) => {
    const id = `c${number}-${part}`;

    scenes[id] = sceneOf(id);

    return id;
  };
  const named = Object.entries(cups).map(([id, cup]) => [
    id,
    cup.kind === 'group' ? { ...cup, failScene: sceneId(`${id}-fail`) } : cup,
  ]);
  const stages = plan.map((step, index) => stageFrom(step, index, sceneId));

  return {
    id: `chapter-${number}`,
    number,
    title: both(`Chapter ${number}`),
    format,
    team,
    heroAge,
    cups: Object.fromEntries(named),
    stages,
    scenes,
  };
}

const knockout = (name) => ({ name: both(name), kind: 'knockout' });

const group = (name, teams) => ({ name: both(name), kind: 'group', teams, advance: 2 });

export const FIXTURE_CHAPTERS = [
  buildChapter({
    number: 1,
    format: '7',
    team: 'village-school',
    heroAge: 'child',
    cups: { 'kids-cup': knockout('Kids Cup') },
    plan: [
      ['scene'],
      ['training', 'cone-dribble'],
      ['friendly', 'river-kids'],
      ['knockout', 'hill-kids', 'kids-cup', { round: both('Semi-final') }],
      ['knockout', 'city-stars', 'kids-cup', { rewards: { xp: 40, moves: ['naga-shot'] } }],
      ['scene'],
    ],
  }),
  buildChapter({
    number: 2,
    format: '11',
    team: 'town-high',
    heroAge: 'teen',
    cups: {
      'school-champ': group('School Championship', ['town-high', 'north-high', 'south-high']),
      'school-final': knockout('School Final'),
    },
    plan: [
      ['scene'],
      ['group', 'north-high', 'school-champ'],
      ['training', 'target-shot'],
      ['group', 'south-high', 'school-champ'],
      ['knockout', 'capital-elite', 'school-final'],
    ],
  }),
  buildChapter({
    number: 3,
    format: '11',
    team: 'nation-youth',
    heroAge: 'young',
    cups: {
      'asia-cup': group('Asia Cup', ['nation-youth', 'dragon-youth', 'tiger-youth', 'eagle-youth']),
      'asia-knockout': knockout('Asia Knockout'),
    },
    plan: [
      ['scene'],
      ['group', 'dragon-youth', 'asia-cup'],
      ['group', 'tiger-youth', 'asia-cup'],
      ['training', 'spirit-focus'],
      ['group', 'eagle-youth', 'asia-cup'],
      ['knockout', 'lion-youth', 'asia-knockout'],
      ['knockout', 'dragon-youth', 'asia-knockout', { rewards: { moves: ['twin-naga'] } }],
      ['scene'],
    ],
  }),
];

export const matchResult = (goalsFor, goalsAgainst, extra = {}) => ({
  goalsFor,
  goalsAgainst,
  penalties: null,
  unlocked: [],
  duelsWon: 0,
  goalsBySochetra: 0,
  ...extra,
});

export const trainingResult = (drill, grade = 'A', score = 1500) => ({ drill, score, grade });

export function memoryStorage(entries = {}) {
  const items = new Map(Object.entries(entries));

  return {
    items,
    getItem: (key) => (items.has(key) ? items.get(key) : null),
    setItem: (key, value) => items.set(key, String(value)),
  };
}

// play(stage, save) gives each stage's result; the log keeps the save before each stage and what
// the stage settled to
export function playCampaign({ save, chapters, teams = FIXTURE_TEAMS, play, limit = 300 }) {
  const log = [];
  let current = save;
  let stage = stageOf(current, chapters, teams);

  while (stage && log.length < limit) {
    const settled = settleStage(current, stage, play(stage, current));

    log.push({ stage, before: current, ...settled });
    current = settled.save;
    stage = stageOf(current, chapters, teams);
  }

  return { save: current, log };
}

export const stageAt = (chapters, chapter, stage, teams = FIXTURE_TEAMS) =>
  stageOf({ chapter, stage }, chapters, teams);
