import { describe, expect, it } from 'vitest';
import { FORMATS } from '../../../src/data/formats.js';
import { createMatch } from '../../../src/sim/create-match.js';
import { attachDuels } from '../../../src/sim/duel/index.js';
import { drainEvents } from '../../../src/sim/events.js';
import { tick } from '../../../src/sim/tick.js';
import { checkTriggers, createWatch } from '../../../src/story/index.js';
import { createDecentHuman } from '../../support/decent-human/index.js';
import { sidesOf, storyMatch } from '../../support/story-matches.js';

// The second play test: a rival hunted Sochetra until the two met in a duel, however long that
// took. In these matches, with a decent player, Rithy (the chapter 2 final) and Lukas (the
// chapter 4 semi-final) hunted him for two thirds to four fifths of the play, out of their sides'
// game and seldom on the ball. The hunt now lasts the first part of a match at most.
const LONG_HUNTS = [
  ['ch2-final', 'rithy', 13],
  ['ch2-final', 'rithy', 14],
  ['ch2-final', 'rithy', 19],
  ['ch4-semi', 'lukas', 4],
  ['ch4-semi', 'lukas', 11],
];

const seedOf = (number) => number * 7919 + 13;

const MOST_HUNTED = 0.45;

const SLOW = 60000;

function wakeHero(match, fired) {
  const hero = match.players.find((player) => player.team === 0 && player.star === 'sochetra');

  for (const outcome of fired) {
    if (outcome.unlock && !hero.moves.includes(outcome.unlock)) {
      hero.moves = [...hero.moves, outcome.unlock];
    }

    if (outcome.boost === 'spirit') {
      hero.spirit = hero.spiritMax;
    }
  }
}

// the share of the match's play the rival spends hunting Sochetra
function huntedShareOf(id, rivalStar, seed) {
  const entry = storyMatch(id);
  const { halfSeconds } = FORMATS[entry.stage.at.format];
  const match = attachDuels(
    createMatch({ seed, humanTeam: 0, teams: sidesOf(entry), halfSeconds }),
  );
  const rival = match.players.find((player) => player.team === 1 && player.star === rivalStar);
  const watch = createWatch(entry.stage.triggers);
  const human = createDecentHuman(seed);
  const ticks = { play: 0, hunting: 0 };

  while (match.phase !== 'over') {
    const inPlay = match.phase === 'play';

    human.step(match);
    tick(match);
    wakeHero(match, checkTriggers(watch, match, drainEvents(match)));

    if (inPlay) {
      ticks.play += 1;
      ticks.hunting += match.plans[1].hunt?.hunter === rival.index ? 1 : 0;
    }
  }

  return ticks.hunting / ticks.play;
}

describe('a rival’s hunt for Sochetra', () => {
  it.each(LONG_HUNTS)(
    'in %s lasts the first part of the match at most, not %s’s whole match (seed %i)',
    (id, rival, number) => {
      expect(huntedShareOf(id, rival, seedOf(number))).toBeLessThan(MOST_HUNTED);
    },
    SLOW,
  );
});
