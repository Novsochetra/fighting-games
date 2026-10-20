import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { VIEW_WIDTH } from '../../../src/config.js';
import { MISSIONS } from '../../../src/data/missions/index.js';
import { knockOut } from '../../../src/sim/combat/knock-out.js';
import {
  enterNextMission,
  restartRun,
  selectMission,
  startPlay,
} from '../../../src/sim/stage/flow.js';
import { spawnEnemy } from '../../../src/sim/stage/spawn-enemy.js';
import { seededRandom } from '../../support/seeded-random.js';
import { createTestGame, runTicks } from '../../support/test-game.js';

const originalRandom = Math.random;
const standing = (game) =>
  game.fighters.filter((fighter) => fighter.side === 'enemy' && fighter.state !== 'ko');

function playMission(index) {
  const game = createTestGame();
  selectMission(game, index);
  startPlay(game);
  return game;
}

// the hero is carried straight to a spot, so no raider can knock the test off course
function standAt(game, x, ticks = 60) {
  for (let i = 0; i < ticks; i++) {
    game.player.x = x;
    game.player.hp = game.player.maxHp;
    runTicks(game, 1);
  }
}

function beatWave(game) {
  standAt(game, game.player.x, 160);
  for (const enemy of standing(game)) {
    knockOut(game, enemy, 1);
  }
  standAt(game, game.player.x, 20);
}

describe('missions and their zones', () => {
  beforeEach(() => {
    Math.random = seededRandom(11);
  });
  afterEach(() => {
    Math.random = originalRandom;
  });

  it('scrolls a wide zone with the hero and holds each wave until the hero walks up to it', () => {
    const game = playMission(1);
    const zone = MISSIONS[1].zones[0];
    standAt(game, zone.at + 4);
    expect(game.arena).toEqual({ left: zone.left, right: zone.right });
    expect(game.stage.waveIndex).toBe(0);
    beatWave(game);
    standAt(game, zone.at + 4, 200);
    expect(game.stage.waveIndex).toBe(0);
    expect(standing(game)).toHaveLength(0);
    standAt(game, zone.waves[1].at + 4, 160);
    expect(game.stage.waveIndex).toBe(1);
    expect(game.camera.x).toBeGreaterThan(zone.left);
    expect(standing(game).length).toBeGreaterThan(0);
  });

  it('pins the camera to one screen for the last wave, then opens the road', () => {
    const game = playMission(1);
    const zone = MISSIONS[1].zones[0];
    standAt(game, zone.at + 4);
    beatWave(game);
    standAt(game, zone.waves[1].at + 4, 80);
    beatWave(game);
    standAt(game, zone.waves[2].at + 4, 80);
    expect(game.stage.waveIndex).toBe(2);
    expect(game.arena).toEqual({ left: zone.right - VIEW_WIDTH, right: zone.right });
    beatWave(game);
    standAt(game, game.player.x, 60);
    expect(game.arena).toBeNull();
    expect(game.stage.zoneIndex).toBe(1);
    expect(game.banner.text).toBe('Go!');
  });

  it('keeps the fight on the screen: raiders walk in from just past its edges', () => {
    const game = playMission(1);
    const zone = MISSIONS[1].zones[0];
    standAt(game, zone.at + 4);
    standAt(game, zone.waves[1].at + 4, 40);
    const edges = [game.camera.x - 18, game.camera.x + VIEW_WIDTH + 18];
    const before = game.fighters.length;
    spawnEnemy(game, 'grunt', -1);
    spawnEnemy(game, 'grunt', 1);
    const added = game.fighters.slice(before).map((enemy) => enemy.x);
    expect(added).toEqual(edges);
  });

  it('starts the next mission fresh but keeps the score, clock, continues and ULT bar', () => {
    const game = playMission(0);
    Object.assign(game, { score: 4200, playTime: 999, continues: 1, ultMeter: 60 });
    game.player.hp = 3;
    enterNextMission(game);
    expect(game.missionIndex).toBe(1);
    expect(game).toMatchObject({ score: 4200, playTime: 999, continues: 1, ultMeter: 60 });
    expect(game.player.hp).toBe(game.player.maxHp);
    expect(game.fighters).toEqual([game.player]);
    expect(game.crates.map((crate) => crate.x)).toEqual(MISSIONS[1].crates.map((crate) => crate.x));
    expect(game.banner).toMatchObject({ text: 'Mission 2', sub: 'Old Grove' });
  });

  it('restarts the mission the hero is on, not the first one', () => {
    const game = playMission(3);
    game.score = 900;
    restartRun(game);
    expect(game.missionIndex).toBe(3);
    expect(game.score).toBe(0);
    expect(game.banner).toMatchObject({ text: 'Mission 4', sub: 'Raider Camp' });
  });

  it('names a returning boss a mid-boss, the mission boss a boss and the Warden Ox the final boss', () => {
    const hollow = playMission(5);
    spawnEnemy(hollow, 'khan', 1);
    expect(hollow.banner.sub).toBe('Mid-boss');
    spawnEnemy(hollow, 'gnoll', 1);
    expect(hollow.banner.sub).toBe('Boss');
    const fortress = playMission(9);
    spawnEnemy(fortress, 'brute', 1);
    expect(fortress.banner.sub).toBe('Final boss');
  });

  it("calls in the mission's own raiders while its boss fights", () => {
    const game = playMission(8);
    game.arena = { left: 0, right: VIEW_WIDTH };
    spawnEnemy(game, 'pharaoh', 1);
    game.boss.entering = false;
    standAt(game, 120, 1800);
    const helpers = game.fighters.filter(
      (fighter) => !fighter.def?.boss && fighter.side === 'enemy',
    );
    expect(helpers.length).toBeGreaterThan(0);
    for (const helper of helpers) {
      expect(MISSIONS[8].reinforcements).toContain(helper.kind);
    }
  });
});
