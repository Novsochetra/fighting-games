import { FINAL, FRIENDLY, SEMI_FINAL } from '../rounds.js';

export const CUPS = {
  'primary-cup': {
    name: { en: 'National Primary Schools Cup', km: 'ពានរង្វាន់បាល់ទាត់បឋមសិក្សាថ្នាក់ជាតិ' },
    kind: 'knockout',
  },
};

// a 7 v 7 match lasts 40 football minutes, so "late" here is the last eight
const FINAL_TRIGGERS = [
  { when: 'kickoff', scene: 'ch1-final-kickoff' },
  { when: 'firstDuel', with: 'rithy', scene: 'ch1-final-duel' },
  { when: 'goalAgainst', first: true, scene: 'ch1-final-conceded' },
  { when: 'halfTime', scene: 'ch1-final-halftime' },
  {
    when: 'losingLate',
    minute: 32,
    scene: 'ch1-final-naga',
    unlock: 'naga-shot',
    boost: 'spirit',
  },
  { when: 'drawLate', minute: 35, scene: 'ch1-final-push', boost: 'spirit' },
  { when: 'specialGoal', move: 'naga-shot', scene: 'ch1-final-naga-goal' },
];

export const STAGES = [
  { kind: 'scene', scene: 'ch1-opening' },
  { kind: 'scene', scene: 'ch1-market' },
  { kind: 'scene', scene: 'ch1-legend' },
  { kind: 'scene', scene: 'ch1-coach' },
  {
    kind: 'training',
    drill: 'cone-dribble',
    before: 'ch1-dribble-before',
    after: 'ch1-dribble-after',
  },
  {
    kind: 'match',
    id: 'ch1-friendly',
    rule: 'friendly',
    round: FRIENDLY,
    opponent: 'neighbor-village',
    venue: 'village-field',
    before: 'ch1-friendly-before',
    triggers: [
      { when: 'kickoff', scene: 'ch1-friendly-kickoff' },
      { when: 'minute', at: 8, scene: 'ch1-friendly-defend' },
      { when: 'goalFor', first: true, scene: 'ch1-friendly-first-goal' },
      { when: 'combo', level: 3, scene: 'ch1-friendly-combo' },
    ],
    after: { win: 'ch1-friendly-win', lose: 'ch1-friendly-lose', draw: 'ch1-friendly-draw' },
  },
  { kind: 'training', drill: 'target-shot', before: 'ch1-shot-before', after: 'ch1-shot-after' },
  {
    kind: 'match',
    id: 'ch1-semi',
    rule: 'knockout',
    cup: 'primary-cup',
    round: SEMI_FINAL,
    opponent: 'riverside-school',
    venue: 'provincial-ground',
    before: 'ch1-semi-before',
    triggers: [
      { when: 'skill', first: true, scene: 'ch1-semi-skill' },
      { when: 'goalAgainst', first: true, scene: 'ch1-semi-conceded' },
    ],
    after: { win: 'ch1-semi-win', lose: 'ch1-semi-lose' },
    rewards: { xp: 10 },
  },
  { kind: 'training', drill: 'spirit-focus', before: 'ch1-river-before', after: 'ch1-river-after' },
  { kind: 'scene', scene: 'ch1-city' },
  {
    kind: 'match',
    id: 'ch1-final',
    rule: 'knockout',
    cup: 'primary-cup',
    round: FINAL,
    opponent: 'royal-kids',
    venue: 'city-school-stadium',
    before: 'ch1-final-before',
    triggers: FINAL_TRIGGERS,
    after: { win: 'ch1-final-win', lose: 'ch1-final-lose' },
    rewards: { xp: 20, moves: ['naga-shot'] },
  },
  { kind: 'scene', scene: 'ch1-ending' },
];
