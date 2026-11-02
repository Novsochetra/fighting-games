import { describe, expect, it } from 'vitest';
import { VIEW_WIDTH } from '../../../src/config.js';
import { HEROES } from '../../../src/data/heroes.js';
import { MISSIONS } from '../../../src/data/missions/index.js';
import { DOORWAY_LEAD, DOORWAY_TICKS } from '../../../src/sim/brains/player/doorway-steps.js';
import { followFloor } from '../../../src/sim/fighters/terrain-motion.js';
import { selectMission, startPlay } from '../../../src/sim/stage/flow.js';
import { REVEAL_FRAMES, stageClear } from '../../../src/sim/stage/stage-clear.js';
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
    it(`smashes ${mission.name}'s closing wall open and goes in at its doorway`, () => {
      const { middle } = mission.wayOut.doorway;

      for (const offset of [30, VIEW_WIDTH - 40]) {
        const { game } = clearedAt(mission.index, { offset });
        runUntil(game, smashed);
        expect(game.player.move.id).toBe('K1');
        expect(game.player.x).toBeLessThan(mission.wayOut.face);
        expect(game.clearTime).toBe(WAY_OUT_AT);
        runUntil(game, () => game.gateRun.behind);
        expect(game.player.x).toBeCloseTo(middle - DOORWAY_LEAD, -1);
        expect(game.gateRun.doorway.wall).toBe(mission.wayOut.broken);
        runUntil(game, gone);
        expect(game.gateRun.alpha).toBe(0);
        expect(Math.abs(game.player.x - middle)).toBeLessThan(DOORWAY_LEAD * 2);
        expect(game.player.x).toBeLessThan(game.camera.x + VIEW_WIDTH);
        runUntil(game, () => game.missionIndex === mission.index + 1);
      }
    });
  }

  it('fades the hero out a step at a time as it goes in, not all at once', () => {
    const { game } = clearedAt(8);
    runUntil(game, () => game.gateRun?.phase === 'enter');
    const shown = [];

    while (game.gateRun.phase === 'enter') {
      runTicks(game, 1);
      shown.push(game.gateRun.alpha);
    }

    expect(shown.length).toBeGreaterThanOrEqual(DOORWAY_TICKS);
    expect(shown.every((alpha, i) => i === 0 || alpha <= shown[i - 1])).toBe(true);
    expect(shown.at(-1)).toBe(0);
  });

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

  it('waits unseen in the broken wall while the road opens, then comes out of its doorway', () => {
    const game = enteredNext();
    const { wayIn } = MISSIONS[2];
    expect(wayIn.wall.kind).toBe('palisadeBroken');
    expect(game.gateRun).toMatchObject({ phase: 'wait', alpha: 0, behind: true });
    expect(game.player.x).toBeCloseTo(wayIn.middle - DOORWAY_LEAD);
    runTicks(game, REVEAL_FRAMES - 1);
    expect(game.gateRun.alpha).toBe(0);
    runUntil(game, () => game.gateRun.phase === 'run');
    expect(game.gateRun).toMatchObject({ alpha: 1, behind: false });
    runUntil(game, () => !game.gateRun);
    expect(game.player.x).toBeGreaterThan(wayIn.middle + 30);
    expect(game.player.state).toBe('idle');
  });

  it('comes out of the doorway of every wall a road starts on', () => {
    for (const mission of MISSIONS.slice(0, -2)) {
      const { game } = clearedAt(mission.index);
      runUntil(game, () => game.missionIndex === mission.index + 1);
      expect(game.gateRun.doorway).toBe(MISSIONS[mission.index + 1].wayIn);
      runUntil(game, () => !game.gateRun);
    }
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
