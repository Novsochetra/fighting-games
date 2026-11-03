import { FINAL, SEMI_FINAL, groupMatch } from '../rounds.js';

const NAME = { en: 'Asian Youth Championship', km: 'ជើងឯកយុវជនអាស៊ី' };

const GROUP = 'asian-youth-group';

const KNOCKOUT = 'asian-youth-knockout';

export const CUPS = {
  [GROUP]: {
    name: NAME,
    kind: 'group',
    teams: ['cambodia-youth', 'japan-youth', 'thailand-youth', 'korea-youth'],
    advance: 2,
    failScene: 'ch3-group-fail',
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
  venue: 'asia-stadium',
  before: `${scenes}-before`,
  triggers,
  after: { win: `${scenes}-win`, lose: `${scenes}-lose`, draw: `${scenes}-draw` },
  opponentForm,
  teamForm,
});

const JAPAN_TRIGGERS = [
  { when: 'kickoff', scene: 'ch3-japan-kickoff' },
  { when: 'firstDuel', with: 'haruto', scene: 'ch3-japan-duel' },
  { when: 'goalAgainst', first: true, scene: 'ch3-japan-conceded' },
  { when: 'halfTime', scene: 'ch3-japan-halftime' },
];

const FINAL_TRIGGERS = [
  { when: 'kickoff', scene: 'ch3-final-kickoff' },
  { when: 'firstDuel', with: 'haruto', scene: 'ch3-final-duel' },
  { when: 'goalAgainst', first: true, scene: 'ch3-final-conceded' },
  { when: 'halfTime', scene: 'ch3-final-halftime' },
  {
    when: 'losingLate',
    minute: 75,
    scene: 'ch3-final-twin',
    unlock: 'twin-naga',
    boost: 'spirit',
  },
  { when: 'drawLate', minute: 80, scene: 'ch3-final-push', boost: 'spirit' },
  { when: 'specialGoal', move: 'twin-naga', scene: 'ch3-final-twin-goal' },
];

export const STAGES = [
  { kind: 'scene', scene: 'ch3-intro' },
  { kind: 'scene', scene: 'ch3-tension' },
  { kind: 'training', drill: 'target-shot', before: 'ch3-pass-before', after: 'ch3-pass-after' },
  { kind: 'scene', scene: 'ch3-airport' },
  groupStage({
    id: 'ch3-group-japan',
    number: 1,
    opponent: 'japan-youth',
    scenes: 'ch3-japan',
    triggers: JAPAN_TRIGGERS,
    // Haruto's Japan at their very best the first time they meet Sochetra, so a decent player
    // usually loses this opener (README "Losing once"); the final meets them as their table has them.
    // Haruto hunting Sochetra leaves their attack a man short, so the nerves of a first Asian
    // match take Cambodia down a little too
    opponentForm: { stats: 15 },
    teamForm: { stats: -5 },
  }),
  { kind: 'scene', scene: 'ch3-hotel-night' },
  groupStage({
    id: 'ch3-group-thailand',
    number: 2,
    opponent: 'thailand-youth',
    scenes: 'ch3-thailand',
  }),
  groupStage({
    id: 'ch3-group-korea',
    number: 3,
    opponent: 'korea-youth',
    scenes: 'ch3-korea',
    triggers: [{ when: 'firstDuel', with: 'minjun', scene: 'ch3-korea-duel' }],
  }),
  { kind: 'training', drill: 'spirit-focus', before: 'ch3-night-before', after: 'ch3-night-after' },
  {
    kind: 'match',
    id: 'ch3-semi',
    rule: 'knockout',
    cup: KNOCKOUT,
    round: SEMI_FINAL,
    opponent: 'iran-youth',
    venue: 'asia-stadium',
    before: 'ch3-semi-before',
    triggers: [{ when: 'firstDuel', with: 'farhad', scene: 'ch3-semi-duel' }],
    after: { win: 'ch3-semi-win', lose: 'ch3-semi-lose' },
    rewards: { xp: 10 },
  },
  { kind: 'scene', scene: 'ch3-final-eve' },
  {
    kind: 'match',
    id: 'ch3-final',
    rule: 'knockout',
    cup: KNOCKOUT,
    round: FINAL,
    opponent: 'japan-youth',
    venue: 'asia-stadium',
    before: 'ch3-final-before',
    triggers: FINAL_TRIGGERS,
    after: { win: 'ch3-final-win', lose: 'ch3-final-lose' },
    rewards: { xp: 20, moves: ['twin-naga'] },
  },
  { kind: 'scene', scene: 'ch3-ending' },
];
