import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { startMove } from '../../../src/sim/fighters/actions.js';
import { spawnEnemy } from '../../../src/sim/stage/spawn-enemy.js';
import { seededRandom } from '../../support/seeded-random.js';
import { createPlayingGame, runTicks } from '../../support/test-game.js';

const originalRandom = Math.random;

function cobraArena({ gap = 150, hp } = {}) {
  const game = createPlayingGame();
  game.missionIndex = 3;
  game.arena = { left: 0, right: 384 };
  game.player.x = 120;
  spawnEnemy(game, 'cobra', 1);
  const cobra = game.boss;
  Object.assign(cobra, { entering: false, x: game.player.x + gap, facing: -1 });
  cobra.hp = hp ?? cobra.maxHp;
  cobra.ai.cooldown = 9999;
  return { game, cobra };
}

// plays her move out with nothing else to think about, noting each state the hero passes through
function playOut(game, cobra, ticks) {
  const states = new Set();
  for (let i = 0; i < ticks; i++) {
    runTicks(game, 1);
    cobra.ai.cooldown = 9999;
    states.add(game.player.state);
  }
  return states;
}

describe('the Cobra Matriarch in a fight', () => {
  beforeEach(() => {
    Math.random = seededRandom(5);
  });
  afterEach(() => {
    Math.random = originalRandom;
  });

  it('spits globs that leave puddles burning a hero who stands in them, until they dry', () => {
    const { game, cobra } = cobraArena();
    game.player.invincible = 9999;
    startMove(game, cobra, 'venomSpit');
    playOut(game, cobra, 90);
    const puddles = game.projectiles.filter((shot) => shot.kind === 'puddle');
    expect(puddles).toHaveLength(3);
    game.player.invincible = 0;
    game.player.x = puddles[1].x;
    const hp = game.player.hp;
    playOut(game, cobra, 90);
    expect(game.player.hp).toBeLessThan(hp);
    playOut(game, cobra, 200);
    expect(game.projectiles.filter((shot) => shot.kind === 'puddle')).toHaveLength(0);
  });

  it('sweeps a standing hero off their feet with her tail, and misses one in the air', () => {
    const standing = cobraArena({ gap: 50 });
    startMove(standing.game, standing.cobra, 'coilLash');
    expect(playOut(standing.game, standing.cobra, 40).has('juggle')).toBe(true);
    const jumping = cobraArena({ gap: 50 });
    startMove(jumping.game, jumping.cobra, 'coilLash');
    playOut(jumping.game, jumping.cobra, 28);
    Object.assign(jumping.game.player, {
      airborne: true,
      state: 'air',
      y: jumping.game.player.y - 30,
      vy: -2,
    });
    expect(jumping.game.player.hp).toBe(jumping.game.player.maxHp);
    playOut(jumping.game, jumping.cobra, 10);
    expect(jumping.game.player.hp).toBe(jumping.game.player.maxHp);
  });

  it('holds a hero who meets her gaze and bites them, while one who looks away walks free', () => {
    const facing = cobraArena({ hp: 90 });
    facing.game.player.facing = 1;
    startMove(facing.game, facing.cobra, 'hypnoticGaze');
    playOut(facing.game, facing.cobra, 97);
    expect(facing.game.player.state).toBe('hurt');
    playOut(facing.game, facing.cobra, 60);
    expect(facing.game.player.hp).toBeLessThan(facing.game.player.maxHp);
    const away = cobraArena({ hp: 90 });
    away.game.player.facing = -1;
    startMove(away.game, away.cobra, 'hypnoticGaze');
    playOut(away.game, away.cobra, 97);
    expect(away.game.player.state).not.toBe('hurt');
  });

  // the hero cannot fall and now and then backs off across the arena, as a player keeping away would
  it('fights a whole bout with every move of her kit', () => {
    const { game, cobra } = cobraArena({ hp: 90 });
    cobra.ai.cooldown = 0;
    const used = new Set();
    for (let i = 0; i < 3600; i++) {
      if (i % 300 === 0) {
        game.player.x = cobra.x > 192 ? 20 : 364;
      }
      runTicks(game, 1);
      game.player.hp = game.player.maxHp;
      cobra.hp = Math.max(cobra.hp, 40);
      used.add(cobra.move?.id);
    }
    expect([...used]).toEqual(expect.arrayContaining(['venomSpray', 'coilLash', 'hypnoticGaze']));
  });
});
