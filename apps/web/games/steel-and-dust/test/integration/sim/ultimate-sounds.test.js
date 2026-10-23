import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { spawnEnemy } from '../../../src/sim/stage/spawn-enemy.js';
import { seededRandom } from '../../support/seeded-random.js';
import { createPlayingGame, runTicks, tap } from '../../support/test-game.js';

const originalRandom = Math.random;
const WEAPON_HITS = ['blade', 'blunt', 'pierce'];

// a hero's whole ultimate against three raiders, with every sound it asks for, in order
function ultimateSounds(hero) {
  const played = [];
  const game = createPlayingGame({ settings: { hero }, io: { sfx: (key) => played.push(key) } });
  runTicks(game, 30);
  spawnEnemy(game, 'grunt', 1);
  spawnEnemy(game, 'scrapper', 1);
  spawnEnemy(game, 'knife', -1);
  game.fighters
    .filter((fighter) => fighter.side === 'enemy')
    .forEach((raider, i) => {
      Object.assign(raider, { entering: false, x: game.player.x + [70, 140, -60][i], hp: 400 });
      raider.maxHp = 400;
      raider.ai.cooldown = 999;
    });
  game.ultMeter = 100;
  played.length = 0;
  tap(game, 'ult');
  for (let tick = 0; game.player.state === 'ult' && tick < 600; tick++) {
    runTicks(game, 1);
  }
  return played;
}

describe('the sounds of an ultimate', () => {
  beforeEach(() => {
    Math.random = seededRandom(23);
  });
  afterEach(() => {
    Math.random = originalRandom;
  });

  it.each(['bokator', 'moss', 'angkor'])(
    '%s: the press plays the charge, and every blow on the hero side bursts',
    (hero) => {
      const played = ultimateSounds(hero);
      expect(played[0]).toBe('ult');
      expect(played.filter((key) => key === 'ultHit').length).toBeGreaterThan(3);
      expect(played.filter((key) => WEAPON_HITS.includes(key))).toEqual([]);
      expect(played).toContain('ultEnd');
    },
  );
});
