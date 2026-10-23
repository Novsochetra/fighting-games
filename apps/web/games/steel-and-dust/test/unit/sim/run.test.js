import { describe, expect, it } from 'vitest';
import { DASH_TICKS, RUN_SPEED } from '../../../src/config.js';
import { runsOnFromDash, setOff, thinkRun } from '../../../src/sim/brains/player/run.js';
import { startRun } from '../../../src/sim/fighters/actions.js';
import { heroAnimation } from '../../../src/sim/hero-animation.js';
import { createPlayingGame, runTicks } from '../../support/test-game.js';

const HOLDING_ON = { buffer: null, direction: 1 };

function runningGame() {
  const game = createPlayingGame();
  runTicks(game, 30);
  Object.assign(game.player, { facing: 1, vx: 1.7 });
  startRun(game.player);
  return game;
}

function buffered(game, action) {
  Object.assign(game.input.buffer, { action, ttl: 8, up: false, down: false, direction: 0 });
  return { buffer: game.input.buffer, direction: 1 };
}

describe('when a dash runs on', () => {
  const lastTick = { airborne: false, stateTime: DASH_TICKS - 1, facing: 1 };

  it('runs on from a ground dash held its way on its last tick', () => {
    expect(runsOnFromDash(lastTick, HOLDING_ON)).toBe(true);
  });

  it('does not when let go, turned, still early, airborne or busy', () => {
    expect(runsOnFromDash(lastTick, { buffer: null, direction: 0 })).toBe(false);
    expect(runsOnFromDash(lastTick, { buffer: null, direction: -1 })).toBe(false);
    expect(runsOnFromDash({ ...lastTick, stateTime: 8 }, HOLDING_ON)).toBe(false);
    expect(runsOnFromDash({ ...lastTick, airborne: true }, HOLDING_ON)).toBe(false);
    expect(runsOnFromDash(lastTick, { buffer: { action: 'light' }, direction: 1 })).toBe(false);
  });
});

describe('setting off', () => {
  it("runs at once at a walk's pace from a stand", () => {
    const game = createPlayingGame();
    setOff(game.player, -1);
    expect(game.player).toMatchObject({ state: 'run', facing: -1, vx: -1.55 });
  });

  it('keeps a faster pace it already has that way, but not one the other way', () => {
    const game = createPlayingGame();
    game.player.vx = 2.2;
    setOff(game.player, 1);
    expect(game.player.vx).toBe(2.2);
    setOff(game.player, -1);
    expect(game.player.vx).toBe(-1.55);
  });

  it('sets off slower in stone skin', () => {
    const game = createPlayingGame();
    game.player.stoned = true;
    setOff(game.player, 1);
    expect(game.player.vx).toBeLessThan(1.55);
  });
});

describe('the run', () => {
  it("picks up from the dash's end to the run's pace and holds it", () => {
    const game = runningGame();
    const speeds = [];
    for (let i = 0; i < 40; i++) {
      thinkRun(game, game.player, HOLDING_ON);
      speeds.push(game.player.vx);
    }
    for (let i = 1; i < speeds.length; i++) {
      expect(speeds[i]).toBeGreaterThan(speeds[i - 1]);
    }
    expect(speeds.at(-1)).toBeCloseTo(RUN_SPEED, 2);
  });

  it('runs slower in stone skin', () => {
    const game = runningGame();
    game.player.stoned = true;
    for (let i = 0; i < 40; i++) {
      thinkRun(game, game.player, HOLDING_ON);
    }
    expect(game.player.vx).toBeLessThan(RUN_SPEED / 2);
  });

  it('stops when let go and runs back when the other way is held', () => {
    const stopping = runningGame();
    thinkRun(stopping, stopping.player, { buffer: null, direction: 0 });
    expect(stopping.player.state).toBe('idle');
    const turning = runningGame();
    thinkRun(turning, turning.player, { buffer: null, direction: -1 });
    expect(turning.player).toMatchObject({ state: 'run', facing: -1 });
    expect(turning.player.vx).toBeLessThan(0);
  });

  it('attacks out of the run with the attacks from a stand', () => {
    const game = runningGame();
    thinkRun(game, game.player, buffered(game, 'light'));
    expect(game.player.state).toBe('attack');
    expect(game.player.move.id).toBe('L1');
    expect(game.input.buffer.action).toBeNull();
  });

  it('sweeps low out of the run with down held', () => {
    const game = runningGame();
    const intent = buffered(game, 'light');
    game.input.buffer.down = true;
    thinkRun(game, game.player, intent);
    expect(game.player.move.id).toBe('DL');
  });

  it('charges a heavy out of the run', () => {
    const game = runningGame();
    game.ultMeter = 100;
    thinkRun(game, game.player, buffered(game, 'heavy'));
    expect(game.player.state).toBe('charge');
  });

  it('leaps into a long running jump', () => {
    const game = runningGame();
    thinkRun(game, game.player, buffered(game, 'jump'));
    expect(game.player).toMatchObject({ state: 'air', airborne: true });
    expect(game.player.vx).toBeGreaterThan(2);
  });

  it('dashes again out of the run', () => {
    const game = runningGame();
    thinkRun(game, game.player, buffered(game, 'dash'));
    expect(game.player.state).toBe('dash');
  });

  it('loops the run strip, four ticks a frame', () => {
    const game = runningGame();
    const frames = [];
    for (let i = 0; i < 40; i++) {
      game.player.animTime++;
      frames.push(heroAnimation(game.player));
    }
    expect(frames.every(([name]) => name === 'run')).toBe(true);
    expect(frames.map(([, frame]) => frame).slice(0, 36)).toEqual(
      [0, 1, 2, 3, 4, 5, 6, 7, 0].flatMap((frame) => [frame, frame, frame, frame]),
    );
  });
});
