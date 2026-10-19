import { describe, expect, it } from 'vitest';
import { blocksHit, canBeHit, isGuarding } from '../../../src/sim/combat/guard.js';

const bulwark = (extra) => ({
  x: 100,
  facing: -1,
  def: { shield: true },
  state: 'idle',
  airborne: false,
  invincible: 0,
  removed: false,
  ...extra,
});
const light = { damage: 6 };

describe('shields', () => {
  it('block light hits from the front only', () => {
    expect(blocksHit({ x: 80 }, bulwark(), light)).toBe(true);
    expect(blocksHit({ x: 120 }, bulwark(), light)).toBe(false);
  });

  it('give way to heavy, launching, low and charged hits', () => {
    for (const move of [
      { damage: 12 },
      { damage: 6, launch: true },
      { damage: 6, low: true },
      { damage: 6, chargeLevel: 1 },
    ]) {
      expect(blocksHit({ x: 80 }, bulwark(), move)).toBe(false);
    }
  });

  it('only guard while standing, walking or winding up', () => {
    expect(isGuarding(bulwark({ state: 'walk' }))).toBe(true);
    expect(isGuarding(bulwark({ state: 'hurt' }))).toBe(false);
    expect(isGuarding(bulwark({ airborne: true }))).toBe(false);
    expect(isGuarding(bulwark({ state: 'attack', move: { startup: 10 }, moveTime: 3 }))).toBe(true);
  });
});

describe('canBeHit', () => {
  it('skips invincible, knocked-out and dashing fighters', () => {
    expect(canBeHit(bulwark({ invincible: 5 }), light)).toBe(false);
    expect(canBeHit(bulwark({ state: 'ko' }), light)).toBe(false);
    expect(canBeHit(bulwark({ state: 'dash' }), light)).toBe(false);
  });

  it('lets a fighter on the ground be hit only right after landing', () => {
    expect(canBeHit(bulwark({ state: 'down', stateTime: 4 }), light)).toBe(true);
    expect(canBeHit(bulwark({ state: 'down', stateTime: 20 }), light)).toBe(false);
  });

  it('lets the ultimate hit anyone who is not invincible', () => {
    expect(canBeHit(bulwark({ state: 'dash' }), { damage: 7, ultimate: true })).toBe(true);
  });
});
