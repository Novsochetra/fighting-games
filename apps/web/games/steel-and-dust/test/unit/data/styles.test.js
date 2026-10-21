import { describe, expect, it } from 'vitest';
import { HEROES } from '../../../src/data/heroes.js';
import { MOVE_ORDER, TECHNIQUE_ORDER } from '../../../src/data/move-list.js';
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

  it("marks every move of the style's chosen weapon, techniques included, and no other weapon's", () => {
    const style = { tempo: {}, moves: {}, weapons: { spear: { feathers: true } } };
    const spear = applyStyle(BASE, style, 'spear');
    expect([spear.L1.feathers, spear.L2.feathers]).toEqual([true, true]);
    expect(applyStyle(BASE, style, 'sword').L1.feathers).toBeUndefined();
    expect(heroMoves('ember', 'spear').S3.feathers).toBe(true);
  });

  it('adds techniques as they are, linked off a heavy only where its light was free', () => {
    const chop = { frames: [8, 2, 10], damage: 10, hitbox: [4, -28, 14, 7] };
    const base = normalizeMoves({
      K1: defineMove({ ...chop, name: 'Chop', next: { heavy: 'K2' } }),
      K2: defineMove({ ...chop, name: 'Chop again', next: { light: 'K1' } }),
    });
    const snare = defineMove({
      name: 'Snare',
      frames: [6, 2, 12],
      damage: 8,
      hitbox: [0, -8, 20, 8],
    });
    const style = { tempo: { damage: 2 }, moves: {}, techniques: { S1: snare, S2: snare } };
    const styled = applyStyle(base, style);
    expect(styled.K1.next).toEqual({ heavy: 'K2', light: 'S1' });
    expect(styled.K2.next).toEqual({ light: 'K1' });
    expect(styled.S1).toMatchObject({
      id: 'S1',
      technique: true,
      damage: 8,
      cancelWindow: [8, 20],
    });
    expect(base.K1.next).toEqual({ heavy: 'K2' });
    expect(snare.id).toBeUndefined();
  });
});

describe('the Shades fight in their own styles', () => {
  it('gives every Shade a named style', () => {
    expect(Object.keys(STYLES)).toEqual(HEROES.map((hero) => hero.id));
    expect(new Set(Object.values(STYLES).map((style) => style.name)).size).toBe(5);
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
      expect(Object.keys(moves).sort(), label).toEqual([...MOVE_ORDER, ...TECHNIQUE_ORDER].sort());
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
    expect(heroMoves('ember', 'sword').L4.pillars).toBe(2);
    expect(heroMoves('ember', 'axe').K3).toMatchObject({ pillars: 3, burn: 150 });
    expect(heroMoves('ember', 'spear').L1.feathers).toBe(true);
    expect(heroMoves('ember', 'sword').L1.feathers).toBeUndefined();
    expect(heroMoves('moss', 'spear').L1.feathers).toBeUndefined();
  });

  it('gives each Shade four techniques of its own, branching off the heavies of every weapon', () => {
    const names = HEROES.flatMap((hero) =>
      TECHNIQUE_ORDER.map((id) => heroMoves(hero.id, 'sword')[id].name),
    );
    expect(new Set(names).size).toBe(20);
    for (const weaponId of Object.keys(WEAPONS)) {
      const moves = heroMoves('blue', weaponId);
      expect(['K1', 'K2', 'K3', 'AK'].map((id) => moves[id].next.light)).toEqual(TECHNIQUE_ORDER);
      expect(moves.S3).toMatchObject({ name: 'Shatterpoint', shatters: true });
      expect(moves.AS.aerial).toBe(true);
    }
    expect(heroMoves('moss', 'axe').S3).toMatchObject({ thorns: 2, thornRing: true });
    expect(heroMoves('antler', 'spear').S3.quakeDamage).toBe(10);
    expect(heroMoves('firefly', 'fists').S3.fireflies).toBe(6);
    expect(heroMoves('ember', 'spear').S1).toMatchObject({
      name: 'Cinder Sweep',
      low: true,
      burn: 180,
    });
    expect(heroMoves('ember', 'fists').S3).toMatchObject({ pillars: 1, pillarRing: true });
  });
});
