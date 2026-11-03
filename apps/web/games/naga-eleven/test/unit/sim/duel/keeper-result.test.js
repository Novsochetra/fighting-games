import { describe, expect, it } from 'vitest';
import { keeperResult, styleOf } from '../../../../src/sim/duel/keeper-result.js';
import { createRandom } from '../../../../src/sim/random.js';

const draw = (word, defend, seed = 1) =>
  keeperResult({ random: createRandom(seed) }, { word, defend });

describe('a keeper round’s result', () => {
  it('keeps the ball out the way his pick says', () => {
    expect(styleOf({ kind: 'save', move: 'angkor-wall' })).toBe('wall');
    expect(styleOf({ kind: 'save', move: 'mountain-guard' })).toBe('punch');
    expect(styleOf({ kind: 'punch', move: null })).toBe('punch');
    expect(styleOf({ kind: 'catch', move: null })).toBe('catch');
  });

  it('puts a goal inside the posts, a miss outside them, and a save across the goal', () => {
    for (let seed = 1; seed < 40; seed += 1) {
      const goal = draw('goal', { kind: 'catch' }, seed);
      const wide = draw('wide', { kind: 'catch' }, seed);
      const saved = draw('saved', { kind: 'catch' }, seed);

      expect(Math.abs(goal.aim.side)).toBeLessThan(1);
      expect(Math.abs(wide.aim.side)).toBeGreaterThan(1);
      expect(Math.abs(saved.aim.side)).toBeLessThanOrEqual(0.85);
      expect(goal.aim.height).toBeGreaterThanOrEqual(0);
      expect(goal.aim.height).toBeLessThanOrEqual(1);
    }
  });

  it('dives him the way a save goes, sometimes the wrong way for a goal, never for a wall', () => {
    const dives = Array.from({ length: 60 }, (_, i) => draw('goal', { kind: 'catch' }, i + 1));

    expect(dives.some(({ aim, dive }) => dive === Math.sign(aim.side))).toBe(true);
    expect(dives.some(({ aim, dive }) => dive === -Math.sign(aim.side))).toBe(true);

    for (let seed = 1; seed < 20; seed += 1) {
      const saved = draw('saved', { kind: 'catch' }, seed);

      expect(saved.dive === 0 || saved.dive === Math.sign(saved.aim.side)).toBe(true);
      expect(draw('saved', { kind: 'save', move: 'angkor-wall' }, seed).dive).toBe(0);
    }
  });

  it('is drawn the same from the same seed', () => {
    expect(draw('parried', { kind: 'catch' }, 7)).toEqual(draw('parried', { kind: 'catch' }, 7));
  });
});
