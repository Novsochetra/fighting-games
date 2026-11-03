import { describe, expect, it } from 'vitest';
import { FORMATS } from '../../../src/data/formats.js';
import { createMatch } from '../../../src/sim/create-match.js';
import { attachDuels } from '../../../src/sim/duel/index.js';
import { drainEvents } from '../../../src/sim/events.js';
import { tick } from '../../../src/sim/tick.js';
import { checkTriggers, createWatch } from '../../../src/story/index.js';
import { duelStars } from '../../../src/story/match-reads.js';
import { createDecentHuman } from '../../support/decent-human/index.js';
import { sidesOf, storyMatch } from '../../support/story-matches.js';

// In the finals of chapters 1 and 2 Rithy plays up front at the other end from Sochetra, so with a
// decent player on Sochetra's side the two met in no match of eight in either final, and the scene
// of the rival meeting the hero face to face never played. Rithy now hunts Sochetra until they meet.
// The rivals of chapters 3 and 4 missed theirs in one match of eight to one of two, and hunt too.
// The hunt lasts only the first part of a match (src/sim/hunts.js), so the matches play full
// halves: a short match gives it less time.
const seedsOf = (count) => Array.from({ length: count }, (_, i) => (i + 1) * 7919 + 13);

const SLOW = { timeout: 60000 };

// what the story does to the hero as the match goes, as the game does: a move woken, a full gauge
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

const rivalSceneOf = (stage) =>
  stage.triggers.find((trigger) => trigger.when === 'firstDuel' && trigger.with).scene;

// the stars in the duel the rival's scene plays at, or null if it never plays
function sceneDuelOf(entry, seed) {
  const { stage } = entry;
  const scene = rivalSceneOf(stage);
  const halfSeconds = FORMATS[stage.at.format].halfSeconds;
  const match = createMatch({ seed, humanTeam: 0, teams: sidesOf(entry), halfSeconds });
  const watch = createWatch(stage.triggers);
  const human = createDecentHuman(seed);

  attachDuels(match);

  while (match.phase !== 'over') {
    human.step(match);
    tick(match);

    const events = drainEvents(match);
    const fired = checkTriggers(watch, match, events);

    if (fired.some((outcome) => outcome.scene === scene)) {
      return duelStars(events.find((event) => event.type === 'duel').duel, match).sort();
    }

    wakeHero(match, fired);
  }

  return null;
}

describe('the rival’s duel scene in the first two finals', () => {
  it('plays at a duel of Rithy’s with Sochetra in nearly every match', SLOW, () => {
    for (const id of ['ch1-final', 'ch2-final']) {
      const entry = storyMatch(id);
      const duels = seedsOf(8).map((seed) => sceneDuelOf(entry, seed));
      const played = duels.filter(Boolean);

      expect(played.length, id).toBeGreaterThanOrEqual(6);
      expect(played, id).toEqual(played.map(() => ['rithy', 'sochetra']));
    }
  });
});

const LATER_RIVALS = [
  ['ch3-group-japan', 'haruto'],
  ['ch3-group-korea', 'minjun'],
  ['ch3-final', 'haruto'],
  ['ch4-group-brazil', 'rafael'],
  ['ch4-semi', 'lukas'],
  ['ch4-final', 'rafael'],
];

describe("the rivals' duel scenes in chapters 3 and 4", () => {
  it.each(LATER_RIVALS)(
    'play in %s at a duel of %s’s with Sochetra in nearly every match',
    (id, rival) => {
      const entry = storyMatch(id);
      const played = seedsOf(6)
        .map((seed) => sceneDuelOf(entry, seed))
        .filter(Boolean);

      expect(played.length, id).toBeGreaterThanOrEqual(5);
      expect(played, id).toEqual(played.map(() => [rival, 'sochetra'].sort()));
    },
    SLOW.timeout,
  );
});
