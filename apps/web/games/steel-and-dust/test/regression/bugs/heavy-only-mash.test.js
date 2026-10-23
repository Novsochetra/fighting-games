import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { spawnEnemy } from '../../../src/sim/stage/spawn-enemy.js';
import { seededRandom } from '../../support/seeded-random.js';
import { createPlayingGame, runTicks, tap } from '../../support/test-game.js';

// Bug: pressing nothing but Heavy won the game. Each heavy stunned long and knocked the raider
// down, so raiders never got a turn, and Heavy cost nothing. Heavy now spends the bar that only
// Light blows fill, so a hero mashing Heavy runs dry while one who mixes keeps hitting hard
const originalRandom = Math.random;

function mash(pattern) {
  const game = createPlayingGame();
  runTicks(game, 30);
  spawnEnemy(game, 'grunt', 1);
  const raider = game.fighters.find((fighter) => fighter.side === 'enemy');
  Object.assign(raider, { entering: false, x: game.player.x + 18, hp: 5000 });
  raider.maxHp = 5000;
  let heavies = 0;
  for (let press = 0; press < 120; press++) {
    raider.ai.cooldown = 9999;
    raider.x = game.player.x + 18;
    game.player.facing = 1;
    tap(game, pattern[press % pattern.length]);
    runTicks(game, 11);
    heavies += game.player.move?.id === 'K1' ? 1 : 0;
  }
  return { heavies, damage: 5000 - raider.hp };
}

describe('mashing Heavy', () => {
  beforeEach(() => {
    Math.random = seededRandom(12);
  });
  afterEach(() => {
    Math.random = originalRandom;
  });

  it('never lands a heavy from an empty bar, while light then heavy does', () => {
    const heavyOnly = mash(['heavy']);
    const mixed = mash(['light', 'light', 'light', 'heavy']);
    expect(heavyOnly).toEqual({ heavies: 0, damage: 0 });
    expect(mixed.heavies).toBeGreaterThan(0);
    expect(mixed.damage).toBeGreaterThan(0);
  });
});
