import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { MISSIONS } from '../../../src/data/missions/index.js';
import { heroMoves } from '../../../src/data/styles/index.js';
import { movesetOf, setWeapon } from '../../../src/sim/fighters/loadout.js';
import {
  continueAs,
  continueRun,
  enterNextMission,
  playFromStart,
  restartRun,
  selectMission,
  startPlay,
} from '../../../src/sim/stage/flow.js';
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

// the hero goes down and stays down until the defeat menu comes up
function fall(game) {
  Object.assign(game.player, { hp: 0, state: 'ko', stateTime: 80, airborne: false });
  runTicks(game, 1);
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
    const zone = MISSIONS[0].zones[0];
    walkInto(game, zone.at + 10);
    expect(game.arena).toEqual({ left: zone.left, right: zone.right });
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
    game.player.x = game.crates[0].x - 15;
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

  it('lets a fallen hero fight on as another Shade, keeping the run and the weapon in hand', () => {
    const game = createPlayingGame();
    Object.assign(game, { score: 900, ultMeter: 70 });
    setWeapon(game, game.player, 'spear');
    game.player.hp = 0;
    game.mode = 'over';
    continueAs(game, 'antler');
    expect(game.settings.hero).toBe('antler');
    expect(game.mode).toBe('play');
    expect(game.player.hp).toBe(game.player.maxHp);
    expect(game).toMatchObject({ score: 900, ultMeter: 70, continues: 1 });
    expect(movesetOf(game, game.player)).toBe(heroMoves('antler', 'spear'));
    expect(game.floaters.at(-1).text).toBe('Antler Spirit Shade');
    runTicks(game, 120);
    expect(game.player.state).not.toBe('ko');
  });

  it('takes a life for every fall and ends the run for good after the fifth', () => {
    const game = createPlayingGame();
    expect(game.lives).toBe(5);
    for (let lives = 4; lives > 0; lives--) {
      fall(game);
      expect(game).toMatchObject({ mode: 'over', lives });
      continueRun(game);
      expect(game.mode).toBe('play');
    }
    fall(game);
    expect(game).toMatchObject({ mode: 'over', lives: 0, continues: 4 });
    continueRun(game);
    continueAs(game, 'blue');
    expect(game).toMatchObject({ mode: 'over', lives: 0, continues: 4 });
    expect(game.settings.hero).toBe('moss');
  });

  it('carries the lives into the next mission, gives none back on a restart and five on a new run', () => {
    const game = createPlayingGame();
    fall(game);
    continueRun(game);
    fall(game);
    continueRun(game);
    enterNextMission(game);
    expect(game).toMatchObject({ missionIndex: 1, lives: 3 });
    restartRun(game);
    expect(game).toMatchObject({ missionIndex: 1, lives: 3, mode: 'play' });
    playFromStart(game);
    expect(game).toMatchObject({ missionIndex: 0, lives: 5, continues: 0, mode: 'play' });
  });

  function felledBoss(game, kind) {
    spawnEnemy(game, kind, 1);
    const boss = game.boss;
    Object.assign(boss, { entering: false, x: 200, hp: 1 });
    game.player.x = boss.x - 20;
    game.player.facing = 1;
    tap(game, 'heavy');
    runTicks(game, 60);
    return boss;
  }

  it("moves on to the next mission when the mission's boss goes down", () => {
    const game = createPlayingGame();
    const boss = felledBoss(game, 'khan');
    expect(boss.state).toBe('ko');
    expect(game.clearTime).toBeGreaterThan(0);
    const score = game.score;
    runTicks(game, 600);
    expect(game.mode).toBe('play');
    expect(game.missionIndex).toBe(1);
    expect(game.score).toBe(score);
    expect(game.records).toMatchObject({ bestScore: score });
  });

  it('walks on from the fallen Warden Ox into Angkor Wat instead of ending the game', () => {
    const game = createPlayingGame();
    selectMission(game, 9);
    startPlay(game);
    const boss = felledBoss(game, 'brute');
    expect(boss.state).toBe('ko');
    expect(game.banner.text).toBe('Mission complete');
    runTicks(game, 600);
    expect(game.mode).toBe('play');
    expect(MISSIONS[game.missionIndex].name).toBe('Angkor Wat');
    expect(game.terrain).toBe(MISSIONS[10].terrain);
  });

  it('clears the whole game when the Bayon Guardian falls in the last mission', () => {
    const game = createPlayingGame();
    selectMission(game, 11);
    startPlay(game);
    const boss = felledBoss(game, 'guardian');
    expect(boss.state).toBe('ko');
    expect(game.banner.text).toBe('All clear');
    runTicks(game, 600);
    expect(game.mode).toBe('clear');
    expect(game.missionIndex).toBe(11);
    expect(game.records).toMatchObject({ bestScore: game.score });
  });
});
