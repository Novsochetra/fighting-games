import { describe, expect, it } from 'vitest';
import { VIEW_WIDTH } from '../../../src/config.js';
import { HEROES } from '../../../src/data/heroes.js';
import { MISSIONS } from '../../../src/data/missions/index.js';
import { followFloor } from '../../../src/sim/fighters/terrain-motion.js';
import { selectMission, startPlay } from '../../../src/sim/stage/flow.js';
import { stageClear } from '../../../src/sim/stage/stage-clear.js';
import { WAY_OUT_AT } from '../../../src/sim/stage/way-out.js';
import { createTestGame, press, runTicks } from '../../support/test-game.js';

// a road's boss down with the hero standing `offset` into its last screen, the clear begun, and
// every sound the game sends out kept with the tick it went on
function clearedAt(missionIndex, { offset = 200, hero = 'moss' } = {}) {
  const heard = [];
  const io = { sfx: (key) => heard.push({ tick: game.tickCount, key }) };
  const game = createTestGame({ settings: { hero }, io });
  selectMission(game, missionIndex);
  startPlay(game);
  const { zones } = MISSIONS[missionIndex];
  const boss = zones.at(-1);
  Object.assign(game, { arena: { left: boss.left, right: boss.right } });
  game.stage.zoneIndex = zones.length - 1;
  game.camera.x = boss.left;
  game.player.x = boss.left + offset;
  followFloor(game.terrain, game.player);
  stageClear(game);
  return { game, heard };
}

// runs the game until `done` holds, and says how many ticks that took
function runUntil(game, done, limit = 1500) {
  let ticks = 0;
  while (!done(game) && ticks < limit) {
    runTicks(game, 1);
    ticks++;
  }
  expect(done(game)).toBe(true);
  return ticks;
}

const smashed = (game) => game.wallSmashed;
const gone = (game) => game.gateRun?.phase === 'gone';

describe('the hero leaving a cleared road', () => {
  it('stands in triumph while the clear card stamps in, then turns to run for the closing wall', () => {
    const { game } = clearedAt(0);
    runUntil(game, () => game.clearTime === WAY_OUT_AT - 1);
    expect(game.player.state).toBe('win');
    runTicks(game, 3);
    expect(game.player.state).toBe('run');
    expect(game.player.facing).toBe(1);
  });

  for (const mission of MISSIONS.slice(0, -1)) {
    it(`smashes ${mission.name}'s closing wall open and runs off the road through it`, () => {
      for (const offset of [30, VIEW_WIDTH - 40]) {
        const { game } = clearedAt(mission.index, { offset });
        runUntil(game, smashed);
        expect(game.player.move.id).toBe('K1');
        expect(game.player.x).toBeLessThan(mission.wayOut.face);
        expect(game.clearTime).toBe(WAY_OUT_AT);
        runUntil(game, gone);
        expect(game.player.x).toBeGreaterThan(game.camera.x + VIEW_WIDTH);
        runUntil(game, () => game.missionIndex === mission.index + 1);
      }
    });
  }

  it('lands the heavy blow on the wall with every Shade, whatever their weapon', () => {
    for (const { id } of HEROES) {
      const { game } = clearedAt(3, { hero: id });
      runUntil(game, smashed);
      expect(game.player.move.id).toBe('K1');
      expect(game.player.hitboxActive).toBe(true);
    }
  });

  it('holds the summary until the hero is gone, and sounds the smash and the summary once each', () => {
    const { game, heard } = clearedAt(2, { offset: 30 });
    runUntil(game, () => game.gateRun?.phase === 'through');
    expect(game.clearTime).toBe(WAY_OUT_AT);
    runUntil(game, () => game.missionIndex === 3);
    const count = (key) => heard.filter((sound) => sound.key === key).length;
    expect([count('break'), count('ko'), count('tallyOpen'), count('wipe')]).toEqual([1, 1, 1, 1]);
  });

  it('lets go of a charge still held as the clear began, to run for the wall', () => {
    const { game } = clearedAt(3);
    runUntil(game, () => game.clearTime === WAY_OUT_AT - 1);
    game.player.state = 'charge';
    runUntil(game, smashed);
  });

  it('takes no orders from the player on the way out', () => {
    const { game } = clearedAt(5);
    runUntil(game, () => game.gateRun !== null);
    press(game, 'left');
    press(game, 'jump');
    runUntil(game, gone);
    expect(game.wallSmashed).toBe(true);
  });

  it('goes on with the hero in triumph when the clear comes short of the closing wall', () => {
    const { game } = clearedAt(4);
    game.player.x = 300;
    game.camera.x = 0;
    game.arena = null;
    runUntil(game, () => game.missionIndex === 5);
    expect(game.wallSmashed).toBe(false);
  });

  it('keeps the hero in triumph at the end of the last road, with no next one to run to', () => {
    const { game } = clearedAt(MISSIONS.length - 1);
    runUntil(game, () => game.mode === 'clear');
    expect(game.gateRun).toBeNull();
    expect(game.wallSmashed).toBe(false);
    expect(game.player.state).toBe('win');
  });
});

describe('the hero coming onto the next road', () => {
  function enteredNext() {
    const { game } = clearedAt(1);
    runUntil(game, () => game.missionIndex === 2);
    return game;
  }

  it('runs in from off screen through the broken wall and stops on the spot a road starts on', () => {
    const game = enteredNext();
    expect(game.player.x).toBeLessThan(0);
    expect(game.player.state).toBe('run');
    const wall = MISSIONS[2].props[0];
    expect(wall.kind).toBe('palisadeBroken');
    runUntil(game, () => !game.gateRun);
    expect(game.player.x).toBeGreaterThan(wall.x + 40);
    expect(game.player.state).toBe('idle');
  });

  it('leaves a hero felled on the way in down, for the fall to take its course', () => {
    const game = enteredNext();
    Object.assign(game.player, { hp: 0, state: 'ko', stateTime: 80, airborne: false });
    runTicks(game, 1);
    expect(game.player.state).toBe('ko');
    expect(game.mode).toBe('over');
  });

  it('hands over the controls only once there, and keeps the clock still till then', () => {
    const game = enteredNext();
    const playTime = game.playTime;
    press(game, 'left');
    runUntil(game, () => !game.gateRun);
    expect(game.playTime).toBe(playTime);
    const there = game.player.x;
    runTicks(game, 20);
    expect(game.player.x).toBeLessThan(there);
    expect(game.playTime).toBeGreaterThan(playTime);
  });
});
