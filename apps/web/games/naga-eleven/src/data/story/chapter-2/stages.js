import { FINAL, SEMI_FINAL, groupMatch } from '../rounds.js';

const NAME = { en: 'National High School Championship', km: 'ជើងឯកបាល់ទាត់វិទ្យាល័យថ្នាក់ជាតិ' };

const GROUP = 'high-school-group';

const KNOCKOUT = 'high-school-knockout';

export const CUPS = {
  [GROUP]: {
    name: NAME,
    kind: 'group',
    teams: ['kampong-cham-high', 'siem-reap-high', 'battambang-high'],
    advance: 2,
    failScene: 'ch2-group-fail',
  },
  [KNOCKOUT]: { name: NAME, kind: 'knockout' },
};

const FINAL_TRIGGERS = [
  { when: 'kickoff', scene: 'ch2-final-kickoff' },
  { when: 'firstDuel', with: 'rithy', scene: 'ch2-final-duel' },
  { when: 'goalAgainst', first: true, scene: 'ch2-final-conceded' },
  { when: 'specialGoal', move: 'preah-khan-strike', scene: 'ch2-final-sword' },
  { when: 'halfTime', scene: 'ch2-final-halftime' },
  {
    when: 'losingLate',
    minute: 75,
    scene: 'ch2-final-garuda',
    unlock: 'garuda-volley',
    boost: 'spirit',
  },
  { when: 'drawLate', minute: 80, scene: 'ch2-final-push', boost: 'spirit' },
  { when: 'specialGoal', move: 'garuda-volley', scene: 'ch2-final-garuda-goal' },
];

export const STAGES = [
  { kind: 'scene', scene: 'ch2-intro' },
  { kind: 'scene', scene: 'ch2-sokha' },
  {
    kind: 'training',
    drill: 'cone-dribble',
    before: 'ch2-temple-before',
    after: 'ch2-temple-after',
    rewards: { moves: ['hanuman-leap'] },
  },
  { kind: 'training', drill: 'target-shot', before: 'ch2-wall-before', after: 'ch2-wall-after' },
  {
    kind: 'match',
    id: 'ch2-group-siem-reap',
    rule: 'group',
    cup: GROUP,
    round: groupMatch(1),
    opponent: 'siem-reap-high',
    venue: 'provincial-ground',
    before: 'ch2-siem-reap-before',
    triggers: [{ when: 'kickoff', scene: 'ch2-siem-reap-kickoff' }],
    after: { win: 'ch2-siem-reap-win', lose: 'ch2-siem-reap-lose', draw: 'ch2-siem-reap-draw' },
  },
  {
    kind: 'match',
    id: 'ch2-group-battambang',
    rule: 'group',
    cup: GROUP,
    round: groupMatch(2),
    opponent: 'battambang-high',
    venue: 'provincial-ground',
    before: 'ch2-battambang-before',
    after: {
      win: 'ch2-battambang-win',
      lose: 'ch2-battambang-lose',
      draw: 'ch2-battambang-draw',
    },
  },
  { kind: 'scene', scene: 'ch2-sokha-story' },
  { kind: 'training', drill: 'spirit-focus', before: 'ch2-focus-before', after: 'ch2-focus-after' },
  {
    kind: 'match',
    id: 'ch2-semi',
    rule: 'knockout',
    cup: KNOCKOUT,
    round: SEMI_FINAL,
    opponent: 'kampot-high',
    venue: 'city-school-stadium',
    before: 'ch2-semi-before',
    triggers: [{ when: 'specialGoal', move: 'kite-header', scene: 'ch2-semi-kite' }],
    after: { win: 'ch2-semi-win', lose: 'ch2-semi-lose' },
    rewards: { xp: 10 },
  },
  { kind: 'scene', scene: 'ch2-rival' },
  {
    kind: 'match',
    id: 'ch2-final',
    rule: 'knockout',
    cup: KNOCKOUT,
    round: FINAL,
    opponent: 'phnom-penh-elite',
    venue: 'national-stadium',
    before: 'ch2-final-before',
    triggers: FINAL_TRIGGERS,
    after: { win: 'ch2-final-win', lose: 'ch2-final-lose' },
    rewards: { xp: 20, moves: ['garuda-volley'] },
  },
  { kind: 'scene', scene: 'ch2-letter' },
];
