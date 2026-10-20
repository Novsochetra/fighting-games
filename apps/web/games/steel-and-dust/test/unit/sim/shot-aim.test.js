import { describe, expect, it } from 'vitest';
import { GROUND_Y } from '../../../src/config.js';
import { diveToward, reverseDive } from '../../../src/sim/hazards/shot-aim.js';

const fighter = (x, y = GROUND_Y) => ({ x, y });

describe('a shot fired at the hero', () => {
  it('flies flat between fighters on one level, or up at a hero above', () => {
    const shot = { x: 110, speed: 3.1 };
    expect(diveToward(fighter(100), fighter(200), shot)).toBe(0);
    expect(diveToward(fighter(100, GROUND_Y - 6), fighter(200), shot)).toBe(0);
    expect(diveToward(fighter(100), fighter(200, GROUND_Y - 36), shot)).toBe(0);
  });

  it('dives from higher ground to meet the hero at the height it left at', () => {
    const shot = { x: 220, speed: 3.1 };
    const vy = diveToward(fighter(210, GROUND_Y - 36), fighter(320), shot);
    const ticks = (320 - 220) / 3.1;
    expect(vy * ticks).toBeCloseTo(36);
  });

  it('never dives steeper than one and a half times its speed', () => {
    const shot = { x: 212, speed: 5.4 };
    expect(diveToward(fighter(200, GROUND_Y - 40), fighter(215), shot)).toBe(1.5 * 5.4);
  });
});

describe('a deflected shot', () => {
  it('goes back up the line it came down', () => {
    const knife = { vy: 1.2, speed: 3 };
    reverseDive(knife, 4.5);
    expect(knife.vy).toBeCloseTo(-1.8);
  });

  it('stays flat when it flew flat', () => {
    const knife = { speed: 3.1 };
    reverseDive(knife, 4.6);
    expect(knife.vy).toBeUndefined();
    const bolt = { vy: 0, speed: 5.4 };
    reverseDive(bolt, 4.6);
    expect(bolt.vy).toBe(0);
  });
});
