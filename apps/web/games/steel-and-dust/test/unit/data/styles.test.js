import { describe, expect, it } from 'vitest';
import { HEROES } from '../../../src/data/heroes.js';
import { MOVE_ORDER } from '../../../src/data/move-list.js';
import { defineMove, normalizeMoves } from '../../../src/data/moves/define-move.js';
import { applyStyle } from '../../../src/data/styles/apply-style.js';
import { heroMoves, STYLES, styleOf } from '../../../src/data/styles/index.js';
import { WEAPONS } from '../../../src/data/weapons/index.js';

const BASE = normalizeMoves({
  L1: defineMove({ name: 'Jab', frames: [8, 2, 10], damage: 10, hitbox: [4, -28, 14, 7] }),
  L2: defineMove({
    name: 'Spin',
    frames: [8, 12, 10],
    damage: 4,
    hitbox: [0, -30, 20, 10],
    multiHit: 4,
  }),
});
const length = (move) => move.startup + move.active + move.recovery;

describe('applyStyle', () => {
  it('leaves a move as it was under an empty style', () => {
    const styled = applyStyle(BASE, { tempo: {}, moves: {} });
    expect(styled.L1).toEqual(BASE.L1);
  });

  it('scales startup, recovery and damage, and reopens the cancel window after the strike', () => {
    const tempo = { startup: 0.5, recovery: 1.5, damage: 1.2, hitstop: 1, reach: 6 };
    const styled = applyStyle(BASE, { tempo, moves: {} }).L1;
    expect(styled).toMatchObject({ startup: 4, active: 2, recovery: 15, damage: 12 });
    expect(styled.hitstop).toBe(BASE.L1.hitstop + 1);
    expect(styled.hitbox).toEqual([4, -28, 20, 7]);
    expect(styled.cancelWindow).toEqual([6, 21]);
  });

  it('adds a signature to the patched move only', () => {
    const styled = applyStyle(BASE, { tempo: {}, moves: { L1: { freeze: 30 } } });
    expect(styled.L1.freeze).toBe(30);
    expect(styled.L2.freeze).toBeUndefined();
  });

  it('turns a single strike into a weaker flurry but keeps a multi-hit move as it is', () => {
    const styled = applyStyle(BASE, { tempo: {}, moves: { L1: { flurry: 3 }, L2: { flurry: 3 } } });
    expect(styled.L1).toMatchObject({ active: 9, multiHit: 3, damage: 6 });
    expect(Math.ceil(styled.L1.active / styled.L1.multiHit)).toBe(3);
    expect(styled.L2).toMatchObject({ active: 12, multiHit: 4, damage: 4 });
  });
});

describe('the Shades fight in their own styles', () => {
  it('gives every Shade a named style', () => {
    expect(Object.keys(STYLES)).toEqual(HEROES.map((hero) => hero.id));
    expect(new Set(Object.values(STYLES).map((style) => style.name)).size).toBe(4);
    expect(styleOf('nobody')).toBe(STYLES.moss);
  });

  it('gives every Shade every move of every weapon, chained only into moves that exist', () => {
    const movesets = HEROES.flatMap((hero) =>
      Object.keys(WEAPONS).map((weaponId) => [
        `${hero.id} ${weaponId}`,
        heroMoves(hero.id, weaponId),
      ]),
    );
    for (const [label, moves] of movesets) {
      expect(Object.keys(moves).sort(), label).toEqual([...MOVE_ORDER].sort());
      const chained = Object.values(moves).flatMap((move) => Object.values(move.next));
      expect(
        chained.filter((next) => !moves[next]),
        label,
      ).toEqual([]);
    }
  });

  it('keeps the Moss Shade on the weapon timing, with brambles on its finishers', () => {
    const moves = heroMoves('moss', 'sword');
    expect(moves.L1).toEqual(WEAPONS.sword.moves.L1);
    expect([moves.L4.thorns, moves.K3.thorns, moves.C2.thorns]).toEqual([1, 3, 4]);
  });

  it('makes the Firefly Shade quickest and the Antler Spirit Shade slowest and heaviest', () => {
    for (const weaponId of Object.keys(WEAPONS)) {
      const firefly = heroMoves('firefly', weaponId).L1;
      const moss = heroMoves('moss', weaponId).L1;
      const antler = heroMoves('antler', weaponId).L1;
      expect(length(firefly)).toBeLessThan(length(moss));
      expect(length(antler)).toBeGreaterThan(length(moss));
      expect(antler.damage).toBeGreaterThan(firefly.damage);
    }
  });

  it('gives each Shade its own signature moves', () => {
    expect(heroMoves('firefly', 'fists').L3.multiHit).toBe(3);
    expect(heroMoves('firefly', 'sword').L4.fireflies).toBe(2);
    expect(heroMoves('antler', 'fists').L3).toMatchObject({ armor: true, stags: 1 });
    expect(heroMoves('antler', 'sword').K1).toMatchObject({ armor: true, shockwave: true });
    expect(heroMoves('blue', 'spear').K1.freeze).toBe(36);
    expect(heroMoves('blue', 'sword').L1.hitbox[2]).toBe(WEAPONS.sword.moves.L1.hitbox[2] + 8);
  });
});
