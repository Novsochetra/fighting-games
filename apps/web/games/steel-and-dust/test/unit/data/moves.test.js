import { describe, expect, it } from 'vitest';
import { ENEMY_TYPES } from '../../../src/data/enemies/enemy-types.js';
import { ENEMY_MOVES } from '../../../src/data/enemies/enemy-moves.js';
import { MOVE_ORDER } from '../../../src/data/move-list.js';
import { defineMove, normalizeMoves } from '../../../src/data/moves/define-move.js';
import { WEAPONS } from '../../../src/data/weapons/index.js';

describe('defineMove', () => {
  it('derives hitstop from damage', () => {
    const stop = (damage) => defineMove({ name: 'x', frames: [1, 1, 1], damage }).hitstop;
    expect([stop(4), stop(7), stop(10), stop(14)]).toEqual([5, 7, 9, 11]);
  });

  it('derives hitstun and keeps extra fields', () => {
    const move = defineMove({ name: 'Jab', frames: [4, 2, 9], damage: 4, forward: 0.6 });
    expect(move).toMatchObject({ startup: 4, active: 2, recovery: 9, hitstun: 16, forward: 0.6 });
  });

  it('names moves, marks aerial ones and opens the cancel window after the strike', () => {
    const moves = normalizeMoves({
      L1: defineMove({ name: 'a', frames: [4, 2, 9], damage: 4 }),
      AL: defineMove({ name: 'b', frames: [5, 3, 10], damage: 5 }),
    });
    expect(moves.L1).toMatchObject({ id: 'L1', aerial: false, cancelWindow: [6, 15] });
    expect(moves.AL.aerial).toBe(true);
  });
});

describe('move tables', () => {
  it('give every weapon every move in the move list', () => {
    for (const weapon of Object.values(WEAPONS)) {
      expect(Object.keys(weapon.moves).sort()).toEqual([...MOVE_ORDER].sort());
    }
  });

  it('only chain into moves that exist', () => {
    for (const weapon of Object.values(WEAPONS)) {
      for (const move of Object.values(weapon.moves)) {
        for (const next of Object.values(move.next)) {
          expect(weapon.moves[next], `${weapon.name} ${move.name} -> ${next}`).toBeDefined();
        }
      }
    }
  });

  it('give enemies their own moves', () => {
    expect(Object.keys(ENEMY_MOVES)).toEqual([
      'punch',
      'stab',
      'lunge',
      'swipe',
      'slam',
      'toss',
      'bash',
      'charge',
      'pipe',
      'claw',
      'pounce',
      'crosscut',
      'spear',
      'haymaker',
      'sting',
      'lob',
      'bolt',
      'spit',
      'sandblast',
      'crescentDash',
      'warHorn',
      'tempest',
      'boulderLob',
      'spikeLine',
      'spikeCross',
      'landslide',
      'hornRush',
      'uppercut',
      'dazed',
      'dazedLong',
      'stampede',
      'stampedeBack',
      'stampedeLast',
      'venomSpit',
      'venomSpray',
      'coilLash',
      'hypnoticGaze',
    ]);
  });

  it('give every enemy type a basic, lunge and ranged move that exists', () => {
    for (const def of Object.values(ENEMY_TYPES)) {
      for (const id of [def.attackMove, def.lungeMove, def.rangedMove].filter(Boolean)) {
        expect(ENEMY_MOVES[id], `${def.name}: ${id}`).toBeDefined();
      }
    }
  });
});
