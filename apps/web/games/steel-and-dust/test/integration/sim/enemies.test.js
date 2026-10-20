import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ENEMY_TYPES } from '../../../src/data/enemies/enemy-types.js';
import { knockOut } from '../../../src/sim/combat/knock-out.js';
import { fireEnemyShot } from '../../../src/sim/hazards/enemy-shots.js';
import { isDeflectable } from '../../../src/sim/hazards/shot-rules.js';
import { spawnEnemy } from '../../../src/sim/stage/spawn-enemy.js';
import { seededRandom } from '../../support/seeded-random.js';
import { createPlayingGame, runTicks } from '../../support/test-game.js';

const originalRandom = Math.random;

function arenaWith(kind, gap = 60) {
  const game = createPlayingGame();
  game.arena = { left: 0, right: 400 };
  game.player.x = 160;
  spawnEnemy(game, kind, 1);
  const enemy = game.fighters.find((fighter) => fighter.side === 'enemy');
  Object.assign(enemy, { entering: false, x: game.player.x + gap, facing: -1 });
  return { game, enemy };
}

// the hero stands still and cannot fall, so each fight runs its full length
function fight(game, ticks, watch) {
  for (let i = 0; i < ticks; i++) {
    runTicks(game, 1);
    game.player.hp = game.player.maxHp;
    watch?.();
  }
}

describe('every enemy type, fighting the hero', () => {
  beforeEach(() => {
    Math.random = seededRandom(11);
  });
  afterEach(() => {
    Math.random = originalRandom;
  });

  for (const [kind, type] of Object.entries(ENEMY_TYPES)) {
    it(`${type.name} closes in and attacks`, () => {
      const { game, enemy } = arenaWith(kind);
      const moves = new Set();
      fight(game, 1500, () => enemy.move && moves.add(enemy.move.id));
      expect(moves.size, type.name).toBeGreaterThan(0);
    });
  }

  it('lets a fire pot land at the hero, blast them and leave a patch of fire', () => {
    const { game, enemy } = arenaWith('bomber', 90);
    fireEnemyShot(game, enemy, 'bomb');
    for (let i = 0; i < 120 && game.projectiles.some((shot) => shot.kind === 'bomb'); i++) {
      runTicks(game, 1);
    }
    const fire = game.projectiles.find((shot) => shot.kind === 'fire');
    expect(fire).toBeDefined();
    expect(Math.abs(fire.x - 160)).toBeLessThan(24);
    expect(game.player.hp).toBeLessThan(game.player.maxHp);
  });

  it('sends a bolt fast enough to cross the arena, and lets the hero knock it back', () => {
    const { game, enemy } = arenaWith('sentry', 150);
    fireEnemyShot(game, enemy, 'bolt');
    const bolt = game.projectiles[0];
    expect(isDeflectable(bolt)).toBe(true);
    runTicks(game, 10);
    expect(bolt.x).toBeLessThan(enemy.x - 40);
  });

  it('has the witch slip away when the hero gets close', () => {
    const { game, enemy } = arenaWith('witch', 20);
    let farthest = 0;
    fight(game, 600, () => {
      farthest = Math.max(farthest, Math.abs(enemy.x - game.player.x));
    });
    expect(farthest).toBeGreaterThan(80);
  });

  it("only ends the mission when the mission's own boss falls", () => {
    const { game, enemy } = arenaWith('colossus');
    knockOut(game, enemy, 1);
    expect(game.clearTime).toBe(0);
    expect(game.banner.text).toBe('Rust Colossus down');
    spawnEnemy(game, 'khan', 1);
    knockOut(game, game.boss, 1);
    expect(game.clearTime).toBeGreaterThan(0);
    expect(game.banner.text).toBe('Mission complete');
  });
});
