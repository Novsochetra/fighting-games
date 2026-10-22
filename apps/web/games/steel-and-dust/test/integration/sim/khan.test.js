import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { startMove } from '../../../src/sim/fighters/actions.js';
import { spawnCrescent } from '../../../src/sim/hazards/crescents.js';
import { spawnEnemy } from '../../../src/sim/stage/spawn-enemy.js';
import { groundAt } from '../../../src/sim/stage/terrain.js';
import { seededRandom } from '../../support/seeded-random.js';
import { createPlayingGame, runTicks } from '../../support/test-game.js';

const originalRandom = Math.random;

function khanArena({ gap = 120, hp } = {}) {
  const game = createPlayingGame();
  game.arena = { left: 0, right: 400 };
  game.player.x = 140;
  spawnEnemy(game, 'khan', 1);
  const khan = game.boss;
  Object.assign(khan, { entering: false, x: game.player.x + gap, facing: -1 });
  khan.hp = hp ?? khan.maxHp;
  return { game, khan };
}

const raiders = (game) =>
  game.fighters.filter((fighter) => fighter.side === 'enemy' && !fighter.def.boss);

describe('Gravel Khan in a fight', () => {
  beforeEach(() => {
    Math.random = seededRandom(5);
  });
  afterEach(() => {
    Math.random = originalRandom;
  });

  it("looses three crescent waves with Khan's Tempest, which knock down a hero who stands", () => {
    const { game, khan } = khanArena({ hp: 70 });
    startMove(game, khan, 'tempest');
    const waves = new Set();
    let knockedDown = false;
    for (let i = 0; i < 180; i++) {
      runTicks(game, 1);
      game.projectiles
        .filter((shot) => shot.kind === 'crescent')
        .forEach((shot) => waves.add(shot));
      knockedDown ||= game.player.state === 'juggle' || game.player.state === 'down';
    }
    expect(waves.size).toBe(3);
    expect(knockedDown).toBe(true);
  });

  it('cannot be knocked out of his ultimate while he gathers himself', () => {
    const { game, khan } = khanArena({ hp: 70 });
    startMove(game, khan, 'tempest');
    runTicks(game, 10);
    game.player.x = khan.x - 24;
    game.player.facing = 1;
    game.input.pressed.light = true;
    runTicks(game, 30);
    expect(khan.state).toBe('attack');
    expect(khan.move.id).toBe('tempest');
  });

  it('sends a crescent under a hero in the air', () => {
    const { game, khan } = khanArena({ gap: 60 });
    const floor = groundAt(game.terrain, game.player.x);
    Object.assign(game.player, { airborne: true, y: floor - 34, vy: 0, state: 'air' });
    spawnCrescent(game, khan);
    const wave = game.projectiles.at(-1);
    let hit = false;
    for (let i = 0; i < 30; i++) {
      game.player.y = floor - 34;
      game.player.vy = 0;
      runTicks(game, 1);
      hit ||= wave.hitTargets.has(game.player);
    }
    expect(hit).toBe(false);
  });

  it('calls two raiders with his war horn', () => {
    const { game, khan } = khanArena();
    startMove(game, khan, 'warHorn');
    runTicks(game, 140);
    expect(raiders(game)).toHaveLength(2);
  });

  // the hero stands still and cannot fall, and every raider is cleared off as a player would; the
  // first half he fights at full strength, where his horn belongs (below half health his chained
  // dash is ready again whenever he is), the second low enough for his Tempest
  it('fights a whole bout with every move of his kit and never leaves the arena', () => {
    const { game, khan } = khanArena({ hp: 150 });
    const used = new Set();
    for (let i = 0; i < 3600; i++) {
      runTicks(game, 1);
      if (i % 300 === 0) {
        game.fighters = game.fighters.filter((fighter) => !raiders(game).includes(fighter));
      }
      game.player.hp = game.player.maxHp;
      if (i === 1800) {
        khan.hp = 75;
      }
      khan.hp = Math.max(khan.hp, i < 1800 ? 110 : 40);
      if (khan.move) {
        used.add(khan.move.id);
      }
      expect(khan.x).toBeGreaterThanOrEqual(game.arena.left - 1);
      expect(khan.x).toBeLessThanOrEqual(game.arena.right + 1);
    }
    expect([...used]).toEqual(expect.arrayContaining(['crescentDash', 'warHorn', 'tempest']));
    expect(used.has('charge')).toBe(false);
  });
});
