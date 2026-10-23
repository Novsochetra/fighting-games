import { describe, expect, it } from 'vitest';
import { isTelegraphing } from '../../../src/render/fighters/windup.js';

const windingUp = (move) => ({ side: 'enemy', state: 'attack', moveTime: 18, move });

describe('a wind-up telegraph', () => {
  it('blinks red in the last frames before a blow', () => {
    expect(isTelegraphing(windingUp({ startup: 24 }), 2)).toBe(true);
  });

  it('stays clear while a boss raises a guard, whose own tell is its gold glint', () => {
    expect(isTelegraphing(windingUp({ startup: 24, guard: { glintAt: 24 } }), 2)).toBe(false);
  });
});
