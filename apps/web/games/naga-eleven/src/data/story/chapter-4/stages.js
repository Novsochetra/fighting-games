import { FINAL, SEMI_FINAL, groupMatch } from '../rounds.js';

const NAME = { en: 'World Championship', km: 'ជើងឯកពិភពលោក' };

const GROUP = 'world-group';

const KNOCKOUT = 'world-knockout';

export const CUPS = {
  [GROUP]: {
    name: NAME,
    kind: 'group',
    teams: ['cambodia', 'brazil', 'nigeria', 'mexico'],
    advance: 2,
    failScene: 'ch4-group-fail',
  },
  [KNOCKOUT]: { name: NAME, kind: 'knockout' },
};

const groupStage = ({ id, number, opponent, scenes, triggers, opponentForm, teamForm }) => ({
  kind: 'match',
  id,
  rule: 'group',
  cup: GROUP,
  round: groupMatch(number),
  opponent,
  venue: 'world-stadium',
  before: `${scenes}-before`,
  triggers,
  after: { win: `${scenes}-win`, lose: `${scenes}-lose`, draw: `${scenes}-draw` },
  opponentForm,
  teamForm,
});

const knockoutStage = ({ id, round, opponent, triggers, rewards }) => ({
  kind: 'match',
  id,
  rule: 'knockout',
  cup: KNOCKOUT,
  round,
  opponent,
  venue: 'world-stadium',
  before: `${id}-before`,
  triggers,
  after: { win: `${id}-win`, lose: `${id}-lose` },
  rewards,
});

const BRAZIL_TRIGGERS = [
  { when: 'kickoff', scene: 'ch4-brazil-kickoff' },
  { when: 'firstDuel', with: 'rafael', scene: 'ch4-brazil-duel' },
  { when: 'goalAgainst', first: true, scene: 'ch4-brazil-conceded' },
  { when: 'halfTime', scene: 'ch4-brazil-halftime' },
];

const FINAL_TRIGGERS = [
  { when: 'kickoff', scene: 'ch4-final-kickoff' },
  { when: 'firstDuel', with: 'rafael', scene: 'ch4-final-duel' },
  { when: 'goalAgainst', first: true, scene: 'ch4-final-conceded' },
  { when: 'halfTime', scene: 'ch4-final-halftime' },
  {
    when: 'losingLate',
    minute: 75,
    scene: 'ch4-final-seven',
    unlock: 'seven-headed-naga',
    boost: 'spirit',
  },
  { when: 'drawLate', minute: 80, scene: 'ch4-final-push', boost: 'spirit' },
  { when: 'specialGoal', move: 'seven-headed-naga', scene: 'ch4-final-seven-goal' },
];

export const STAGES = [
  { kind: 'scene', scene: 'ch4-intro' },
  { kind: 'scene', scene: 'ch4-arrival' },
  { kind: 'training', drill: 'cone-dribble', before: 'ch4-cones-before', after: 'ch4-cones-after' },
  groupStage({
    id: 'ch4-group-brazil',
    number: 1,
    opponent: 'brazil',
    scenes: 'ch4-brazil',
    triggers: BRAZIL_TRIGGERS,
    // Rafael's Brazil at their very best and Cambodia's teammates nervous at their first World
    // Championship, so a decent player usually loses this opener (README "Losing once"). Brazil's
    // table is near the top of the stat scale, so their form alone cannot lift them far enough
    opponentForm: { stats: 10 },
    teamForm: { stats: -11 },
  }),
  { kind: 'scene', scene: 'ch4-letters' },
  groupStage({
    id: 'ch4-group-nigeria',
    number: 2,
    opponent: 'nigeria',
    scenes: 'ch4-nigeria',
    triggers: [{ when: 'specialGoal', move: 'chrey-lightning', scene: 'ch4-nigeria-lightning' }],
  }),
  groupStage({ id: 'ch4-group-mexico', number: 3, opponent: 'mexico', scenes: 'ch4-mexico' }),
  { kind: 'training', drill: 'spirit-focus', before: 'ch4-focus-before', after: 'ch4-focus-after' },
  knockoutStage({
    id: 'ch4-semi',
    round: SEMI_FINAL,
    opponent: 'germany',
    triggers: [{ when: 'firstDuel', with: 'lukas', scene: 'ch4-semi-duel' }],
    rewards: { xp: 10 },
  }),
  { kind: 'scene', scene: 'ch4-final-eve' },
  knockoutStage({
    id: 'ch4-final',
    round: FINAL,
    opponent: 'brazil',
    triggers: FINAL_TRIGGERS,
    rewards: { xp: 20, moves: ['seven-headed-naga'] },
  }),
  { kind: 'scene', scene: 'ch4-chrey' },
  { kind: 'scene', scene: 'ch4-epilogue-angkor' },
  { kind: 'scene', scene: 'ch4-epilogue-chrey' },
];
