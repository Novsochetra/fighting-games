import { updateScene } from '../../src/story/scene.js';

// sample scenes, triggers and match-like objects for the story's tests, written as a chapter
// writes them

export const LONG_ENGLISH =
  'Long ago, when the rains came early, a great Naga rose from the Mekong. It guarded every ' +
  'village on the river, and it gave its strength to one child who would never give up. ' +
  'Listen well, Sochetra: that strength sleeps in you too.';

export const LEGEND_SCENE = {
  backdrop: 'home-night',
  mood: 'calm',
  lines: [
    {
      speaker: 'narrator',
      text: {
        en: 'Chrey Village, Kampong Cham. The night before the first match.',
        km: 'ភូមិជ្រៃ ខេត្តកំពង់ចាម។ យប់មុនការប្រកួតដំបូង។',
      },
    },
    {
      speaker: 'ta-sok',
      mood: 'happy',
      side: 'left',
      text: {
        en: LONG_ENGLISH,
        km: 'កាលពីយូរយារណាស់មកហើយ មាននាគមួយក្រោកចេញពីទន្លេមេគង្គ ហើយការពារភូមិទាំងអស់។',
      },
    },
    {
      speaker: 'sochetra',
      mood: 'determined',
      side: 'right',
      text: { en: 'Then I will wake it, Grandpa!', km: 'ចៅនឹងដាស់វា លោកតា!' },
    },
    {
      speaker: 'ta-sok',
      mood: 'neutral',
      side: 'left',
      text: { en: 'Sleep first. Dreams come before goals.', km: 'គេងសិន។ សុបិនមកមុនគ្រាប់បាល់។' },
    },
  ],
};

export const VILLAGE_SCENE = {
  backdrop: 'village-dawn',
  mood: 'hope',
  lines: [
    {
      speaker: 'villager',
      side: 'left',
      name: { en: 'Fisherman', km: 'អ្នកនេសាទ' },
      text: 'Look at the boy run!',
    },
    { speaker: 'villager', side: 'right', text: 'He kicks like a buffalo!' },
    { speaker: 'dara', mood: 'happy', side: 'left', text: 'That is my best friend!' },
    { speaker: 'rithy', mood: 'smirk', side: 'right', text: 'We will see in Phnom Penh.' },
  ],
};

export const SHORT_SCENE = {
  backdrop: 'black',
  mood: 'tense',
  lines: [
    { speaker: 'coach-vannak', side: 'left', text: 'Go.' },
    { speaker: 'sochetra', side: 'right', mood: 'determined', text: 'Yes, Coach.' },
  ],
};

export const FINAL_TRIGGERS = [
  { when: 'kickoff', scene: 'ch1-final-kickoff' },
  { when: 'firstDuel', with: 'rithy', scene: 'ch1-final-rithy' },
  { when: 'goalAgainst', first: true, scene: 'ch1-final-behind' },
  { when: 'halfTime', scene: 'ch1-final-half' },
  { when: 'secondHalf', scene: 'ch1-final-second' },
  { when: 'losingLate', minute: 30, scene: 'ch1-final-naga', unlock: 'naga-shot', boost: 'spirit' },
  { when: 'specialGoal', move: 'naga-shot', scene: 'ch1-final-naga-goal' },
  { when: 'goalFor', by: 'sochetra', scene: 'ch1-final-sochetra-scores' },
];

const player = (index, team, star = null) => ({ index, team, star, id: `p${index}` });

// a 7 v 7 with Sochetra (index 6) for the human side and Rithy (index 13) for the other
export function fakeMatch(fields = {}) {
  const players = Array.from({ length: 14 }, (_, i) => player(i, i < 7 ? 0 : 1));

  players[6].star = 'sochetra';
  players[0].star = 'dara';
  players[13].star = 'rithy';

  return {
    tick: 0,
    phase: 'kickoff',
    half: 1,
    minute: 0,
    format: '7',
    score: [0, 0],
    humanTeam: 0,
    players,
    events: [],
    ...fields,
  };
}

export const whistle = (kind, half = 1) => ({ type: 'whistle', kind, half });

export const goal = (team, scorer = null, move = null) => ({ type: 'goal', team, scorer, move });

export const duel = (attacker, defender) => ({
  type: 'duel',
  duel: { attacker, defender, kind: 'dribble' },
});

// the button up, a press, and a few ticks with it up again, as a player taps it
export function press(state, { gap = 3 } = {}) {
  updateScene(state, { confirm: false });
  updateScene(state, { confirm: true });

  for (let i = 0; i < gap; i += 1) {
    updateScene(state, { confirm: false });
  }
}

export function idle(state, ticks) {
  for (let i = 0; i < ticks; i += 1) {
    updateScene(state, {});
  }
}
