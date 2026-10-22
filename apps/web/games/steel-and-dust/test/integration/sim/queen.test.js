import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { startMove } from '../../../src/sim/fighters/actions.js';
import { spawnEnemy } from '../../../src/sim/stage/spawn-enemy.js';
import { seededRandom } from '../../support/seeded-random.js';
import { createPlayingGame, runTicks } from '../../support/test-game.js';

const originalRandom = Math.random;

function queenArena({ gap = 150, hp } = {}) {
  const game = createPlayingGame();
  game.missionIndex = 4;
  game.arena = { left: 0, right: 384 };
  game.player.x = 120;
  spawnEnemy(game, 'queen', 1);
  const queen = game.boss;
  Object.assign(queen, { entering: false, x: game.player.x + gap, facing: -1 });
  queen.hp = hp ?? queen.maxHp;
  queen.ai.cooldown = 9999;
  return { game, queen };
}

// plays her move out with nothing else to think about, noting each state the hero passes through
function playOut(game, queen, ticks) {
  const states = new Set();
  for (let i = 0; i < ticks; i++) {
    runTicks(game, 1);
    queen.ai.cooldown = 9999;
    states.add(game.player.state);
  }
  return states;
}

describe('the Scorpion Queen in a fight', () => {
  beforeEach(() => {
    Math.random = seededRandom(5);
  });
  afterEach(() => {
    Math.random = originalRandom;
  });

  it('tunnels under the hero and bursts up beneath them, out of reach on the way', () => {
    const { game, queen } = queenArena({ gap: 180 });
    game.player.invincible = 9999;
    startMove(game, queen, 'burrow');
    playOut(game, queen, 60);
    expect(queen.move.id).toBe('burrow');
    expect(game.player.x).toBe(120);
    playOut(game, queen, 95);
    expect(queen.move.id).toBe('emerge');
    expect(Math.abs(queen.x - game.player.x)).toBeLessThan(8);
    game.player.invincible = 0;
    expect(playOut(game, queen, 40).has('juggle')).toBe(true);
    expect(game.player.hp).toBeLessThan(game.player.maxHp);
  });

  it('cannot be struck while she is under the ground', () => {
    const { game, queen } = queenArena({ gap: 30 });
    game.player.invincible = 9999;
    startMove(game, queen, 'burrow');
    playOut(game, queen, 40);
    game.player.facing = queen.x > game.player.x ? 1 : -1;
    startMove(game, game.player, 'L1');
    playOut(game, queen, 20);
    expect(queen.hp).toBe(queen.maxHp);
  });

  it('poisons a hero her sting reaches, a little at a time, never to the last of their life', () => {
    const { game, queen } = queenArena({ gap: 60 });
    startMove(game, queen, 'tailSting');
    playOut(game, queen, 40);
    const stung = game.player.hp;
    expect(stung).toBeLessThan(game.player.maxHp);
    playOut(game, queen, 120);
    expect(game.player.hp).toBeLessThan(stung);
    game.player.hp = 3;
    startMove(game, queen, 'tailSting');
    game.player.invincible = 9999;
    playOut(game, queen, 200);
    expect(game.player.hp).toBe(1);
  });

  it('sends wasps across the screen that a hero dodges by reading their lanes', () => {
    const { game, queen } = queenArena({ hp: 100 });
    startMove(game, queen, 'hiveSwarm');
    playOut(game, queen, 61);
    const wasp = game.projectiles.find((shot) => shot.kind === 'wasp');
    expect(wasp.speed).toBe(0);
    playOut(game, queen, 40);
    expect(wasp.speed).toBeGreaterThan(0);
    expect(game.player.hp).toBe(game.player.maxHp);
    playOut(game, queen, 90);
    expect(wasp.dead).toBe(true);
    expect(game.player.hp).toBeLessThan(game.player.maxHp);
  });

  // the hero cannot fall and now and then backs off across the arena, as a player keeping away would
  it('fights a whole bout with every move of her kit', () => {
    const { game, queen } = queenArena({ hp: 100 });
    queen.ai.cooldown = 0;
    const used = new Set();
    for (let i = 0; i < 3600; i++) {
      if (i % 600 === 0) {
        game.player.x = queen.x > 192 ? 20 : 364;
      }
      runTicks(game, 1);
      game.player.hp = game.player.maxHp;
      queen.hp = Math.max(queen.hp, 40);
      used.add(queen.move?.id);
    }
    expect([...used]).toEqual(
      expect.arrayContaining(['tailSting', 'burrowTwice', 'emerge', 'hiveSwarm']),
    );
  });
});
