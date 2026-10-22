import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { startMove } from '../../../src/sim/fighters/actions.js';
import { spawnEnemy } from '../../../src/sim/stage/spawn-enemy.js';
import { seededRandom } from '../../support/seeded-random.js';
import { createPlayingGame, runTicks } from '../../support/test-game.js';

const originalRandom = Math.random;

function ironhornArena({ gap = 150, hp } = {}) {
  const game = createPlayingGame();
  game.missionIndex = 2;
  game.arena = { left: 0, right: 384 };
  game.player.x = 200;
  spawnEnemy(game, 'ironhorn', 1);
  const ironhorn = game.boss;
  Object.assign(ironhorn, { entering: false, x: game.player.x + gap, facing: -1 });
  ironhorn.hp = hp ?? ironhorn.maxHp;
  return { game, ironhorn };
}

// the moves he plays and the shots he makes while the hero stands and cannot fall
function watch(game, ironhorn, ticks) {
  const moves = [];
  const shots = new Set();
  for (let i = 0; i < ticks; i++) {
    runTicks(game, 1);
    game.player.hp = game.player.maxHp;
    if (ironhorn.move && moves.at(-1) !== ironhorn.move.id) {
      moves.push(ironhorn.move.id);
    }
    game.projectiles.forEach((shot) => shots.add(shot));
  }
  return { moves, shots: [...shots] };
}

describe('Ironhorn in a fight', () => {
  beforeEach(() => {
    Math.random = seededRandom(3);
  });
  afterEach(() => {
    Math.random = originalRandom;
  });

  it('is left dazed when his rush misses and meets the wall, which drops a bamboo stalk', () => {
    const { game, ironhorn } = ironhornArena();
    game.player.invincible = 9999;
    startMove(game, ironhorn, 'hornRush');
    const { moves, shots } = watch(game, ironhorn, 200);
    expect(moves.slice(0, 2)).toEqual(['hornRush', 'dazed']);
    expect(shots.filter((shot) => shot.kind === 'bamboo')).toHaveLength(1);
    expect(ironhorn.x).toBeLessThan(10);
  });

  it('is not dazed when his rush runs the hero down first', () => {
    const { game, ironhorn } = ironhornArena();
    startMove(game, ironhorn, 'hornRush');
    const { moves } = watch(game, ironhorn, 200);
    expect(moves[0]).toBe('hornRush');
    expect(moves).not.toContain('dazed');
  });

  it('stampedes there, back and there again, each run faster, then stands dazed', () => {
    const { game, ironhorn } = ironhornArena({ hp: 90 });
    game.player.invincible = 9999;
    startMove(game, ironhorn, 'stampede');
    const { moves, shots } = watch(game, ironhorn, 600);
    expect(moves.slice(0, 4)).toEqual(['stampede', 'stampedeBack', 'stampedeLast', 'dazedLong']);
    expect(shots.filter((shot) => shot.kind === 'bamboo')).toHaveLength(3);
  });

  it('launches a hero who jumps at him with the uppercut', () => {
    const { game, ironhorn } = ironhornArena({ gap: 30 });
    Object.assign(game.player, { airborne: true, y: game.player.y - 20, vy: -1, state: 'air' });
    startMove(game, ironhorn, 'uppercut');
    let launched = false;
    for (let i = 0; i < 40; i++) {
      runTicks(game, 1);
      launched ||= game.player.state === 'juggle';
    }
    expect(launched).toBe(true);
  });

  // the hero cannot fall and now and then backs off across the arena, as a player keeping away would
  it('fights a whole bout with every move of his kit', () => {
    const { game, ironhorn } = ironhornArena({ hp: 90 });
    const used = new Set();
    for (let i = 0; i < 3600; i++) {
      if (i % 300 === 0) {
        game.player.x = ironhorn.x > 192 ? 20 : 364;
      }
      runTicks(game, 1);
      game.player.hp = game.player.maxHp;
      ironhorn.hp = Math.max(ironhorn.hp, 40);
      used.add(ironhorn.move?.id);
    }
    expect([...used]).toEqual(expect.arrayContaining(['hornRush', 'stampede', 'dazedLong']));
  });
});
