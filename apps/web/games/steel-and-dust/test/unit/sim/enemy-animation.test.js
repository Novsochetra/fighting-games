import { describe, expect, it } from 'vitest';
import { enemyAnimation } from '../../../src/sim/enemy-animation.js';

const SPRITE = {
  strips: {
    idle: { row: 0, frames: 4 },
    walk: { row: 1, frames: 8 },
    attack: { row: 2, frames: 9, strike: 4 },
    hurt: { row: 3, frames: 4 },
    ko: { row: 4, frames: 9 },
    slam: { row: 5, frames: 9, strike: 5 },
    charge: { row: 6, frames: 8 },
    horn: { row: 7, frames: 4, strike: 2 },
  },
};
const MOVE = { id: 'punch', startup: 20, active: 4, recovery: 20 };

function fighter(fields) {
  return {
    state: 'idle',
    animTime: 0,
    spriteName: null,
    spriteStart: 0,
    walkDirection: 1,
    vy: 0,
    ...fields,
  };
}

describe('enemyAnimation', () => {
  it('loops the idle strip and restarts it when the state changes', () => {
    const enemy = fighter({ animTime: 100 });
    expect(enemyAnimation(enemy, SPRITE)).toEqual(['idle', 0]);
    enemy.animTime = 100 + 9 * 5;
    expect(enemyAnimation(enemy, SPRITE)).toEqual(['idle', 1]);
  });

  it('plays the walk backwards while backing off', () => {
    const enemy = fighter({ state: 'walk', walkDirection: -1 });
    expect(enemyAnimation(enemy, SPRITE)).toEqual(['walk', 7]);
  });

  it('winds up toward the strike frame, holds it while the hitbox is out, then recovers', () => {
    const enemy = fighter({ state: 'attack', move: MOVE, moveTime: 10 });
    expect(enemyAnimation(enemy, SPRITE)).toEqual(['attack', 2]);
    enemy.moveTime = 21;
    expect(enemyAnimation(enemy, SPRITE)).toEqual(['attack', 4]);
    enemy.moveTime = 43;
    expect(enemyAnimation(enemy, SPRITE)).toEqual(['attack', 8]);
  });

  it("uses a move's own strip when the sheet has one", () => {
    const enemy = fighter({ state: 'attack', move: { ...MOVE, id: 'slam' }, moveTime: 20 });
    expect(enemyAnimation(enemy, SPRITE)).toEqual(['slam', 5]);
  });

  it('cycles the charge strip for as long as the rush lasts', () => {
    const charge = { id: 'charge', startup: 10, active: 40, recovery: 10, sustain: true };
    const enemy = fighter({ state: 'attack', move: charge, moveTime: 10 + 4 * 9 });
    expect(enemyAnimation(enemy, SPRITE)).toEqual(['charge', 1]);
  });

  it('keeps a lunge running from its strike frame to the end of the strip', () => {
    const sprite = { strips: { ...SPRITE.strips, lunge: { row: 7, frames: 9, strike: 5 } } };
    const lunge = { id: 'lunge', startup: 10, active: 40, recovery: 10, sustain: true };
    const enemy = fighter({ state: 'attack', move: lunge, moveTime: 10 + 4 * 5 });
    expect(enemyAnimation(enemy, sprite)).toEqual(['lunge', 6]);
  });

  it('holds the strike of a rush that has no strip of its own', () => {
    const pounce = { id: 'pounce', startup: 10, active: 40, recovery: 10, sustain: true };
    const enemy = fighter({ state: 'attack', move: pounce, moveTime: 30 });
    expect(enemyAnimation(enemy, SPRITE)).toEqual(['attack', 4]);
  });

  it('hops on the walk strip, knee up on the way up and striding on the way down', () => {
    expect(enemyAnimation(fighter({ state: 'air', vy: -4 }), SPRITE)).toEqual(['walk', 1]);
    expect(enemyAnimation(fighter({ state: 'air', vy: 2 }), SPRITE)).toEqual(['walk', 0]);
  });

  it('flies through the air frames of the knock-out strip by vertical speed', () => {
    expect(enemyAnimation(fighter({ state: 'juggle', vy: -3 }), SPRITE)).toEqual(['ko', 1]);
    expect(enemyAnimation(fighter({ state: 'juggle', vy: 2 }), SPRITE)).toEqual(['ko', 4]);
  });

  it('lands and lies still, then gets up by playing the landing backwards', () => {
    const enemy = fighter({ state: 'down', animTime: 50 });
    enemyAnimation(enemy, SPRITE);
    enemy.animTime = 200;
    expect(enemyAnimation(enemy, SPRITE)).toEqual(['ko', 8]);
    expect(enemyAnimation(fighter({ state: 'getup', stateTime: 0 }), SPRITE)).toEqual(['ko', 8]);
    expect(enemyAnimation(fighter({ state: 'getup', stateTime: 15 }), SPRITE)).toEqual(['ko', 5]);
  });

  it("plays a move's own strip on its timeline, holding each frame until the next one starts", () => {
    const move = { id: 'horn', startup: 10, active: 30, recovery: 10, frameAt: [0, 5, 10, 40] };
    const frameAt = (moveTime) =>
      enemyAnimation(fighter({ state: 'attack', move, moveTime }), SPRITE);
    expect(frameAt(0)).toEqual(['horn', 0]);
    expect(frameAt(4)).toEqual(['horn', 0]);
    expect(frameAt(5)).toEqual(['horn', 1]);
    expect(frameAt(39)).toEqual(['horn', 2]);
    expect(frameAt(49)).toEqual(['horn', 3]);
  });

  it('falls back to the attack strip when the sheet has no strip for a timed move', () => {
    const move = { id: 'warHorn', startup: 10, active: 4, recovery: 10, frameAt: [0, 5] };
    expect(enemyAnimation(fighter({ state: 'attack', move, moveTime: 12 }), SPRITE)[0]).toBe(
      'attack',
    );
  });
});
