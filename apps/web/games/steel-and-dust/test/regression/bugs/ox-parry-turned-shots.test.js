import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { startMove } from '../../../src/sim/fighters/actions.js';
import { spawnSlashWave } from '../../../src/sim/hazards/projectiles.js';
import { spawnShockwave } from '../../../src/sim/hazards/shockwaves.js';
import { raiseThorn } from '../../../src/sim/summons/thorns.js';
import { spawnEnemy } from '../../../src/sim/stage/spawn-enemy.js';
import { seededRandom } from '../../support/seeded-random.js';
import { createPlayingGame, runTicks } from '../../support/test-game.js';

// Bug: a Shade's thorns, slash wave or shockwave landing on the Warden Ox's raised guard crashed
// the game. Those hit through a stand-in attacker on the hero's side, so the parry took it for the
// hero and tried to make it reel, and the stand-in has none of a fighter's state
const originalRandom = Math.random;
const GUARD_UP = 20;
const THORN_HIT = { damage: 6, knockback: [0.6, -4.4], launch: true, hitstop: 5, hitstun: 22 };

function guardingOx() {
  const game = createPlayingGame();
  game.missionIndex = 9;
  game.arena = { left: 0, right: 384 };
  game.player.x = 120;
  spawnEnemy(game, 'brute', 1);
  const ox = game.boss;
  Object.assign(ox, { entering: false, x: game.player.x + 60, facing: -1 });
  ox.ai.cooldown = 9999;
  startMove(game, ox, 'guardCounter');
  runTicks(game, GUARD_UP);
  return { game, ox };
}

const BLOWS = {
  thorns: (game, ox) => raiseThorn(game, { x: ox.x - 10, scale: 1, hit: THORN_HIT }),
  'slash wave': (game) => spawnSlashWave(game, game.player, { waveDamage: 9, waveSpeed: 7.5 }),
  shockwave: (game) => spawnShockwave(game, game.player),
};

describe("the Warden Ox's guard against what a Shade sends at him", () => {
  beforeEach(() => {
    Math.random = seededRandom(10);
  });
  afterEach(() => {
    Math.random = originalRandom;
  });

  it.each(Object.keys(BLOWS))('turns the %s aside without a counter', (blow) => {
    const { game, ox } = guardingOx();
    const hp = ox.hp;
    const moves = new Set();
    BLOWS[blow](game, ox);
    for (let tick = 0; tick < 40; tick++) {
      runTicks(game, 1);
      ox.ai.cooldown = 9999;
      moves.add(ox.move?.id);
    }
    expect(game.floaters.some((floater) => floater.text === 'parry!')).toBe(true);
    expect(ox.hp).toBe(hp);
    expect(moves.has('guardStrike')).toBe(false);
    expect(game.player.state).not.toBe('hurt');
    expect(game.player.hp).toBe(game.player.maxHp);
  });
});
