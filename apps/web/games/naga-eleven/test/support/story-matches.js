import { matchSidesFor, newSave } from '../../src/campaign/index.js';
import { FORMATS } from '../../src/data/formats.js';
import { CHAPTERS } from '../../src/data/story/index.js';
import { TEAMS } from '../../src/data/teams/index.js';
import { createMatch } from '../../src/sim/create-match.js';
import { attachDuels } from '../../src/sim/duel/index.js';
import { drainEvents } from '../../src/sim/events.js';
import { tick } from '../../src/sim/tick.js';
import { checkTriggers, createWatch } from '../../src/story/index.js';
import { matchResult, playCampaign, trainingResult } from './campaign-fixtures.js';

const OPENER_RIVALS = ['japan-youth', 'brazil'];

const isOpener = (stage) => stage.rule === 'group' && OPENER_RIVALS.includes(stage.opponent);

// a player who plays every stage once: A grades, 2-1 wins with a goal of his own, and the two
// group openers lost 1-2
function playedOnce(stage) {
  if (stage.kind === 'training') {
    return trainingResult(stage.drill, 'A', 1500);
  }

  if (stage.kind !== 'match') {
    return {};
  }

  return isOpener(stage)
    ? matchResult(1, 2, { goalsBySochetra: 1, duelsWon: 2 })
    : matchResult(2, 1, { goalsBySochetra: 1, duelsWon: 2 });
}

// each story match with the save Sochetra comes to it with
export function storyMatches() {
  const { log } = playCampaign({
    save: newSave(),
    chapters: CHAPTERS,
    teams: TEAMS,
    play: playedOnce,
  });

  return log
    .filter((entry) => entry.stage.kind === 'match')
    .map((entry) => ({ stage: entry.stage, save: entry.before }));
}

export const storyMatch = (id) => storyMatches().find((entry) => entry.stage.id === id);

export const sidesOf = ({ stage, save }) => matchSidesFor(save, stage, TEAMS);

const heroOf = (match) =>
  match.players.find((player) => player.team === 0 && player.star === 'sochetra');

// what a story trigger does to the hero: the move it wakes and the gauge it fills
function applyTriggers(match, fired) {
  const hero = heroOf(match);

  for (const outcome of fired) {
    if (outcome.unlock && !hero.moves.includes(outcome.unlock)) {
      hero.moves = [...hero.moves, outcome.unlock];
    }

    if (outcome.boost === 'spirit') {
      hero.spirit = hero.spiritMax;
    }
  }
}

const COUNTERS = {
  goal: (count, { event, isHero }) => {
    if (event.team === 0) {
      count[isHero ? 'heroGoals' : 'mateGoals'] += 1;
    }
  },
  shot: (count, { player }) => {
    count.shots[player.team] += 1;
  },
  special: (count, { player, isHero }) => {
    count.specials[player.team] += 1;
    count.heroCutins += isHero ? 1 : 0;
  },
  skill: (count, { player }) => {
    count.skills[player.index] = (count.skills[player.index] ?? 0) + 1;
  },
  duel: (count) => {
    count.duels += 1;
  },
};

function countEvent(count, match, event) {
  const player = match.players[event.player ?? event.scorer];
  const isHero = player?.team === 0 && player.star === 'sochetra';

  COUNTERS[event.type]?.(count, { event, player, isHero });
}

const newCount = () => ({
  heroGoals: 0,
  mateGoals: 0,
  shots: [0, 0],
  specials: [0, 0],
  duels: 0,
  heroCutins: 0,
  skills: {},
});

// `human` is a player that sets the keys before each tick (test/support/decent-human); with none
// the computer plays both sides
export function playStoryMatch({ stage, save }, { seed, halfShare = 1, human = null }) {
  const format = stage.at.format;
  const halfSeconds = FORMATS[format].halfSeconds * halfShare;
  const teams = sidesOf({ stage, save });
  const match = createMatch({ seed, humanTeam: human ? 0 : null, format, teams, halfSeconds });
  const watch = createWatch(stage.triggers ?? []);
  const count = newCount();

  attachDuels(match);

  while (match.phase !== 'over') {
    human?.step(match);
    tick(match);

    const events = drainEvents(match);

    events.forEach((event) => countEvent(count, match, event));
    applyTriggers(match, checkTriggers(watch, match, events));
  }

  return { ...count, score: [...match.score] };
}
