import { describe, expect, it } from 'vitest';
import { damageOf } from '../../../src/sim/combat/hit-damage.js';

const game = { settings: { difficulty: 1 } };
const boss = { side: 'enemy', def: { boss: true } };
const raider = { side: 'enemy', def: {} };
const hero = { side: 'player', def: {} };
const ultBlow = { damage: 24, ultimate: true };
const slash = { damage: 10 };

describe("a hit's damage", () => {
  it('halves an ultimate blow on a boss', () => {
    expect(damageOf(game, boss, ultBlow)).toBe(12);
  });

  it('keeps an ultimate blow whole on a raider', () => {
    expect(damageOf(game, raider, ultBlow)).toBe(24);
  });

  it('keeps every other blow whole on a boss', () => {
    expect(damageOf(game, boss, slash)).toBe(10);
  });

  it('doubles a blow on an overheated boss before the ultimate halves it', () => {
    const overheated = { ...boss, move: { exposed: true } };
    expect(damageOf(game, overheated, slash)).toBe(20);
    expect(damageOf(game, overheated, ultBlow)).toBe(24);
  });

  it('scales a blow on the hero by the difficulty', () => {
    expect(damageOf(game, hero, slash)).toBe(10);
    expect(damageOf({ settings: { difficulty: 2 } }, hero, slash)).toBe(14);
  });
});
