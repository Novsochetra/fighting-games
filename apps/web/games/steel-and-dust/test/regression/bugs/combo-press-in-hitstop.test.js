import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { HEROES } from '../../../src/data/heroes.js';
import { heroMoves } from '../../../src/data/styles/index.js';
import { startMove } from '../../../src/sim/fighters/actions.js';
import { spawnEnemy } from '../../../src/sim/stage/spawn-enemy.js';
import { seededRandom } from '../../support/seeded-random.js';
import { createPlayingGame, runTicks, tap } from '../../support/test-game.js';

// Bug: a press made as a blow landed was dropped, so a string mashed in time with its hits stopped
// after the first one. The press aged through the hit's freeze, when the hero cannot act, and ran
// out before the next move of the string could start; it now waits the freeze out
const originalRandom = Math.random;
// longer than any move of a string, its freeze included
const TICK_LIMIT = 90;

const stringLinks = HEROES.flatMap((hero) =>
  Object.values(heroMoves(hero.id, hero.weapon))
    .filter((move) => /^L\d$/.test(move.id) && move.next.light)
    .map((move) => [hero.id, move.id, move.next.light]),
);

function swingAtRaider(heroId, moveId) {
  const game = createPlayingGame({ settings: { hero: heroId } });
  runTicks(game, 30);
  spawnEnemy(game, 'grunt', 1);
  const raider = game.fighters.find((fighter) => fighter.side === 'enemy');

  Object.assign(raider, { entering: false, x: game.player.x + 16, hp: 5000, maxHp: 5000 });
  raider.ai.cooldown = 9999;
  game.player.facing = 1;
  startMove(game, game.player, moveId);

  return game;
}

// taps light as each blow lands, as a player keeping time with the hits does
function tapOnEachImpact(game, moveId) {
  const hero = game.player;
  let impacts = 0;

  for (let i = 0; i < TICK_LIMIT && hero.move?.id === moveId; i++) {
    const frozen = hero.hitstop > 0;
    runTicks(game, 1);
    if (!frozen && hero.hitstop > 0) {
      impacts++;
      tap(game, 'light');
    }
  }

  return impacts;
}

describe('a light string pressed on each impact', () => {
  beforeEach(() => {
    Math.random = seededRandom(5);
  });
  afterEach(() => {
    Math.random = originalRandom;
  });

  it.each(stringLinks)("%s's %s chains into %s", (heroId, moveId, nextId) => {
    const game = swingAtRaider(heroId, moveId);

    expect(tapOnEachImpact(game, moveId)).toBeGreaterThan(0);
    expect(game.player.move?.id).toBe(nextId);
  });
});
