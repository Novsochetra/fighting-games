import { describe, expect, it } from 'vitest';
import {
  EFFECT_SHAPES,
  EFFECT_TICKS,
  MOVE_EFFECTS,
  PLAY_EFFECTS,
} from '../../../src/data/move-effects.js';
import { MOVES } from '../../../src/data/moves.js';
import { SKILL_PLAY } from '../../../src/data/skills.js';

const PARTS = ['trail', 'aura', 'impact'];

const effectOf = (move) => ({ ...PLAY_EFFECTS[move.play], ...MOVE_EFFECTS[move.id] });

describe('how the moves read on the pitch', () => {
  it('give every play a trail, an aura and an impact of the shapes there are', () => {
    expect(Object.keys(PLAY_EFFECTS).sort()).toEqual(Object.keys(SKILL_PLAY).sort());

    for (const [play, effect] of Object.entries(PLAY_EFFECTS)) {
      expect(['ball', 'player'], play).toContain(effect.follows);

      for (const part of PARTS) {
        expect([...EFFECT_SHAPES[part], null], `${play} ${part}`).toContain(effect[part]);
      }
    }
  });

  it('change only the parts a move names, of moves there are, to shapes there are', () => {
    for (const [id, effect] of Object.entries(MOVE_EFFECTS)) {
      expect(MOVES[id], id).toBeDefined();
      expect(
        Object.keys(effect).every((part) => PARTS.includes(part)),
        id,
      ).toBe(true);

      for (const [part, shape] of Object.entries(effect)) {
        expect(EFFECT_SHAPES[part], `${id} ${part}`).toContain(shape);
      }
    }
  });

  it('leave a trail behind every shot, so none flies in plain', () => {
    const shots = Object.values(MOVES).filter((move) => move.kind === 'shot');

    expect(shots.every((move) => effectOf(move).trail)).toBe(true);
  });

  it('give the stars their own: the Naga coils, Garuda wings, the moon its arc', () => {
    expect(effectOf(MOVES['naga-shot']).trail).toBe('coils');
    expect(effectOf(MOVES['garuda-volley']).trail).toBe('wings');
    expect(effectOf(MOVES['silent-moon']).trail).toBe('arc');
    expect(effectOf(MOVES['carnival-rocket']).trail).toBe('flame');
  });

  it('use every shape somewhere, and last a moment each', () => {
    const used = Object.values(MOVES).map(effectOf);

    for (const part of PARTS) {
      const shapes = new Set(used.map((effect) => effect[part]));

      expect(
        EFFECT_SHAPES[part].filter((shape) => !shapes.has(shape)),
        part,
      ).toEqual([]);
    }

    expect(Object.values(EFFECT_TICKS).every((ticks) => ticks >= 12 && ticks <= 60)).toBe(true);
  });
});
