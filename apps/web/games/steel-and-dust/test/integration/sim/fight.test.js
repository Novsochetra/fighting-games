import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { continueRun } from '../../../src/sim/stage/flow.js';
import { spawnEnemy } from '../../../src/sim/stage/spawn-enemy.js';
import { seededRandom } from '../../support/seeded-random.js';
import { createPlayingGame, press, release, runTicks, tap } from '../../support/test-game.js';

const originalRandom = Math.random;
const enemies = (game) => game.fighters.filter((fighter) => fighter.side === 'enemy');

function walkInto(game, x) {
  press(game, 'right');
  for (let i = 0; i < 600 && game.player.x < x; i++) {
    runTicks(game, 1);
  }
  release(game, 'right');
}

function standNextTo(game, enemy) {
  game.player.x = enemy.x - 14;
  game.player.facing = 1;
}

describe('a fight, with every system running', () => {
  beforeEach(() => {
    Math.random = seededRandom(7);
  });
  afterEach(() => {
    Math.random = originalRandom;
  });

  it('locks the arena and sends in the first wave when the hero enters zone 1', () => {
    const game = createPlayingGame();
    walkInto(game, 260);
    expect(game.arena).toEqual({ left: 150, right: 534 });
    runTicks(game, 120);
    expect(enemies(game).map((enemy) => enemy.kind)).toEqual(['grunt', 'grunt', 'grunt']);
  });

  it('lands a jab string: the combo counts, the score climbs and the raider reels', () => {
    const game = createPlayingGame();
    spawnEnemy(game, 'grunt', 1);
    const raider = enemies(game)[0];
    raider.entering = false;
    raider.x = 200;
    raider.ai.cooldown = 999;
    standNextTo(game, raider);
    for (let i = 0; i < 3; i++) {
      tap(game, 'light');
      runTicks(game, 8);
    }
    expect(game.combo.count).toBeGreaterThanOrEqual(2);
    expect(game.score).toBeGreaterThan(0);
    expect(raider.hp).toBeLessThan(raider.maxHp);
  });

  it('knocks a raider out, scores it and clears it away', () => {
    const game = createPlayingGame();
    spawnEnemy(game, 'grunt', 1);
    const raider = enemies(game)[0];
    Object.assign(raider, { entering: false, x: 200, hp: 1 });
    standNextTo(game, raider);
    tap(game, 'light');
    runTicks(game, 12);
    expect(raider.state).toBe('ko');
    expect(game.score).toBeGreaterThanOrEqual(300);
    runTicks(game, 200);
    expect(enemies(game)).toHaveLength(0);
  });

  it('sweeps a crate open and picks up the weapon inside', () => {
    const game = createPlayingGame();
    game.player.x = 190;
    press(game, 'down');
    tap(game, 'light');
    release(game, 'down');
    runTicks(game, 10);
    expect(game.crates[0].broken).toBe(true);
    game.player.x = game.crates[0].x;
    runTicks(game, 40);
    expect(game.player.weapon).toEqual({ id: 'sword', durability: 40 });
  });

  it('hits every raider on screen with the ultimate', () => {
    const game = createPlayingGame();
    for (const side of [-1, 1, 1]) {
      spawnEnemy(game, 'grunt', side);
    }
    for (const [i, enemy] of enemies(game).entries()) {
      Object.assign(enemy, { entering: false, x: 60 + i * 60 });
    }
    game.ultMeter = 100;
    tap(game, 'ult');
    runTicks(game, 400);
    expect(enemies(game).every((enemy) => enemy.hp < enemy.maxHp)).toBe(true);
    expect(game.player.state).not.toBe('ult');
  });

  it('ends the run when the hero falls, and continues with full health', () => {
    const game = createPlayingGame();
    spawnEnemy(game, 'grunt', 1);
    game.player.hp = 1;
    const raider = enemies(game)[0];
    Object.assign(raider, { entering: false, x: game.player.x + 12, facing: -1, hasToken: true });
    raider.ai.cooldown = 0;
    runTicks(game, 400);
    expect(game.mode).toBe('over');
    continueRun(game);
    expect(game.mode).toBe('play');
    expect(game.player.hp).toBe(game.player.maxHp);
    expect(game.continues).toBe(1);
  });

  it('clears the stage when the boss goes down', () => {
    const game = createPlayingGame();
    spawnEnemy(game, 'brute', 1);
    const boss = game.boss;
    Object.assign(boss, { entering: false, x: 200, hp: 1 });
    standNextTo(game, boss);
    game.player.x = boss.x - 20;
    tap(game, 'heavy');
    runTicks(game, 60);
    expect(boss.state).toBe('ko');
    expect(game.clearTime).toBeGreaterThan(0);
    runTicks(game, 600);
    expect(game.mode).toBe('clear');
    expect(game.records.bestScore).toBe(game.score);
  });
});
