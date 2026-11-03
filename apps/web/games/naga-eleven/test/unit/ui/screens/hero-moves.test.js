import { describe, expect, it } from 'vitest';
import { heroMoves, kindString, moveName } from '../../../../src/ui/screens/hero-moves.js';

describe('Sochetra’s moves on his sheet', () => {
  it('lists the moves he has first, then his sleeping ones, each in the story’s order', () => {
    const moves = heroMoves({ moves: ['power-shot', 'hanuman-leap'] });

    expect(moves.map((move) => [move.id, move.known])).toEqual([
      ['hanuman-leap', true],
      ['power-shot', true],
      ['naga-shot', false],
      ['garuda-volley', false],
      ['twin-naga', false],
      ['seven-headed-naga', false],
    ]);
  });

  it('gives each its kind and spirit cost', () => {
    const [naga] = heroMoves({ moves: ['naga-shot'] });

    expect(naga).toMatchObject({ kind: 'shot', cost: 40, name: { en: 'Naga Shot' } });
  });

  it('shows all his own moves asleep before he has any', () => {
    expect(heroMoves(null).every((move) => !move.known)).toBe(true);
    expect(heroMoves(null)).toHaveLength(5);
  });

  it('names each kind of move, and a move by its id', () => {
    expect(kindString('dribble')).toBe('kindDribble');
    expect(kindString('mystery')).toBe('kindShot');
    expect(moveName('iron-gate')).toEqual({ en: 'Iron Gate', km: 'ទ្វារដែក' });
    expect(moveName('no-such-move')).toBe('no-such-move');
  });
});
