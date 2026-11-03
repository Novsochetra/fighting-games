import { describe, expect, it } from 'vitest';
import {
  animationName,
  animationOf,
  frameOf,
  kickTimingOf,
} from '../../../../src/render/actors/animation.js';
import { createMemory, startsOf } from '../../../../src/render/actors/memory.js';
import { FAKE_SPRITES } from '../../../support/fake-sprites.js';

const KICK = kickTimingOf(FAKE_SPRITES.animations);

const playerWith = (fields = {}) => ({
  index: 3,
  team: 0,
  vx: 0,
  vy: 0,
  stride: 0,
  stun: 0,
  tackle: 0,
  lastKick: -Infinity,
  dive: null,
  facing: { x: 1, y: 0 },
  ...fields,
});

const matchAt = (fields = {}) => ({ tick: 500, phase: 'play', phaseTicks: 40, ...fields });

const stateOf = (player, match = matchAt(), scoringTeam = null) =>
  animationOf(player, match, { scoringTeam, starts: {}, kick: KICK });

describe('what a player is doing, from the match', () => {
  it('stands still below a walk and runs above it', () => {
    expect(stateOf(playerWith()).name).toBe('idle');
    expect(stateOf(playerWith({ vx: 2 })).name).toBe('run');
  });

  it('kicks for as long as the kick frames play after their last pass or shot', () => {
    expect(stateOf(playerWith({ lastKick: 498 })).name).toBe('kick');
    expect(stateOf(playerWith({ lastKick: 500 - KICK.ticks })).name).toBe('idle');
  });

  it('plays a kick from its strike, the back-swing being over when the ball leaves the foot', () => {
    const kicking = stateOf(playerWith({ lastKick: 500 }));

    expect(frameOf(FAKE_SPRITES.animations.kick, kicking)).toBe(1);
    expect(kickTimingOf({ kick: { frames: 2, fps: 10 } })).toEqual({ ticks: 12, lead: 0 });
  });

  it('slides, falls and dives from the sim state, before anything else', () => {
    expect(stateOf(playerWith({ tackle: 6, lastKick: 499 })).name).toBe('slide');
    expect(stateOf(playerWith({ stun: 20, tackle: 6 })).name).toBe('fall');
    expect(stateOf(playerWith({ dive: { tick: 490, side: 1 }, stun: 3 })).name).toBe('dive');
  });

  it('celebrates only on the scoring side, during the goal', () => {
    const goal = matchAt({ phase: 'goal' });

    expect(stateOf(playerWith({ team: 1 }), goal, 1).name).toBe('celebrate');
    expect(stateOf(playerWith({ team: 0 }), goal, 1).name).toBe('idle');
  });

  it('flies a dive across the screen toward the side the keeper dives to', () => {
    const facingEast = stateOf(playerWith({ dive: { tick: 490, side: -1 } }));
    const facingWest = stateOf(
      playerWith({ dive: { tick: 490, side: -1 }, facing: { x: -1, y: 0 } }),
    );

    expect(facingEast.direction).toBe('south-east');
    expect(facingWest.direction).toBe('south-west');
  });
});

describe('the frame an animation is at', () => {
  const { run, kick } = FAKE_SPRITES.animations;

  it('steps a run on with the ground the player covers', () => {
    const frames = [0, 10, 20, 30, 40, 50].map((stride) => frameOf(run, { stride }));

    expect(new Set(frames).size).toBeGreaterThan(2);
    expect(frameOf(run, { stride: 0 })).toBe(0);
    expect(frames.every((frame) => frame >= 0 && frame < run.frames)).toBe(true);
  });

  it('plays an action once and holds its last frame', () => {
    expect(frameOf(kick, { age: 0 })).toBe(0);
    expect(frameOf(kick, { age: 4 })).toBe(1);
    expect(frameOf(kick, { age: 400 })).toBe(kick.frames - 1);
  });

  it('loops an idle', () => {
    expect(frameOf(FAKE_SPRITES.animations.idle, { age: 15, loop: true })).toBe(1);
    expect(frameOf(FAKE_SPRITES.animations.idle, { age: 30, loop: true })).toBe(0);
  });

  it('stands in with the run or the idle for an animation the sheets lack', () => {
    const { animations } = FAKE_SPRITES;

    expect(animationName(animations, { name: 'slide', fallback: 'run' })).toBe('run');
    expect(animationName(animations, { name: 'dive', fallback: 'idle' })).toBe('idle');
    expect(animationName(animations, { name: 'kick', fallback: 'run' })).toBe('kick');
  });
});

describe('the memory of when a fall or a slide began', () => {
  it('keeps the first tick it saw each, and forgets it once it is over', () => {
    const memory = createMemory();
    const match = matchAt();
    const player = playerWith({ stun: 30 });

    expect(startsOf(memory, match, player).fall).toBe(500);

    match.tick = 510;
    expect(startsOf(memory, match, player).fall).toBe(500);

    player.stun = 0;
    expect(startsOf(memory, match, player).fall).toBeUndefined();
  });
});
